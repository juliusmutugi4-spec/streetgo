"use client"

import { MonitorDown, ShieldCheck, Download, ArrowRight } from "lucide-react"

export default function CyberDownloadPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 flex items-center gap-3">
          <MonitorDown className="h-9 w-9 text-blue-400" />
          <span className="text-2xl font-bold">StreetGO Cyber</span>
        </div>

        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Windows computer management
          </p>
          <h1 className="text-5xl font-bold leading-tight">
            Connect your cyber computers to StreetGO.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Install the StreetGO Cyber Agent on each customer computer
            to connect it securely to your cyber management dashboard.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8">
            <div className="flex items-center gap-4">
              <MonitorDown className="h-12 w-12 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold">StreetGO Cyber Agent</h2>
                <p className="text-sm text-slate-400">
                  Windows 10 and Windows 11
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-slate-800 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-400" />
                <p className="font-medium">Secure device registration</p>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Pair each computer with your StreetGO Cyber business account.
              </p>
            </div>

            <button
              disabled
              className="mt-8 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-bold opacity-60"
            >
              <Download className="h-5 w-5" />
              Windows Agent — Coming Soon
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              The official Windows installer is being prepared.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div>
              <span className="text-blue-400 font-bold">01</span>
              <h3 className="mt-2 font-semibold">Download</h3>
              <p className="mt-1 text-sm text-slate-400">Get the Windows installer.</p>
            </div>
            <div>
              <span className="text-blue-400 font-bold">02</span>
              <h3 className="mt-2 font-semibold">Install</h3>
              <p className="mt-1 text-sm text-slate-400">Install on your customer computer.</p>
            </div>
            <div>
              <span className="text-blue-400 font-bold">03</span>
              <h3 className="mt-2 font-semibold">Pair</h3>
              <p className="mt-1 text-sm text-slate-400">Connect using your dashboard pairing code.</p>
            </div>
          </div>

          <a
            href="/cyber/computers"
            className="mt-12 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            Go to Manage Computers <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  )
}
