"use client"

import { ShieldCheck } from "lucide-react"

export default function SecurityInfo() {
  return (
    <section className="mt-5 rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={20}
          className="mt-0.5 text-emerald-400"
        />

        <div>
          <div className="text-sm font-black">
            Contribution security
          </div>

          <p className="mt-2 text-xs leading-6 text-white/50">
            Contributions and payment confirmations are recorded securely
            through StreetGO.
          </p>
        </div>
      </div>
    </section>
  )
}