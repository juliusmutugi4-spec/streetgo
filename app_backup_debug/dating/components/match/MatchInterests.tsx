"use client"

interface MatchInterestsProps {
  interests: string[]
}

export default function MatchInterests({
  interests,
}: MatchInterestsProps) {

  if (!interests || interests.length === 0) {
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
        Interests
      </p>

      <div className="mt-3 flex flex-wrap gap-2">

        {interests
          .filter(Boolean)
          .slice(0, 6)
          .map((interest) => (
            <span
              key={interest}
              className="
                rounded-full
                border
                border-slate-800
                bg-slate-900
                px-3
                py-1.5
                text-xs
                font-medium
                text-slate-300
                transition
                hover:border-slate-700
                hover:bg-slate-800
                hover:text-white
              "
            >
              {interest}
            </span>
          ))}

      </div>

    </section>
  )
}