'use client'

import {
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react"

import { supabase } from "@/app/lib/supabase"

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js"

export interface Wallet {
  id: string
  user_id: string
  full_name?: string | null
  phone?: string | null

  balance: number
  reax_balance: number

  money_wallet_active: boolean
  is_verified?: boolean

  created_at?: string
}

interface UseWalletRealtimeProps {
  userId?: string
  setWallet: Dispatch<SetStateAction<Wallet | null>>
}

export default function useWalletRealtime({
  userId,
  setWallet,
}: UseWalletRealtimeProps) {
  const walletSetter = useRef(setWallet)

  walletSetter.current = setWallet

  useEffect(() => {
    if (!userId) {
      return
    }

    console.log(
      "🟢 Wallet Realtime Started:",
      userId
    )

    let channel: RealtimeChannel

    // ========================================================
    // CREATE WALLET REALTIME CHANNEL
    // ========================================================

    channel = supabase
      .channel(`wallet:${userId}`)

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${userId}`,
        },

        (
          payload: RealtimePostgresChangesPayload<Wallet>
        ) => {
          console.log(
            "💰 Wallet Event:",
            payload.eventType
          )

          console.log(
            "💰 Wallet Payload:",
            payload
          )

          // --------------------------------------------------
          // DELETE
          // --------------------------------------------------

          if (
            payload.eventType === "DELETE"
          ) {
            walletSetter.current(null)
            return
          }

          // --------------------------------------------------
          // INSERT / UPDATE
          // --------------------------------------------------

          if (payload.new) {
            walletSetter.current(
              payload.new as Wallet
            )
          }
        }
      )

      // ======================================================
      // SUBSCRIBE
      // ======================================================

      .subscribe(
        (
          status: REALTIME_SUBSCRIBE_STATES,
          error?: unknown
        ) => {
          console.log(
            "💳 Wallet Channel:",
            status
          )

          // --------------------------------------------------
          // CONNECTED
          // --------------------------------------------------

          if (
            status === "SUBSCRIBED"
          ) {
            console.log(
              "✅ Wallet realtime connected"
            )

            return
          }

          // --------------------------------------------------
          // CHANNEL ERROR
          // --------------------------------------------------

          if (
            status === "CHANNEL_ERROR"
          ) {
            console.error(
              "❌ WALLET REALTIME CHANNEL ERROR:",
              error
            )

            console.error(
              "❌ WALLET REALTIME CHANNEL:",
              channel
            )

            return
          }

          // --------------------------------------------------
          // TIMEOUT
          // --------------------------------------------------

          if (
            status === "TIMED_OUT"
          ) {
            console.warn(
              "⌛ Wallet realtime timeout:",
              error
            )

            return
          }

          // --------------------------------------------------
          // CLOSED
          // --------------------------------------------------

          if (
            status === "CLOSED"
          ) {
            console.warn(
              "🔒 Wallet realtime closed"
            )

            return
          }
        }
      )

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      console.log(
        "🛑 Wallet Realtime Stopped:",
        userId
      )

      supabase.removeChannel(
        channel
      )
    }
  }, [userId])
}