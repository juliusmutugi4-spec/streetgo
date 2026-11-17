using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace streetgo_cyber_agent;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        if (args.Contains("--diagnose-credential"))
        {
            try
            {
                string? credential = CredentialStore.Load();

                Console.WriteLine($"Credential exists: {!string.IsNullOrWhiteSpace(credential)}");
                Console.WriteLine($"Credential length: {credential?.Length ?? 0}");

                bool valid = credential != null &&
                    Regex.IsMatch(credential, "^[a-f0-9]{64}$");

                Console.WriteLine($"Credential format valid: {valid}");

                if (valid)
                {
                    string hash = Convert.ToHexString(
                        SHA256.HashData(Encoding.UTF8.GetBytes(credential!))
                    ).ToLowerInvariant();

                    File.WriteAllText(
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "StreetGO-Credential-Diagnostic.txt"),
        $"Credential exists: {credential != null}`r`nCredential length: {credential?.Length ?? 0}`r`nCredential format valid: {valid}`r`nSHA256: {hash}"
    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Credential diagnostic failed: {ex.GetType().Name}");
            }

            return;
        }

        ApplicationConfiguration.Initialize();

        if (args.Contains("--test-pairing-window"))
        {
            using var testForm = new PairingForm();
            testForm.ShowDialog();
            return;
        }

        string? pairingCode = null;

        if (string.IsNullOrWhiteSpace(CredentialStore.Load()))
        {
            using var form = new PairingForm();

            if (form.ShowDialog() != DialogResult.OK)
                return;

            pairingCode = form.PairingCode;
        }

        var builder = Host.CreateApplicationBuilder(args);

        var agentStatus = new AgentStatus();

        builder.Services.AddSingleton(agentStatus);
        builder.Services.AddSingleton(new PairingCodeInput(pairingCode));
        builder.Services.AddHostedService<Worker>();

        using var host = builder.Build();

        host.Start();

        using var statusForm = new StatusForm(agentStatus);
        Application.Run(statusForm);

        host.StopAsync().GetAwaiter().GetResult();
    }
}

public sealed class PairingCodeInput(string? code)
{
    public string? Code { get; } = code;
}


