"use client";

interface LiveLoadingProps {
  creatingLive?: boolean;
  isOffline?: boolean;
}

export default function LiveLoading({
  creatingLive = false,
  isOffline = false,
}: LiveLoadingProps) {
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
            {creatingLive
              ? "Preparing your live broadcast..."
              : isOffline
                ? "Waiting for your internet connection..."
                : "Loading StreetGo Live..."}
          </p>
        </div>
      </div>
    </main>
  );
}