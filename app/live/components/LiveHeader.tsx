"use client";

interface LiveHeaderProps {
  isBroadcaster: boolean;
  connected: boolean;
  isOffline: boolean;
}

export default function LiveHeader({
  isBroadcaster,
  connected,
  isOffline,
}: LiveHeaderProps) {
  return (
    <div
      className="
        mb-6
        flex
        items-center
        justify-between
      "
    >
      <div>
        <h1 className="text-2xl font-bold">
          StreetGo Live
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          {isBroadcaster
            ? "Live Broadcasting"
            : "Live Coverage"}
        </p>
      </div>

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span
          className={`
            h-3
            w-3
            rounded-full
            ${
              connected
                ? "bg-red-500"
                : isOffline
                  ? "bg-yellow-400"
                  : "bg-zinc-600"
            }
          `}
        />

        <span
          className="
            text-sm
            font-medium
          "
        >
          {connected
            ? "LIVE"
            : isOffline
              ? "OFFLINE"
              : "RECONNECTING..."}
        </span>
      </div>
    </div>
  );
}