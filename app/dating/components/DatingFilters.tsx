"use client"

import {
  Heart,
  MapPin,
  Sparkles,
  Clock3,
  SlidersHorizontal,
} from "lucide-react"

export type DatingFilter =
  | "recommended"
  | "nearby"
  | "active"
  | "new"

interface DatingFiltersProps {
  value: DatingFilter
  onChange: (value: DatingFilter) => void
  onPreferences?: () => void
}

const filters: {
  id: DatingFilter
  label: string
  mobileLabel: string
  icon: typeof Heart
}[] = [
  {
    id: "recommended",
    label: "Recommended",
    mobileLabel: "For You",
    icon: Sparkles,
  },
  {
    id: "nearby",
    label: "Nearby",
    mobileLabel: "Nearby",
    icon: MapPin,
  },
  {
    id: "active",
    label: "Recently Active",
    mobileLabel: "Active",
    icon: Clock3,
  },
  {
    id: "new",
    label: "New Profiles",
    mobileLabel: "New",
    icon: Heart,
  },
]

export default function DatingFilters({
  value,
  onChange,
  onPreferences,
}: DatingFiltersProps) {
  return (
    <section className="w-full">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Discover
          </p>

          <h2 className="mt-1 text-lg font-black tracking-tight text-white">
            People worth knowing
          </h2>
        </div>

        {onPreferences && (
          <button
            type="button"
            onClick={onPreferences}
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">
              Preferences
            </span>
          </button>
        )}

      </div>

      <div className="mt-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="flex min-w-max gap-2">

          {filters.map(filter => {
            const Icon = filter.icon
            const selected = value === filter.id

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onChange(filter.id)}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  transition
                  duration-200
                  ${
                    selected
                      ? "border-white bg-white text-black shadow-lg shadow-white/5"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />

                <span className="sm:hidden">
                  {filter.mobileLabel}
                </span>

                <span className="hidden sm:inline">
                  {filter.label}
                </span>
              </button>
            )
          })}

        </div>

      </div>

    </section>
  )
}