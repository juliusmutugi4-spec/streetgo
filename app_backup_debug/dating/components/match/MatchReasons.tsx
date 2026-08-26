"use client"

interface MatchReasonsProps {
  reasons: string[]
}

export default function MatchReasons({
  reasons,
}: MatchReasonsProps) {
  if (!reasons || reasons.length === 0) {
    return null
  }

  return (
    <section className="mt-5">

      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-slate-500
        "
      >
        Why you matched
      </p>

      <div className="mt-3 space-y-2">

        {reasons
          .filter(Boolean)
          .slice(0, 6)
          .map((reason, index) => (
            <div
              key={`${reason}-${index}`}
              className="
                flex
                items-start
                gap-2
                text-sm
                text-slate-300
              "
            >

              <span
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-400
                "
              >
                ✓
              </span>

              <span>
                {reason}
              </span>

            </div>
          ))}

      </div>

    </section>
  )
}