using System.Security.Cryptography;
using System.Text;

namespace streetgo_cyber_agent;

public static class CredentialStore
{
    private static readonly string Folder = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "StreetGO",
        "CyberAgent"
    );

    private static readonly string FilePath =
        Path.Combine(Folder, "credential.bin");

    public static void Save(string credential)
    {
        if (!OperatingSystem.IsWindows())
            throw new PlatformNotSupportedException("Windows is required.");

        Directory.CreateDirectory(Folder);

        byte[] encrypted = ProtectedData.Protect(
            Encoding.UTF8.GetBytes(credential),
            null,
            DataProtectionScope.CurrentUser
        );

        File.WriteAllBytes(FilePath, encrypted);
    }

    public static string? Load()
    {
        if (!File.Exists(FilePath))
            return null;

        byte[] encrypted = File.ReadAllBytes(FilePath);

        byte[] decrypted = ProtectedData.Unprotect(
            encrypted,
            null,
            DataProtectionScope.CurrentUser
        );

        return Encoding.UTF8.GetString(decrypted);
    }

    public static bool Exists() => File.Exists(FilePath);
}
