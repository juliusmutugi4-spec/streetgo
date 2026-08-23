"use client"

import { Check, MapPin } from "lucide-react"

interface DatingStepAboutProps {
  headline: string
  age: string
  gender: string
  location: string

  setHeadline: (value: string) => void
  setAge: (value: string) => void
  setGender: (value: string) => void
  setLocation: (value: string) => void
}

export default function DatingStepAbout({
  headline,
  age,
  gender,
  location,
  setHeadline,
  setAge,
  setGender,
  setLocation,
}: DatingStepAboutProps) {
  const genders = [
    { id: "male", label: "Male", icon: "♂" },
    { id: "female", label: "Female", icon: "♀" },
  ]

  return (
    <section className="w-full max-w-md bg-black px-1 font-sans text-white antialiased select-none">
      {/* HEADER SECTION */}
      <div className="mb-5 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Step 1
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
        </div>
        
        <h1 className="mt-1.5 text-xl font-black tracking-tight text-slate-100">
          Tell us about you
        </h1>
        
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Basics help us build better connections for you.
        </p>
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-3.5">
        
        {/* FIELD: PROFILE HEADLINE */}
        <div className="group">
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="headline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Profile Headline
            </label>
            <span className="text-[9px] font-medium tracking-wide text-slate-600 uppercase">
              Optional
            </span>
          </div>

          <div className="relative">
            <input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={80}
              placeholder="e.g. Building a good life..."
              className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-600 focus:border-rose-500/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-rose-500/20"
            />
            <div className="absolute right-2.5 bottom-1 text-[8px] font-mono font-medium text-slate-700 group-focus-within:text-slate-500">
              {headline.length}/80
            </div>
          </div>
        </div>

        {/* FIELD: AGE */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="age" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Age
            </label>
            {age && parseInt(age) < 18 && (
              <span className="text-[9px] font-bold text-rose-500 lowercase animate-pulse">
                Must be 18+
              </span>
            )}
          </div>

          <input
            id="age"
            type="number"
            inputMode="numeric"
            min={18}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="18"
            className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-600 focus:border-rose-500/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-rose-500/20"
          />
        </div>

        {/* FIELD: GENDER */}
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gender
          </p>

          <div className="grid grid-cols-2 gap-2">
            {genders.map((item) => {
              const selected = gender === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id)}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] ${
                    selected
                      ? "border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.05)]"
                      : "border-white/5 bg-white/[0.02] text-slate-400 active:bg-white/[0.05]"
                  }`}
                >
                  <span className={`text-sm ${selected ? "text-rose-400" : "text-slate-500"}`}>
                    {item.icon}
                  </span>
                  
                  <span className="tracking-wide">{item.label}</span>

                  {selected && (
                    <Check className="h-3 w-3 stroke-[3] text-rose-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* FIELD: LOCATION */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="location" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Location
            </label>
            <span className="text-[9px] font-medium tracking-wide text-slate-600 uppercase">
              Optional
            </span>
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600 transition-colors peer-focus:text-rose-400" />
            
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi"
              className="peer w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-9 pr-3 text-xs text-white outline-none transition-all placeholder:text-slate-600 focus:border-rose-500/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-rose-500/20"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
