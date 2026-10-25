"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"

export type PlatformFee = {
  id: string
  fee_type: string
  percentage: number
  active: boolean
  effective_from: string
  created_at: string
  updated_at: string
}

export default function usePlatformFees(enabled = true) {
  const [fees, setFees] = useState<PlatformFee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const supabase = getSupabaseBrowser()

  async function loadFees() {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      const { data, error } = await supabase
        .from("platform_fee_settings")
        .select("*")
        .order("fee_type", { ascending: true })

      if (error) {
        throw error
      }

setFees(
  (data || []).map((fee: PlatformFee) => ({
          ...fee,
          percentage: Number(fee.percentage),
        }))
      )
    } catch (err: any) {
      console.error("PLATFORM FEE LOAD ERROR:", err)

      setError(
        err?.message ||
          "Unable to load platform fee settings."
      )
    } finally {
      setLoading(false)
    }
  }

  async function updateFee(
    feeType: string,
    percentage: number
  ) {
    if (!enabled) {
      throw new Error(
        "Platform fee controls are disabled."
      )
    }

    try {
      setSaving(true)
      setError("")

      const { data, error } = await supabase.rpc(
        "admin_update_platform_fee",
        {
          p_fee_type: feeType,
          p_percentage: percentage,
        }
      )

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error(
          "The platform fee update returned no data."
        )
      }

      const updatedFee: PlatformFee = {
        ...data,
        percentage: Number(data.percentage),
      }

      setFees((current) =>
        current.map((fee) =>
          fee.fee_type === feeType
            ? updatedFee
            : fee
        )
      )

      return updatedFee
    } catch (err: any) {
      console.error(
        "PLATFORM FEE UPDATE ERROR:",
        err
      )

      throw new Error(
        err?.message ||
          "Unable to update platform fee."
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadFees()
  }, [enabled])

  return {
    fees,
    loading,
    saving,
    error,
    loadFees,
    updateFee,
  }
}