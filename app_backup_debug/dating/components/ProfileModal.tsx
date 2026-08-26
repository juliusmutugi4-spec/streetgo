"use client"

import { MapPin, ShieldCheck, X, Heart, MessageCircle, Briefcase, GraduationCap } from "lucide-react"
import type { MatchCardPerson } from "./MatchCard"

interface ProfileModalProps {
  person: MatchCardPerson | null
  open: boolean
  onClose: () => void
  onConnect: (id: string) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase()
}

export default function ProfileModal({
  person,
  open,
  onClose,
  onConnect,
}: ProfileModalProps) {
  if (!open || !person) return null

  const connected = person.connectionStatus === "accepted"
  const pending = person.connectionStatus === "pending"
  const trusted = (person.reputation ?? 0) >= 20

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-slate-800 bg-slate-950 shadow-2xl"
        onMouseDown={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
          aria-label="Close profile"
        >
          <X className="h-5 w-5" />
        </button>

        {/* PROFILE HERO */}

        <div className="relative h-[460px] overflow-hidden">
          {person.avatar ? (
            <img
              src={person.avatar}
              alt={`${person.name}'s profile`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-950 via-purple-950 to-slate-950">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/10 text-5xl font-black text-white">
                {getInitials(person.name)}
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

          <div className="absolute bottom-7 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-4xl font-black text-white">
                {person.name}
              </h2>

              {trusted && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400">
                  <ShieldCheck className="h-4 w-4 text-black" />
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/75">
              {person.age && <span>{person.age} years old</span>}

              {person.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {person.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-7 p-6">

          {/* HEADLINE */}

          {person.headline && (
            <section>
              <p className="text-lg font-semibold leading-7 text-slate-200">
                {person.headline}
              </p>
            </section>
          )}

          {/* COMPATIBILITY */}

          <section className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Compatibility
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Based on your StreetGO profile
                </p>
              </div>

              <span className="text-4xl font-black text-emerald-400">
                {person.score}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${Math.min(person.score, 100)}%`,
                }}
              />
            </div>
          </section>

          {/* WHY YOU MATCH */}

          {person.reasons.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Why you matched
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {person.reasons.map((reason, index) => (
                  <div
                    key={`${reason}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300"
                  >
                    <span className="mr-2 text-emerald-400">✓</span>
                    {reason}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* INTERESTS */}

          {person.interests && person.interests.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Interests
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {person.interests.map(interest => (
                  <span
                    key={interest}
                    className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* PROFESSIONAL INFORMATION */}

          <section className="grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Profile
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {person.profileType || "Dating"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  StreetGO
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {trusted ? "Trusted member" : "Member"}
              </p>
            </div>

          </section>

          {/* ACTIONS */}

          <div className="flex gap-3 border-t border-slate-800 pt-6">

            <button
              type="button"
              onClick={() => {
                if (connected) {
                  window.location.href = `/messages?user=${person.id}`
                  return
                }

                if (!pending) {
                  onConnect(person.id)
                }
              }}
              disabled={pending}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition ${
                connected
                  ? "bg-emerald-400 text-black hover:bg-emerald-300"
                  : pending
                    ? "cursor-not-allowed bg-slate-800 text-slate-500"
                    : "bg-white text-black hover:bg-slate-200"
              }`}
            >
              {connected ? (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Message
                </>
              ) : pending ? (
                "Request Sent"
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Connect
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-6 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Close
            </button>

          </div>

          {/* SAFETY */}

          <p className="text-center text-xs leading-5 text-slate-600">
            StreetGO encourages respectful connections. Never share passwords,
            financial information, or sensitive personal information with another user.
          </p>

        </div>
      </div>
    </div>
  )
}