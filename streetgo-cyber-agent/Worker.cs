using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace streetgo_cyber_agent;

public class Worker(
    ILogger<Worker> logger,
    IConfiguration configuration
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        string baseUrl = configuration["StreetGO:BaseUrl"]?.TrimEnd('/')
            ?? throw new InvalidOperationException("StreetGO BaseUrl is missing.");

        int interval = configuration.GetValue<int>(
            "StreetGO:HeartbeatIntervalSeconds", 10);

        using HttpClient client = new HttpClient();
        client.Timeout = TimeSpan.FromSeconds(20);

        string? credential = CredentialStore.Load();

        if (string.IsNullOrWhiteSpace(credential))
        {
            Console.Write("Enter the 32-character StreetGO pairing code: ");
            string? code = Console.ReadLine()?.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(code) ||
                !System.Text.RegularExpressions.Regex.IsMatch(code, "^[A-F0-9]{32}$"))
            {
                logger.LogError("Invalid pairing code.");
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
                    logger.LogError("Pairing failed. HTTP {StatusCode}",
                        (int)response.StatusCode);
                    return;
                }

                using var result = await JsonDocument.ParseAsync(
                    await response.Content.ReadAsStreamAsync(stoppingToken),
                    cancellationToken: stoppingToken
                );

                credential = result.RootElement
                    .GetProperty("credential").GetString();

                if (string.IsNullOrWhiteSpace(credential) ||
                    !System.Text.RegularExpressions.Regex.IsMatch(
                        credential, "^[a-f0-9]{64}$"))
                {
                    logger.LogError("The server returned an invalid credential.");
                    return;
                }

                CredentialStore.Save(credential);
                logger.LogInformation("Computer paired and credential encrypted.");
            }
            catch (Exception ex) when (
                ex is HttpRequestException or TaskCanceledException or JsonException)
            {
                logger.LogError(ex, "Unable to complete device pairing.");
                return;
            }
        }

        logger.LogInformation("StreetGO Cyber agent is running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
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

                    var root = result.RootElement;
                    string command = root.GetProperty("command").GetString() ?? "unknown";
                    int remaining = root.GetProperty("remaining_seconds").GetInt32();

                    logger.LogInformation(
                        "StreetGO command: {Command}; remaining seconds: {Remaining}",
                        command, remaining);
                }
                else
                {
                    logger.LogWarning("Heartbeat rejected. HTTP {StatusCode}",
                        (int)response.StatusCode);
                }
            }
            catch (Exception ex) when (
                ex is HttpRequestException or TaskCanceledException or JsonException)
            {
                logger.LogWarning(ex, "Heartbeat request failed.");
            }

            await Task.Delay(
                TimeSpan.FromSeconds(Math.Clamp(interval, 5, 60)),
                stoppingToken);
        }
    }
}
