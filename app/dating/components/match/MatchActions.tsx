"use client"

import {
  Heart,
  MessageCircle,
  UserRound,
} from "lucide-react"

interface MatchActionsProps {
  userId: string

  connectionStatus:
    | "none"
    | "pending"
    | "accepted"

  sending?: boolean

  onConnect: (id: string) => void

  onViewProfile: () => void
}

export default function MatchActions({
  userId,
  connectionStatus,
  sending = false,
  onConnect,
  onViewProfile,
}: MatchActionsProps) {

  const isPending =
    connectionStatus === "pending"

  const isAccepted =
    connectionStatus === "accepted"


  function handlePrimaryAction() {

    if (sending) {
      return
    }


    if (isAccepted) {

      window.location.href =
        `/messages?user=${userId}`

      return
    }


    if (isPending) {
      return
    }


    onConnect(userId)
  }


  return (

    <div
      className="
        mt-6
        grid
        grid-cols-[1fr_auto]
        gap-2
      "
    >

      {/* =====================================
          MAIN ACTION
      ====================================== */}

      <button
        type="button"
        onClick={
          handlePrimaryAction
        }
        disabled={
          isPending ||
          sending
        }
        className={`
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          py-3
          text-sm
          font-bold
          transition
          ${
            isAccepted
              ? `
                bg-emerald-400
                text-black
                hover:bg-emerald-300
              `
              : isPending || sending
                ? `
                  cursor-not-allowed
                  bg-slate-800
                  text-slate-500
                `
                : `
                  bg-white
                  text-black
                  hover:bg-slate-200
                `
          }
        `}
      >

        {isAccepted ? (

          <>
            <MessageCircle
              className="h-4 w-4"
            />

            Message
          </>

        ) : isPending ? (

          <>
            <Heart
              className="h-4 w-4"
            />

            Request Sent
          </>

        ) : sending ? (

          <>
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-slate-400
                border-t-transparent
              "
            />

            Sending...
          </>

        ) : (

          <>
            <Heart
              className="h-4 w-4"
            />

            Connect
          </>

        )}

      </button>


      {/* =====================================
          VIEW PROFILE
      ====================================== */}

      <button
        type="button"
        onClick={
          onViewProfile
        }
        className="
          flex
          items-center
          justify-center
          rounded-xl
          border
          border-slate-800
          bg-slate-900
          px-4
          text-slate-300
          transition
          hover:border-slate-700
          hover:bg-slate-800
          hover:text-white
        "
        aria-label="View profile"
      >

        <UserRound
          className="h-5 w-5"
        />

      </button>

    </div>
  )
}