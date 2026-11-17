using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace streetgo_cyber_agent;

public class Worker(
    ILogger<Worker> logger,
    IConfiguration configuration,
    PairingCodeInput pairingCodeInput,
    AgentStatus agentStatus
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        string baseUrl = configuration["StreetGO:BaseUrl"]?.TrimEnd('/')
            ?? throw new InvalidOperationException("StreetGO BaseUrl is missing.");

        string customerBaseUrl = configuration["StreetGO:CustomerBaseUrl"]?.TrimEnd('/')
            ?? $"{baseUrl}/cyber/customer";

        int interval = configuration.GetValue<int>(
            "StreetGO:HeartbeatIntervalSeconds", 10);

        using HttpClient client = new HttpClient();
        client.Timeout = TimeSpan.FromSeconds(20);

        string? credential = CredentialStore.Load();

        if (string.IsNullOrWhiteSpace(credential))
        {
            string? code = pairingCodeInput.Code?.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(code) ||
                !System.Text.RegularExpressions.Regex.IsMatch(code, "^[A-F0-9]{32}$"))
            {
                logger.LogError("Invalid or missing pairing code.");
                return;
            }

            try
            {
                var response = await client.PostAsJsonAsync(
                    $"{baseUrl}/api/cyber/pairing/redeem",
                    new { code },
                    stoppingToken
                );

                if (!response.IsSuccessStatusCode)
                {
                    string errorBody = await response.Content.ReadAsStringAsync(stoppingToken);
                    logger.LogError("Pairing failed. HTTP {StatusCode}: {Error}",
                        (int)response.StatusCode, errorBody);
                    return;
                }

                using var result = await JsonDocument.ParseAsync(
                    await response.Content.ReadAsStreamAsync(stoppingToken),
                    cancellationToken: stoppingToken
                );

                credential = result.RootElement.GetProperty("credential").GetString();

                if (string.IsNullOrWhiteSpace(credential) ||
                    !System.Text.RegularExpressions.Regex.IsMatch(credential, "^[a-f0-9]{64}$"))
                {
                    logger.LogError("The server returned an invalid credential.");
                    return;
                }

                CredentialStore.Save(credential);
                logger.LogInformation("Computer paired and credential encrypted.");
                agentStatus.SetStatus("Paired successfully. Connecting...");
            }
            catch (Exception ex) when (
                ex is HttpRequestException or TaskCanceledException or JsonException)
            {
                logger.LogError(ex, "Unable to complete device pairing.");
                return;
            }
        }

        string? kioskToken = null;
        DateTimeOffset nextKioskRenewal = DateTimeOffset.UtcNow.AddMinutes(15);

        // Obtain a short-lived customer token without exposing the permanent credential.
        try
        {
            using var tokenRequest = new HttpRequestMessage(
                HttpMethod.Post,
                $"{baseUrl}/api/cyber/device/kiosk-token"
            );

            tokenRequest.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", credential);

            using var tokenResponse = await client.SendAsync(tokenRequest, stoppingToken);

            if (tokenResponse.IsSuccessStatusCode)
            {
                using var tokenResult = await JsonDocument.ParseAsync(
                    await tokenResponse.Content.ReadAsStreamAsync(stoppingToken),
                    cancellationToken: stoppingToken
                );

                kioskToken = tokenResult.RootElement
                    .GetProperty("kiosk_token").GetString();

                if (!string.IsNullOrWhiteSpace(kioskToken) &&
                    System.Text.RegularExpressions.Regex.IsMatch(kioskToken, "^[a-f0-9]{64}$"))
                {
                    string customerUrl =
                        $"{customerBaseUrl}/cyber/customer?token={Uri.EscapeDataString(kioskToken)}";

                    Process.Start(new ProcessStartInfo
                    {
                        FileName = customerUrl,
                        UseShellExecute = true
                    });

                    logger.LogInformation("Customer page opened for this computer.");
                }
                else
                {
                    logger.LogWarning("StreetGO returned an invalid customer token.");
                }
            }
            else
            {
                logger.LogWarning("Unable to obtain customer access. HTTP {StatusCode}",
                    (int)tokenResponse.StatusCode);
            }
        }
        catch (Exception ex) when (
            ex is HttpRequestException or TaskCanceledException or JsonException or
            InvalidOperationException or System.ComponentModel.Win32Exception)
        {
            logger.LogWarning(ex, "Unable to open the customer page.");
        }

        logger.LogInformation("StreetGO Cyber agent is running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(kioskToken) &&
                    DateTimeOffset.UtcNow >= nextKioskRenewal)
                {
                    try
                    {
                        using var renewalRequest = new HttpRequestMessage(
                            HttpMethod.Post,
                            $"{baseUrl}/api/cyber/device/kiosk-token/renew"
                        );

                        renewalRequest.Headers.Authorization =
                            new AuthenticationHeaderValue("Bearer", credential);

                        renewalRequest.Content = JsonContent.Create(
                            new { kiosk_token = kioskToken });

                        using var renewalResponse = await client.SendAsync(
                            renewalRequest, stoppingToken);

                        if (renewalResponse.IsSuccessStatusCode)
                        {
                            nextKioskRenewal = DateTimeOffset.UtcNow.AddMinutes(15);
                            logger.LogInformation("Customer access token renewed.");
                        }
                        else
                        {
                            nextKioskRenewal = DateTimeOffset.UtcNow.AddMinutes(1);
                            logger.LogWarning(
                                "Kiosk token renewal failed. HTTP {StatusCode}; retrying in one minute.",
                                (int)renewalResponse.StatusCode);
                        }
                    }
                    catch (Exception ex) when (
                        ex is HttpRequestException or TaskCanceledException or JsonException)
                    {
                        nextKioskRenewal = DateTimeOffset.UtcNow.AddMinutes(1);
                        logger.LogWarning(ex, "Kiosk token renewal failed; retrying in one minute.");
                    }
                }

                using var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{baseUrl}/api/cyber/device/heartbeat"
                );

                request.Headers.Authorization =
                    new AuthenticationHeaderValue("Bearer", credential);

                using var response = await client.SendAsync(request, stoppingToken);

                if (response.IsSuccessStatusCode)
                {
                    using var result = await JsonDocument.ParseAsync(
                        await response.Content.ReadAsStreamAsync(stoppingToken),
                        cancellationToken: stoppingToken
                    );

                    agentStatus.SetStatus("Connected to StreetGO. Computer is online.");

                    var root = result.RootElement;
                    string command = root.GetProperty("command").GetString() ?? "unknown";
                    int remaining = root.GetProperty("remaining_seconds").GetInt32();

                    logger.LogInformation(
                        "StreetGO command: {Command}; remaining seconds: {Remaining}",
                        command, remaining);
                }
                else
                {
                    string errorBody = await response.Content.ReadAsStringAsync(stoppingToken);
                    logger.LogWarning("Heartbeat rejected. HTTP {StatusCode}: {Error}",
                        (int)response.StatusCode, errorBody);
                }
            }
            catch (Exception ex) when (
                ex is HttpRequestException or TaskCanceledException or JsonException)
            {
                agentStatus.SetStatus("Connection lost. Reconnecting...");
                logger.LogWarning(ex, "Heartbeat request failed.");
            }

            await Task.Delay(
                TimeSpan.FromSeconds(Math.Clamp(interval, 5, 60)),
                stoppingToken);
        }
    }
}




