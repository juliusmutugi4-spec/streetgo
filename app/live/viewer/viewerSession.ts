const API_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL!;

export type LiveSession = {
  live_id: string;
  title: string;
  description?: string | null;
  host_id: string;
  host_name: string;
  location?: string | null;
  status: string;
  viewer_count: number;
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
};

export async function findLiveSession(): Promise<LiveSession | null> {
  if (!navigator.onLine) {
    throw new Error(
      "You are offline. Waiting for your internet connection..."
    );
  }

  const response =
    await fetch(
      `${API_URL}/live`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      `Failed to load live sessions: ${response.status}`
    );
  }

  const result =
    await response.json();

  const sessions:
    LiveSession[] =
    result.live ?? [];

  const activeSession =
    sessions.find(
      (session) =>
        session.status === "live"
    );

  return activeSession ?? null;
}