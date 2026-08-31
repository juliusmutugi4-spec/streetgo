"use client";

interface LiveUnavailableProps {
  error?: string;
  isOffline?: boolean;
}

export default function LiveUnavailable({
  error = "",
  isOffline = false,
}: LiveUnavailableProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-8
            text-center
          "
        >
          <div className="mb-4 text-4xl">
            📡
          </div>

          <h1 className="text-2xl font-bold">
            StreetGo Live
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            {error ||
              "There is currently no active live session."}
          </p>

          {isOffline && (
            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-yellow-500/20
                bg-yellow-500/5
                px-4
                py-2
                text-xs
                text-yellow-300
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-yellow-400
                "
              />

              Waiting for connection...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}