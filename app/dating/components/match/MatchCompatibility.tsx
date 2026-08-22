"use client"

interface MatchCompatibilityProps {
  score: number
}

export default function MatchCompatibility({
  score,
}: MatchCompatibilityProps) {

  const safeScore = Math.max(
    0,
    Math.min(
      Math.round(score),
      100
    )
  )

  const label =
    safeScore >= 90
      ? "Exceptional"
      : safeScore >= 80
        ? "Strong"
        : safeScore >= 70
          ? "Very Good"
          : safeScore >= 60
            ? "Good"
            : safeScore >= 40
              ? "Potential"
              : "Early Match"

  return (
    <section className="mt-5">

      <div className="
        rounded-2xl
        border
        border-emerald-400/10
        bg-emerald-400/[0.04]
        p-4
      ">

        <div className="
          flex
          items-end
          justify-between
          gap-4
        ">

          <div>

            <p className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-slate-500
            ">
              Compatibility
            </p>

            <p className="
              mt-1
              text-sm
              text-slate-400
            ">
              Based on your profiles
            </p>

          </div>

          <div className="text-right">

            <span className="
              text-3xl
              font-black
              text-emerald-400
            ">
              {safeScore}%
            </span>

            <p className="
              mt-0.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-emerald-500/70
            ">
              {label}
            </p>

          </div>

        </div>

        <div className="
          mt-3
          h-2
          overflow-hidden
          rounded-full
          bg-slate-800
        ">

          <div
            className="
              h-full
              rounded-full
              bg-emerald-400
              transition-all
              duration-700
            "
            style={{
              width: `${safeScore}%`,
            }}
          />

        </div>

      </div>

    </section>
  )
}