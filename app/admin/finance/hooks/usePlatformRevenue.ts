"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"

export type RevenueSummary = {
  today: number
  week: number
  month: number
  allTime: number
}

export type RevenueByProduct = {
  source_type: string
  amount: number
}

export default function usePlatformRevenue(enabled = true) {
  const [summary, setSummary] = useState<RevenueSummary>({
    today: 0,
    week: 0,
    month: 0,
    allTime: 0,
  })

  const [byProduct, setByProduct] = useState<
    RevenueByProduct[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const supabase = getSupabaseBrowser()

  async function loadRevenue() {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      const { data, error } = await supabase
        .from("platform_revenue_ledger")
        .select(
          "source_type, fee_amount, created_at"
        )
        .order("created_at", {
          ascending: false,
        })

      if (error) {
        throw error
      }

      const rows = data || []

      const now = new Date()

      const startOfToday = new Date(now)
      startOfToday.setHours(0, 0, 0, 0)

      const startOfWeek = new Date(now)
      startOfWeek.setDate(
        now.getDate() - now.getDay()
      )
      startOfWeek.setHours(0, 0, 0, 0)

      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )

      let today = 0
      let week = 0
      let month = 0
      let allTime = 0

      const productTotals: Record<
        string,
        number
      > = {}

      for (const row of rows) {
        const amount = Number(row.fee_amount || 0)
        const createdAt = new Date(
          row.created_at
        )

        allTime += amount

        if (createdAt >= startOfToday) {
          today += amount
        }

        if (createdAt >= startOfWeek) {
          week += amount
        }

        if (createdAt >= startOfMonth) {
          month += amount
        }

        const source =
          row.source_type || "unknown"

        productTotals[source] =
          (productTotals[source] || 0) + amount
      }

      setSummary({
        today,
        week,
        month,
        allTime,
      })

      setByProduct(
        Object.entries(productTotals)
          .map(([source_type, amount]) => ({
            source_type,
            amount,
          }))
          .sort((a, b) => b.amount - a.amount)
      )
    } catch (err: any) {
      console.error(
        "PLATFORM REVENUE LOAD ERROR:",
        err
      )

      setError(
        err?.message ||
          "Unable to load platform revenue."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRevenue()
  }, [enabled])

  return {
    summary,
    byProduct,
    loading,
    error,
    reload: loadRevenue,
  }
}