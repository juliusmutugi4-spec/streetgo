"use client";

interface LiveInfoProps {
  title: string;
  description?: string | null;
  hostName: string;
  location?: string | null;
  connected: boolean;
  isOffline: boolean;
  viewerCount: number;
  isBroadcaster: boolean;
}

export default function LiveInfo({
  title,
  description,
  hostName,
  location,
  connected,
  isOffline,
  viewerCount,
  isBroadcaster,
}: LiveInfoProps) {
  return (
    <section
      className="
        mt-6
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-6
      "
    >
      <h2
        className="
          text-lg
          font-semibold
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            mt-1
            text-sm
            text-zinc-400
          "
        >
          {description}
        </p>
      )}

      <div
        className="
          mt-5
          flex
          flex-wrap
          gap-8
        "
      >
        {/* STATUS */}

        <div>
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            STATUS
          </p>

          <p
            className="
              mt-1
              font-semibold
            "
          >
            {connected
              ? "Connected"
              : isOffline
                ? "Offline"
                : "Reconnecting"}
          </p>
        </div>

        {/* VIEWERS */}

        <div>
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            VIEWERS
          </p>

          <p
            className="
              mt-1
              font-semibold
            "
          >
            {viewerCount}
          </p>
        </div>

        {/* HOST */}

        <div>
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            HOST
          </p>

          <p
            className="
              mt-1
              font-semibold
            "
          >
            {hostName}
          </p>
        </div>

        {/* LOCATION */}

        {location && (
          <div>
            <p
              className="
                text-xs
                text-zinc-500
              "
            >
              LOCATION
            </p>

            <p
              className="
                mt-1
                font-semibold
              "
            >
              {location}
            </p>
          </div>
        )}

        {/* MODE */}

        <div>
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            MODE
          </p>

          <p
            className="
              mt-1
              font-semibold
            "
          >
            {isBroadcaster
              ? "Broadcaster"
              : "Viewer"}
          </p>
        </div>
      </div>

      {/* OFFLINE NOTICE */}

      {isOffline && (
        <div
          className="
            mt-5
            rounded-lg
            border
            border-yellow-500/20
            bg-yellow-500/5
            px-4
            py-3
            text-xs
            text-yellow-300
          "
        >
          Internet connection lost.
          StreetGO Live will reconnect
          automatically when the connection
          returns.
        </div>
      )}
    </section>
  );
}