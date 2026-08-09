import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
} from "@supabase/supabase-js"

export default function useFinance(
  authorized: boolean
) {
  const supabase = getSupabaseBrowser()

  const [summary, setSummary] = useState({
    total_deposits: 0,
    total_withdrawals: 0,
    pending_transactions: 0,
    total_transactions: 0,
  })

  const [transactions, setTransactions] =
    useState<any[]>([])

  const [withdrawals, setWithdrawals] =
    useState<any[]>([])

  const [chartData, setChartData] =
    useState<any[]>([])

  const [extraFinance, setExtraFinance] =
    useState({
      todayRevenue: 0,
      activeWallets: 0,
      totalWalletBalance: 0,
    })

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    console.log("🔥 useFinance effect started")
    console.log("AUTHORIZED =", authorized)

    if (!authorized) {
      return
    }

    let cancelled = false

    async function loadFinance() {
      try {
        /*
        =====================================================
        FINANCE SUMMARY
        =====================================================
        */

        const {
          data: summaryData,
          error: summaryError,
        } = await supabase.rpc(
          "get_finance_summary"
        )

        if (summaryError) {
          console.log(
            "FINANCE SUMMARY ERROR:",
            summaryError
          )

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        TRANSACTIONS
        =====================================================
        */

        const {
          data: transactionData,
          error: transactionError,
        } = await supabase
          .from("transactions")
          .select(`
            *,
            wallet_id,
            profiles:user_id(
              username
            )
          `)
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(20)

        if (transactionError) {
          console.log(
            "TRANSACTION ERROR:",
            transactionError
          )

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        ADMIN PENDING WITHDRAWALS
        =====================================================
        */

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log(
            "NO AUTHENTICATED ADMIN"
          )

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        const {
          data: withdrawalData,
          error: withdrawalError,
        } = await supabase.rpc(
          "get_admin_pending_withdrawals",
          {
            p_admin_id: user.id,
          }
        )

        if (withdrawalError) {
          console.log(
            "WITHDRAWAL ERROR:",
            withdrawalError
          )

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        REVENUE CHART
        =====================================================
        */

        const {
          data: revenueData,
          error: revenueError,
        } = await supabase.rpc(
          "get_revenue_chart"
        )

        if (revenueError) {
          console.log(
            "REVENUE CHART ERROR:",
            revenueError
          )
        }

        /*
        =====================================================
        EXTRA FINANCE METRICS
        =====================================================
        */

        const [
          todayRevenueRes,
          activeWalletRes,
          totalBalanceRes,
        ] = await Promise.all([
          supabase.rpc(
            "get_today_revenue"
          ),

          supabase.rpc(
            "get_active_wallet_users"
          ),

          supabase.rpc(
            "get_total_wallet_balance"
          ),
        ])

        if (cancelled) {
          return
        }

        /*
        =====================================================
        UPDATE STATE
        =====================================================
        */

        setSummary(
          summaryData || {
            total_deposits: 0,
            total_withdrawals: 0,
            pending_transactions: 0,
            total_transactions: 0,
          }
        )

        setTransactions(
          transactionData || []
        )

        setWithdrawals(
          withdrawalData || []
        )

        setChartData(
          revenueData || []
        )

        setExtraFinance({
          todayRevenue:
            Number(
              todayRevenueRes.data || 0
            ),

          activeWallets:
            Number(
              activeWalletRes.data || 0
            ),

          totalWalletBalance:
            Number(
              totalBalanceRes.data || 0
            ),
        })

        setLoading(false)

      } catch (error) {
        console.error(
          "CRITICAL FINANCE LOAD ERROR:",
          error
        )

        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFinance()

    /*
    =======================================================
    TRANSACTION REALTIME
    =======================================================
    */

    const transactionChannel =
      supabase
        .channel("finance-transactions")
        .on(
          "system",
          {},
          (
            payload: RealtimePostgresChangesPayload<
              Record<string, unknown>
            >
          ) => {
            console.log(
              "SYSTEM EVENT:",
              payload
            )
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
          },
          (
            payload: RealtimePostgresChangesPayload<
              Record<string, unknown>
            >
          ) => {
            console.log(
              "📢 TRANSACTION CHANGED:",
              payload
            )

            loadFinance()
          }
        )
        .subscribe(
          (
            status: RealtimeChannel["state"]
          ) => {
            console.log(
              "REALTIME STATUS:",
              status
            )
          }
        )

    /*
    =======================================================
    WITHDRAWAL REALTIME
    =======================================================
    */

    const withdrawalChannel =
      supabase
        .channel("finance-withdrawals")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "withdrawal_requests",
          },
          () => {
            console.log(
              "📢 WITHDRAWAL CHANGED"
            )

            loadFinance()
          }
        )
        .subscribe(
          (
            status: RealtimeChannel["state"]
          ) => {
            console.log(
              "WITHDRAWAL REALTIME:",
              status
            )
          }
        )

    return () => {
      cancelled = true

      supabase.removeChannel(
        transactionChannel
      )

      supabase.removeChannel(
        withdrawalChannel
      )
    }

  }, [authorized])

  return {
    summary,
    transactions,
    setTransactions,
    withdrawals,
    setWithdrawals,
    chartData,
    extraFinance,
    loading,
  }
}