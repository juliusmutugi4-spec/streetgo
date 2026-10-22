"use client"

import { ShieldCheck } from "lucide-react"

export default function SecurityInfo() {
  return (
    <section className="mt-5">
      <div className="flex items-start gap-2.5 py-1">
        <ShieldCheck
          size={16}
          className="mt-0.5 shrink-0 text-emerald-400"
        />

        <div>
          <h2 className="text-xs font-bold text-white">
            Contribution Security
          </h2>

          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
            Contributions and payment confirmations are recorded securely
            through StreetGO.
          </p>
        </div>
      </div>
    </section>
  )
}
