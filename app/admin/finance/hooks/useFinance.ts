import { useEffect, useRef, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
} from "@supabase/supabase-js"

export default function useFinance(
  authorized: boolean
) {
  const supabase = getSupabaseBrowser()
const loadSequence = useRef(0)
  const [summary, setSummary] = useState({
    total_deposits: 0,
    total_withdrawals: 0,
    pending_transactions: 0,
    total_transactions: 0,
  })

  const [transactions, setTransactions] =
    useState<any[]>([])

  /*
  =====================================================
  PENDING WITHDRAWALS
  =====================================================
  */

  const [withdrawals, setWithdrawals] =
    useState<any[]>([])

  /*
  =====================================================
  WITHDRAWAL HISTORY
  =====================================================
  */

  const [withdrawalHistory, setWithdrawalHistory] =
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
    
    

    if (!authorized) {
      return
    }

    let cancelled = false

async function loadFinance() {
  const currentLoad = ++loadSequence.current

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
          

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        ADMIN SESSION
        =====================================================
        */

        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession()

        const user =
          sessionData.session?.user

        if (sessionError || !user) {
          

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        PENDING WITHDRAWALS
        =====================================================
        */

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
          

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        WITHDRAWAL HISTORY
        =====================================================
        */

        const {
          data: withdrawalHistoryData,
          error: withdrawalHistoryError,
        } = await supabase.rpc(
          "get_admin_withdrawal_history",
          {
            p_admin_id: user.id,
          }
        )

        

        

        if (withdrawalHistoryError) {
          

          if (!cancelled) {
            setLoading(false)
          }

          return
        }

        /*
        =====================================================
        IMPORTANT:
        HISTORY MUST NEVER CONTAIN PENDING REQUESTS
        =====================================================
        */

        const cleanWithdrawalHistory =
          (withdrawalHistoryData || []).filter(
            (item: any) => {
              const status =
                String(
                  item?.status || ""
                ).toLowerCase()

              return (
                status === "paid" ||
                status === "rejected" ||
                status === "failed"
              )
            }
          )

        

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

        /*
        =====================================================
        CANCELLED CHECK
        =====================================================
        */

if (
  cancelled ||
  currentLoad !== loadSequence.current
) {
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

        /*
        TRANSACTIONS
        */

        setTransactions(
          transactionData || []
        )

        /*
        PENDING WITHDRAWALS
        */

        setWithdrawals(
          withdrawalData || []
        )

        /*
        HISTORY
        ONLY:
        - paid
        - rejected
        - failed
        */

        setWithdrawalHistory(
          cleanWithdrawalHistory
        )

        /*
        REVENUE
        */

        setChartData(
          revenueData || []
        )

        /*
        EXTRA FINANCE
        */

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
            

            loadFinance()
          }
        )
        .subscribe(
          (
            status: RealtimeChannel["state"]
          ) => {
            
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
            

            loadFinance()
          }
        )
        .subscribe(
          (
            status: RealtimeChannel["state"]
          ) => {
            
          }
        )

    /*
    =======================================================
    CLEANUP
    =======================================================
    */

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

    /*
    PENDING WITHDRAWALS
    */

    withdrawals,
    setWithdrawals,

    /*
    COMPLETED / REJECTED HISTORY
    */

    withdrawalHistory,
    setWithdrawalHistory,

    chartData,

    extraFinance,

    loading,
  }
}