"use client";

import { useEffect } from "react";

type Props = {
  slug: string;
};

export default function ShareRedirect({ slug }: Props) {
  useEffect(() => {
    window.location.replace(`/fund/${slug}`);
  }, [slug]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-blue-400">
          STREETGO FUND
        </p>

        <h1 className="mt-3 text-2xl font-bold">
          Opening fundraiser...
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Please wait.
        </p>

        <a
          href={`/fund/${slug}`}
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Open Fundraiser
        </a>
      </div>
    </main>
  );
}