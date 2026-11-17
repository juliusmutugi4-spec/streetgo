namespace streetgo_cyber_agent;

public sealed class AgentStatus
{
    public event Action<string>? StatusChanged;

    public void SetStatus(string message)
    {
        StatusChanged?.Invoke(message);
    }
}
