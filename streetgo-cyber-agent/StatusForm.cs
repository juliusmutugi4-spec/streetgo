using System.Drawing;
using System.Windows.Forms;

namespace streetgo_cyber_agent;

public sealed class StatusForm : Form
{
    private readonly Label statusLabel;
    private readonly NotifyIcon trayIcon;
    private bool allowExit;

    public StatusForm(AgentStatus agentStatus)
    {
        Text = "StreetGO Cyber Agent";
        Width = 440;
        Height = 230;
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;

        var heading = new Label
        {
            Text = "StreetGO Cyber",
            Font = new Font("Segoe UI", 19, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(28, 25)
        };

        statusLabel = new Label
        {
            Text = "Starting agent...",
            Font = new Font("Segoe UI", 11),
            AutoSize = true,
            Location = new Point(30, 95)
        };

        var footer = new Label
        {
            Text = "This computer is managed by StreetGO.",
            Font = new Font("Segoe UI", 8),
            ForeColor = Color.Gray,
            AutoSize = true,
            Location = new Point(30, 155)
        };

        Controls.Add(heading);
        Controls.Add(statusLabel);
        Controls.Add(footer);

        agentStatus.StatusChanged += UpdateStatus;

        var openItem = new ToolStripMenuItem("Open StreetGO");
        openItem.Click += (_, _) => ShowWindow();

        var exitItem = new ToolStripMenuItem("Exit StreetGO");
        exitItem.Click += (_, _) =>
        {
            allowExit = true;
            trayIcon!.Visible = false;
            Application.Exit();
        };

        var menu = new ContextMenuStrip();
        menu.Items.Add(openItem);
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add(exitItem);

        trayIcon = new NotifyIcon
        {
            Text = "StreetGO Cyber Agent",
            Icon = SystemIcons.Application,
            ContextMenuStrip = menu,
            Visible = true
        };

        trayIcon.DoubleClick += (_, _) => ShowWindow();

        FormClosing += (_, e) =>
        {
            if (!allowExit && e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                Hide();
            }
        };

        Resize += (_, _) =>
        {
            if (WindowState == FormWindowState.Minimized)
                Hide();
        };

        Disposed += (_, _) =>
        {
            trayIcon!.Visible = false;
            trayIcon.Dispose();
            menu.Dispose();
        };
    }

    private void UpdateStatus(string message)
    {
        if (IsDisposed || !IsHandleCreated)
            return;

        if (InvokeRequired)
        {
            try
            {
                BeginInvoke(() => UpdateStatus(message));
            }
            catch (InvalidOperationException)
            {
                // The window is closing.
            }

            return;
        }

        statusLabel.Text = message;
    }

    private void ShowWindow()
    {
        if (IsDisposed)
            return;

        Show();
        WindowState = FormWindowState.Normal;
        Activate();
    }
}

