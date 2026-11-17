using System.Text.RegularExpressions;
using System.Drawing;
using System.Windows.Forms;

namespace streetgo_cyber_agent;

public sealed class PairingForm : Form
{
    private readonly TextBox codeInput;
    private readonly Label statusLabel;

    public string PairingCode => codeInput.Text.Trim().ToUpperInvariant();

    public PairingForm()
    {
        Text = "StreetGO Cyber";
        Size = new Size(500, 365);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = true;
        BackColor = Color.White;
        Font = new Font("Segoe UI", 10);

        var heading = new Label
        {
            Text = "Connect your computer",
            Font = new Font("Segoe UI", 20, FontStyle.Bold),
            ForeColor = Color.FromArgb(20, 35, 60),
            Location = new Point(30, 28),
            AutoSize = true
        };

        var description = new Label
        {
            Text = "Open your StreetGO Cyber dashboard, select this computer and generate a pairing code.",
            Location = new Point(34, 88),
            Size = new Size(420, 55),
            ForeColor = Color.DimGray
        };

        var codeLabel = new Label
        {
            Text = "32-CHARACTER PAIRING CODE",
            Location = new Point(35, 155),
            AutoSize = true,
            Font = new Font("Segoe UI", 9, FontStyle.Bold),
            ForeColor = Color.FromArgb(70, 80, 95)
        };

        codeInput = new TextBox
        {
            Location = new Point(35, 182),
            Size = new Size(415, 38),
            MaxLength = 32,
            CharacterCasing = CharacterCasing.Upper,
            Font = new Font("Consolas", 15),
            PlaceholderText = "Paste your pairing code here"
        };

        statusLabel = new Label
        {
            Location = new Point(35, 225),
            Size = new Size(415, 25),
            ForeColor = Color.Firebrick
        };

        var connectButton = new Button
        {
            Text = "Connect Computer",
            Location = new Point(35, 265),
            Size = new Size(415, 43),
            BackColor = Color.FromArgb(22, 101, 52),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 11, FontStyle.Bold),
            Cursor = Cursors.Hand
        };

        connectButton.FlatAppearance.BorderSize = 0;

        connectButton.Click += (_, _) =>
        {
            string code = PairingCode;

            if (!Regex.IsMatch(code, "^[A-F0-9]{32}$"))
            {
                statusLabel.Text = "Please enter a valid 32-character code.";
                return;
            }

            DialogResult = DialogResult.OK;
            Close();
        };

        Controls.AddRange([
            heading,
            description,
            codeLabel,
            codeInput,
            statusLabel,
            connectButton
        ]);

        AcceptButton = connectButton;
    }
}
