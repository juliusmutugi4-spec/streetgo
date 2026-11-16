"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MonitorDown,
  ShieldCheck,
  Download,
  ArrowRight,
  Monitor,
  KeyRound,
  Wifi,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react"

export default function CyberDownloadPage() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")

  async function handleDownload() {
    setDownloading(true)
    setError("")

    try {
      const response = await fetch("/api/cyber/download", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })

      const data = await response.json()

      if (!response.ok || !data.downloadUrl) {
        throw new Error(
          data.error || "Unable to prepare your installer download."
        )
      }

      window.location.assign(data.downloadUrl)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Download failed. Please try again."
      )
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-20">
        <header className="mb-14 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3">
            <MonitorDown className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <span className="text-2xl font-bold">StreetGO Cyber</span>
            <p className="text-xs text-slate-500">Cyber café management</p>
          </div>
        </header>

        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Windows computer management
          </p>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Connect every computer in your cyber café.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            StreetGO Cyber Agent connects your Windows computers to your
            business dashboard. Monitor computer connections and manage
            customer sessions from one place.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <Monitor className="h-11 w-11 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold">StreetGO Cyber Agent</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Windows 10 and Windows 11 · 64-bit
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
                <p className="font-semibold">Official StreetGO installer</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Download the Windows agent directly from StreetGO. Your
                download is authorised through your signed-in café account.
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Installer: StreetGO-Cyber-Agent-Setup.exe · Approximately 45 MB
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Preparing download...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download for Windows
                </>
              )}
            </button>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <div className="mt-7 space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-slate-300">
                  No PowerShell or command-line setup is required for café owners.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-slate-300">
                  Each computer is connected using a one-time pairing code.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-slate-300">
                  The computer reports its connection status to your dashboard.
                </p>
              </div>
            </div>

            <Link
              href="/cyber/computers"
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 px-6 py-4 font-bold transition hover:bg-slate-800"
            >
              Manage My Computers
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">How to connect a computer</h2>
          <p className="mt-2 text-slate-400">
            Complete these steps for each computer in your café.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <Download className="h-7 w-7 text-blue-400" />
              <p className="mt-4 text-sm font-bold text-blue-400">STEP 01</p>
              <h3 className="mt-2 font-semibold">Get the installer</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Download the Windows installer from this page.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <Monitor className="h-7 w-7 text-blue-400" />
              <p className="mt-4 text-sm font-bold text-blue-400">STEP 02</p>
              <h3 className="mt-2 font-semibold">Install the agent</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Open the installer and follow the Windows installation wizard.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <KeyRound className="h-7 w-7 text-blue-400" />
              <p className="mt-4 text-sm font-bold text-blue-400">STEP 03</p>
              <h3 className="mt-2 font-semibold">Pair your computer</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Register the computer in your dashboard, generate a pairing
                code and enter it in the agent window.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <Wifi className="h-7 w-7 text-blue-400" />
              <p className="mt-4 text-sm font-bold text-blue-400">STEP 04</p>
              <h3 className="mt-2 font-semibold">Go online</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Once connected, your computer will appear in your dashboard
                with its current connection status.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-slate-800 pt-7 text-center text-sm text-slate-500">
          StreetGO Cyber · Powered by StreetGO Solutions
        </footer>
      </div>
    </main>
  )
}
