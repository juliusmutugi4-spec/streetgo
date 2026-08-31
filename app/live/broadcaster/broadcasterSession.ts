import { getSupabaseBrowser } from "../../lib/supabase-browser";

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

type Profile = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

type LiveResponse = {
  success: boolean;
  live: LiveSession;
};

/*
 * ============================================================
 * GET LIVE SESSION
 * ============================================================
 */

export async function getLiveSession(
  id: string
): Promise<LiveSession> {
  const response =
    await fetch(
      `${API_URL}/live/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      `Unable to get live session ${response.status}: ${text}`
    );
  }

  const result =
    (await response.json()) as LiveResponse;

  if (
    !result?.success ||
    !result?.live
  ) {
    throw new Error(
      "Backend did not return a valid live session."
    );
  }

  return result.live;
}

/*
 * ============================================================
 * CREATE LIVE SESSION
 * ============================================================
 */

export async function createLiveSession(): Promise<string> {
  const supabase =
    getSupabaseBrowser();

  const {
    data: {
      session,
    },
    error: authError,
  } =
    await supabase.auth.getSession();

  if (authError) {
    throw new Error(
      `Unable to get current user: ${authError.message}`
    );
  }

  const user =
    session?.user ?? null;

  if (!user?.id) {
    throw new Error(
      "You must be logged in to start a live broadcast."
    );
  }

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        username,
        avatar_url
      `)
      .eq("id", user.id)
      .single();

  if (profileError) {
    throw new Error(
      `Unable to load your StreetGO profile: ${profileError.message}`
    );
  }

  if (!profile) {
    throw new Error(
      "StreetGO profile not found for the logged-in user."
    );
  }

  const broadcasterProfile =
    profile as Profile;

  if (
    !broadcasterProfile.username ||
    broadcasterProfile.username.trim() === ""
  ) {
    throw new Error(
      "Your StreetGO profile does not have a username."
    );
  }

  const response =
    await fetch(
      `${API_URL}/live/create`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          title:
            "StreetGo Live Camera",

          description:
            "",

          host_id:
            user.id,

          host_name:
            broadcasterProfile.username,

          location:
            null,
        }),
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      `Unable to create live session ${response.status}: ${text}`
    );
  }

  const result =
    await response.json();

  const liveId =
    result?.live?.live_id;

  if (!liveId) {
    throw new Error(
      "Backend created the live session but did not return a live_id."
    );
  }

  return liveId;
}

/*
 * ============================================================
 * START LIVE SESSION
 * ============================================================
 */

export async function startLiveSession(
  id: string
): Promise<void> {
  const response =
    await fetch(
      `${API_URL}/live/${id}/start`,
      {
        method: "POST",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      `Unable to start live session ${response.status}: ${text}`
    );
  }

  await response.json();
}

/*
 * ============================================================
 * STOP LIVE SESSION
 * ============================================================
 */

export async function stopLiveSession(
  id: string
): Promise<void> {
  const response =
    await fetch(
      `${API_URL}/live/${id}/stop`,
      {
        method: "POST",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      `Unable to stop live session ${response.status}: ${text}`
    );
  }

  await response.json();
}

/*
 * ============================================================
 * CREATE + START LIVE
 *
 * Used when we need a completely new session.
 * ============================================================
 */

export async function createAndStartLive(): Promise<LiveSession> {
  const liveId =
    await createLiveSession();

  await startLiveSession(
    liveId
  );

  return getLiveSession(
    liveId
  );
}

/*
 * ============================================================
 * PREPARE LIVE SESSION
 *
 * Reuse an existing live session when possible.
 * Otherwise create a new one.
 * ============================================================
 */

export async function prepareLiveSession(
  initialLiveId?: string | null
): Promise<string> {
  let liveId =
    initialLiveId &&
    initialLiveId !== "1" &&
    initialLiveId !== "unknown"
      ? initialLiveId
      : null;

  /*
   * No existing ID.
   */

  if (!liveId) {
    liveId =
      await createLiveSession();

    await startLiveSession(
      liveId
    );

    return liveId;
  }

  /*
   * Try existing session.
   */

  let session: LiveSession;

  try {
    session =
      await getLiveSession(
        liveId
      );
  } catch (error) {
    console.warn(
      "STREETGO: EXISTING LIVE SESSION COULD NOT BE LOADED.",
      error
    );

    liveId =
      await createLiveSession();

    await startLiveSession(
      liveId
    );

    return liveId;
  }

  /*
   * Already live.
   */

  if (
    session.status === "live"
  ) {
    return liveId;
  }

  /*
   * Created but not started.
   */

  if (
    session.status === "created"
  ) {
    await startLiveSession(
      liveId
    );

    return liveId;
  }

  /*
   * Ended session cannot be reused.
   */

  if (
    session.status === "ended"
  ) {
    liveId =
      await createLiveSession();

    await startLiveSession(
      liveId
    );

    return liveId;
  }

  throw new Error(
    `Unsupported live session status: ${session.status}`
  );
}