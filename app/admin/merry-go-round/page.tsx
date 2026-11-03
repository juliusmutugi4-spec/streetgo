'use client'

import MerryGoRoundIntegrityDrawer from './MerryGoRoundIntegrityDrawer'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { getSupabaseBrowser } from '@/app/lib/supabase-browser'

type Issue = 'healthy' | 'warning' | 'critical'

type RoundRow = {
  id: string
  round_number: number
}

type Round = {
  id: string
  group_id: string
  round_number: number
  status: string
  target_amount: number
  stored_collected: number
  verified_paid: number
  payout_amount: number
  difference: number
  outstanding_amount: number
  transaction_count: number
  paid_transaction_count: number
  failed_transaction_count: number
  pending_transaction_count: number
  paid_member_count: number
  payout_count: number
  paid_payout_count: number
  paid_payout_total: number
  issue: Issue
  issue_reason: string
}

type Group = {
  id: string
  group_number: string
  name: string
}

export default function MerryGoRoundAdminPage() {
  const supabase = getSupabaseBrowser()

  const [rounds, setRounds] = useState<Round[]>([])
  const [groups, setGroups] = useState<Map<string, Group>>(new Map())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null)
  const [repairing, setRepairing] = useState(false)
  const [triggeringB2C, setTriggeringB2C] = useState(false)

  // -------------------------------------------------------------
  // LOAD FINANCE AUDIT
  // -------------------------------------------------------------

  async function loadFinanceAudit() {
    try {
      setError(null)

      // Load rounds first. Fetching the entire groups table here is unsafe:
      // Supabase applies a row limit, so older groups can be omitted from the
      // result and then incorrectly rendered as "Unknown Group".
      const { data: roundData, error: roundError } = await supabase
        .from('contribution_rounds')
        .select(`
          id,
          group_id,
          round_number,
          status,
          target_amount,
          collected_amount
        `)
        .order('created_at', { ascending: false })

      if (roundError) {
        throw roundError
      }

      const rawRounds = roundData ?? []

      if (rawRounds.length === 0) {
        setRounds([])
        setGroups(new Map())
        return
      }

      // Resolve only groups referenced by the loaded rounds. Use small batches
      // to avoid oversized PostgREST URL/query payloads as the platform grows.
      const groupIds = Array.from(
        new Set(
          rawRounds
            .map((round: { group_id: string | null }) => round.group_id)
            .filter((groupId: string | null): groupId is string => Boolean(groupId))
        )
      )

      const groupMap = new Map<string, Group>()
      const GROUP_LOOKUP_BATCH_SIZE = 100

      for (let index = 0; index < groupIds.length; index += GROUP_LOOKUP_BATCH_SIZE) {
        const groupIdBatch = groupIds.slice(
          index,
          index + GROUP_LOOKUP_BATCH_SIZE
        )

        const { data: groupData, error: groupError } = await supabase
          .from('contribution_groups')
          .select('id, group_number, name')
          .in('id', groupIdBatch)

        if (groupError) {
          throw groupError
        }

        for (const group of groupData ?? []) {
          groupMap.set(group.id, {
            id: group.id,
            group_number: group.group_number,
            name: group.name,
          })
        }
      }

      setGroups(groupMap)

      const roundIds = rawRounds.map((round: { id: string }) => round.id)

      const {
        data: transactionData,
        error: transactionError,
      } = await supabase
        .from('contribution_transactions')
        .select(`
          id,
          round_id,
          member_id,
          amount,
          applied_amount,
          status
        `)
        .in('round_id', roundIds)

      if (transactionError) {
        throw transactionError
      }

      const {
        data: disbursementData,
        error: disbursementError,
      } = await supabase
        .from('contribution_disbursements')
        .select(`
          id,
          round_id,
          amount,
          status
        `)
        .in('round_id', roundIds)

      if (disbursementError) {
        throw disbursementError
      }

      const transactionMap = new Map<
        string,
        {
          verifiedAmount: number
          paidCount: number
          failedCount: number
          pendingCount: number
          totalCount: number
          members: Set<string>
        }
      >()

      for (const tx of transactionData ?? []) {
        if (!tx.round_id) {
          continue
        }

        if (!transactionMap.has(tx.round_id)) {
          transactionMap.set(tx.round_id, {
            verifiedAmount: 0,
            paidCount: 0,
            failedCount: 0,
            pendingCount: 0,
            totalCount: 0,
            members: new Set<string>(),
          })
        }

        const bucket = transactionMap.get(tx.round_id)!
        bucket.totalCount += 1

        if (tx.status === 'paid') {
          const amount =
            tx.applied_amount != null
              ? Number(tx.applied_amount)
              : Number(tx.amount ?? 0)

          bucket.verifiedAmount += amount
          bucket.paidCount += 1

          if (tx.member_id) {
            bucket.members.add(tx.member_id)
          }
        }

        if (tx.status === 'failed') {
          bucket.failedCount += 1
        }

        if (tx.status === 'pending' || tx.status === 'processing') {
          bucket.pendingCount += 1
        }
      }

      const payoutMap = new Map<
        string,
        {
          total: number
          count: number
          paidCount: number
          paidTotal: number
        }
      >()

      for (const payout of disbursementData ?? []) {
        if (!payout.round_id) {
          continue
        }

        if (!payoutMap.has(payout.round_id)) {
          payoutMap.set(payout.round_id, {
            total: 0,
            count: 0,
            paidCount: 0,
            paidTotal: 0,
          })
        }

        const bucket = payoutMap.get(payout.round_id)!
        const amount = Number(payout.amount ?? 0)

        bucket.total += amount
        bucket.count += 1

        if (payout.status === 'paid') {
          bucket.paidCount += 1
          bucket.paidTotal += amount
        }
      }

      const auditRounds: Round[] = rawRounds.map((round: any) => {
        const transactions = transactionMap.get(round.id)
        const payouts = payoutMap.get(round.id)

        const verifiedPaid = transactions?.verifiedAmount ?? 0
        const storedCollected = Number(round.collected_amount ?? 0)
        const target = Number(round.target_amount ?? 0)
        const payout = payouts?.paidTotal ?? 0

        const outstanding = Math.max(0, target - verifiedPaid)
        const difference = verifiedPaid - target

        let issue: Issue = 'healthy'
        let issueReason = 'No integrity issue detected.'

        // CRITICAL: MONEY PAID OUT > VERIFIED MONEY RECEIVED
        if (payout > verifiedPaid) {
          issue = 'critical'
          issueReason =
            'Paid payout is greater than verified contribution money.'
        }

        // CRITICAL: STORED VS VERIFIED MONEY MISMATCH
        // Any material mismatch is an accounting integrity issue.
        if (Math.abs(storedCollected - verifiedPaid) > 0.001) {
          issue = 'critical'
          issueReason =
            'Stored collected amount does not match verified contribution money.'
        }

        // CRITICAL: MORE THAN ONE PAID PAYOUT
        if ((payouts?.paidCount ?? 0) > 1) {
          issue = 'critical'
          issueReason = 'More than one paid payout exists for this round.'
        }

        // CRITICAL: ROUND MARKED READY/PAID WITHOUT ENOUGH MONEY
        const dangerousStatus = [
          'ready',
          'processing',
          'paid',
          'completed',
        ].includes(String(round.status).toLowerCase())

        if (dangerousStatus && verifiedPaid < target && payout > 0) {
          issue = 'critical'
          issueReason =
            'Round has payout activity even though verified contributions are below the target.'
        }

        // NORMAL MEMBER PAYMENT REQUIRED — NOT AN INTEGRITY ERROR
        if (verifiedPaid < target && issue !== 'critical') {
          issue = 'warning'
          issueReason = `Members still owe ${formatAmount(outstanding)}.`
        }

        return {
          id: round.id,
          group_id: round.group_id,
          round_number: Number(round.round_number),
          status: round.status,
          target_amount: target,
          stored_collected: storedCollected,
          verified_paid: verifiedPaid,
          payout_amount: payout,
          difference,
          outstanding_amount: outstanding,
          transaction_count: transactions?.totalCount ?? 0,
          paid_transaction_count: transactions?.paidCount ?? 0,
          failed_transaction_count: transactions?.failedCount ?? 0,
          pending_transaction_count: transactions?.pendingCount ?? 0,
          paid_member_count: transactions?.members.size ?? 0,
          payout_count: payouts?.count ?? 0,
          paid_payout_count: payouts?.paidCount ?? 0,
          paid_payout_total: payouts?.paidTotal ?? 0,
          issue,
          issue_reason: issueReason,
        }
      })

      setRounds(auditRounds)
    } catch (err: any) {
      console.error('Finance audit failed:', err)
      setError(
        err?.message ||
          'Failed to load Merry-Go-Round finance data.'
      )
    }
  }

  // -------------------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------------------

  useEffect(() => {
    void (async () => {
      setLoading(true)
      await loadFinanceAudit()
      setLoading(false)
    })()
  }, [])

  // -------------------------------------------------------------
  // REFRESH
  // -------------------------------------------------------------

  async function handleRefresh() {
    setRefreshing(true)
    setNotice(null)
    await loadFinanceAudit()
    setRefreshing(false)
  }

  // -------------------------------------------------------------
  // OPEN CRITICAL INVESTIGATION
  // -------------------------------------------------------------

  function openInvestigation(roundId: string) {
    setNotice(null)
    setError(null)
    setSelectedRoundId(roundId)
  }

  function closeInvestigation() {
    setSelectedRoundId(null)
  }

  // -------------------------------------------------------------
  // MEMBER PAYMENT REQUIRED
  // -------------------------------------------------------------

  function handleMemberPaymentRequired(round: Round) {
    setError(null)
    setNotice(
      `No administrative repair is required. Members still owe ${formatAmount(
        round.outstanding_amount
      )} for ${groups.get(round.group_id)?.name ?? 'this group'} — Round #${
        round.round_number
      }. The member must complete the remaining contribution through the normal M-Pesa payment flow.`
    )
  }

  // -------------------------------------------------------------
  // SAFE ACCOUNTING REPAIR
  // -------------------------------------------------------------

  async function recalculateRound(roundId: string) {
    const selected = rounds.find((round) => round.id === roundId)

    if (!selected) {
      return
    }

    // Never use accounting repair to cover an unsupported payout.
    if (selected.payout_amount > selected.verified_paid) {
      setError(
        'Accounting recalculation is locked because this round has a payout greater than verified contribution money. Payout reconciliation is required first.'
      )
      return
    }

    setRepairing(true)
    setError(null)
    setNotice(null)

    try {
      const { error: repairError } = await supabase.rpc(
        'repair_merry_go_round_round',
        {
          p_round_id: roundId,
          p_action: 'recalculate_collected',
        }
      )

      if (repairError) {
        throw repairError
      }

      // Re-run the complete audit. If the round is now healthy,
      // it automatically disappears from the active queue.
      await loadFinanceAudit()
      closeInvestigation()
} catch (err: any) {
  console.error("ROUND REPAIR ERROR RAW:", err)
  console.error(
    "ROUND REPAIR ERROR JSON:",
    JSON.stringify(err, null, 2)
  )
  console.error(
    "ROUND REPAIR ERROR MESSAGE:",
    err?.message
  )
  console.error(
    "ROUND REPAIR ERROR DETAILS:",
    err?.details
  )
  console.error(
    "ROUND REPAIR ERROR HINT:",
    err?.hint
  )
  console.error(
    "ROUND REPAIR ERROR CODE:",
    err?.code
  )

  setError(
    err?.message ||
      err?.details ||
      err?.hint ||
      "Unable to recalculate round accounting."
  )
}
     finally {
      setRepairing(false)
    }
  }

  // -------------------------------------------------------------
  // SAFE B2C PAYOUT RECOVERY
  //
  // This retries the EXISTING disbursement for the selected round.
  // It never creates a second disbursement.
  // -------------------------------------------------------------


async function triggerB2C(roundId: string) {
  const selected = rounds.find((round) => round.id === roundId)

  if (!selected) {
    setError('Selected round could not be found.')
    return
  }

  setTriggeringB2C(true)
  setError(null)
  setNotice(null)

  try {
    console.log('========== B2C PAYOUT RECOVERY START ==========')
    console.log('ROUND ID:', roundId)
    console.log('ROUND NUMBER:', selected.round_number)
    console.log('TARGET:', selected.target_amount)
    console.log('VERIFIED PAID:', selected.verified_paid)
    console.log('PAYOUT:', selected.payout_amount)
    console.log('OUTSTANDING:', selected.outstanding_amount)

    const { data, error: rpcError } = await supabase.rpc(
      'retry_contribution_payout_job',
      {
        p_round_id: roundId,
      }
    )

    console.log('B2C RPC DATA:', data)
    console.log('B2C RPC ERROR:', rpcError)

    if (rpcError) {
      console.error('========== B2C RPC ERROR ==========')
      console.error('RPC ERROR OBJECT:', rpcError)
      console.error('RPC ERROR MESSAGE:', rpcError.message)
      console.error('RPC ERROR DETAILS:', rpcError.details)
      console.error('RPC ERROR HINT:', rpcError.hint)
      console.error('RPC ERROR CODE:', rpcError.code)
      console.error('RPC ERROR JSON:', JSON.stringify(rpcError, null, 2))

      throw rpcError
    }

    console.log('========== B2C PAYOUT RECOVERY QUEUED ==========')
    console.log('RESULT:', data)

    setNotice(
      `B2C payout recovery queued successfully for Round #${selected.round_number}. ` +
        `The existing payout will now continue through the normal B2C pipeline.`
    )

    await loadFinanceAudit()
  } catch (err: unknown) {
    console.error('========== B2C RETRY FAILED ==========')
    console.error('RAW ERROR:', err)

    if (err instanceof Error) {
      console.error('ERROR NAME:', err.name)
      console.error('ERROR MESSAGE:', err.message)
      console.error('ERROR STACK:', err.stack)
    }

    const supabaseError = err as {
      message?: string
      details?: string
      hint?: string
      code?: string
      status?: number
    }

    console.error('SUPABASE MESSAGE:', supabaseError?.message)
    console.error('SUPABASE DETAILS:', supabaseError?.details)
    console.error('SUPABASE HINT:', supabaseError?.hint)
    console.error('SUPABASE CODE:', supabaseError?.code)
    console.error('SUPABASE STATUS:', supabaseError?.status)

    const exactMessage =
      supabaseError?.message ||
      supabaseError?.details ||
      supabaseError?.hint ||
      'Unable to trigger B2C payout. Check the browser console for the exact error.'

    setError(exactMessage)
  } finally {
    setTriggeringB2C(false)
  }
}

 
  // ACTIVE QUEUE
  //
  // Healthy rounds are deliberately removed from this queue.
  // Warnings are normal member-payment requirements.
  // Critical rows require administrative investigation.
  // -------------------------------------------------------------

  const activeRounds = useMemo(
    () => rounds.filter((round) => round.issue !== 'healthy'),
    [rounds]
  )

  const filteredRounds = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return activeRounds
    }

    return activeRounds.filter((round) => {
      const group = groups.get(round.group_id)

      return Boolean(
        group?.name?.toLowerCase().includes(query) ||
          group?.group_number?.toLowerCase().includes(query) ||
          String(round.round_number).includes(query) ||
          round.id.toLowerCase().includes(query) ||
          round.status.toLowerCase().includes(query) ||
          round.issue.toLowerCase().includes(query)
      )
    })
  }, [activeRounds, groups, search])

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------

  const criticalCount = rounds.filter(
    (round) => round.issue === 'critical'
  ).length

  const warningCount = rounds.filter(
    (round) => round.issue === 'warning'
  ).length

  const healthyCount = rounds.filter(
    (round) => round.issue === 'healthy'
  ).length

  const verifiedTotal = rounds.reduce(
    (sum, round) => sum + round.verified_paid,
    0
  )

  const payoutTotal = rounds.reduce(
    (sum, round) => sum + round.payout_amount,
    0
  )

  const payoutRisk = rounds.reduce(
    (sum, round) =>
      sum +
      Math.max(
        0,
        round.payout_amount - round.verified_paid
      ),
    0
  )

  const selectedRound = selectedRoundId
    ? rounds.find((round) => round.id === selectedRoundId) ?? null
    : null

  // -------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  function getIssueStyle(issue: Issue) {
    switch (issue) {
      case 'critical':
        return {
          label: 'CRITICAL',
          className:
            'border-red-500/30 bg-red-500/10 text-red-400',
        }

      case 'warning':
        return {
          label: 'PAYMENT REQUIRED',
          className:
            'border-amber-500/30 bg-amber-500/10 text-amber-400',
        }

      default:
        return {
          label: 'HEALTHY',
          className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-50">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <ShieldAlert className="h-4 w-4" />
            StreetGO Finance Supervisor
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Merry-Go-Round Integrity
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-zinc-500">
            Financial exception monitoring for contribution rounds,
            verified payments and M-Pesa disbursements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'CHECKING...' : 'REFRESH'}
        </button>
      </div>

      {/* SYSTEM HEALTH */}
      <div
        className={`mb-6 rounded-2xl border p-5 ${
          criticalCount > 0
            ? 'border-red-500/30 bg-red-500/5'
            : warningCount > 0
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-emerald-500/30 bg-emerald-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <AlertTriangle className="h-6 w-6 text-red-400" />
          ) : warningCount > 0 ? (
            <ShieldAlert className="h-6 w-6 text-amber-400" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          )}

          <div>
            <p className="text-sm font-black tracking-wide">
              {criticalCount > 0
                ? '🔴 FINANCIAL RISK DETECTED'
                : warningCount > 0
                  ? '🟡 MEMBER PAYMENTS REQUIRED'
                  : '🟢 FINANCE SYSTEM HEALTHY'}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {criticalCount > 0
                ? `${criticalCount} critical round(s) require administrative investigation.`
                : warningCount > 0
                  ? `${warningCount} round(s) are waiting for members to pay their remaining contribution.`
                  : `All ${healthyCount} monitored round(s) currently have no unresolved integrity issue.`}
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MEMBER PAYMENT NOTICE */}
      {notice && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="flex-1">{notice}</div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-amber-400 hover:text-white"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="Monitored Rounds"
          value={loading ? '—' : rounds.length}
          icon={<Users className="h-5 w-5" />}
        />

        <SummaryCard
          label="Verified Paid"
          value={loading ? '—' : formatAmount(verifiedTotal)}
          icon={<Wallet className="h-5 w-5" />}
        />

        <SummaryCard
          label="Paid Out"
          value={loading ? '—' : formatAmount(payoutTotal)}
          icon={<Wallet className="h-5 w-5" />}
        />

        <SummaryCard
          label="Critical"
          value={loading ? '—' : criticalCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          danger={criticalCount > 0}
        />

        <SummaryCard
          label="Payment Required"
          value={loading ? '—' : warningCount}
          icon={<ShieldAlert className="h-5 w-5" />}
          warning={warningCount > 0}
        />

        <SummaryCard
          label="Payout Risk"
          value={loading ? '—' : formatAmount(payoutRisk)}
          icon={<ShieldAlert className="h-5 w-5" />}
          danger={payoutRisk > 0}
        />
      </div>

      {/* ACTIVE QUEUE */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            Active Finance Queue
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Healthy rounds are automatically removed. Critical issues need admin action; payment-required rounds simply wait for members.
          </p>
        </div>

        <p className="text-xs text-zinc-500">
          Showing {filteredRounds.length} of {activeRounds.length} active issue(s)
        </p>
      </div>

      {/* SEARCH */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search active group, round, ID, or status..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-700"
          />
        </div>
      </div>

      {/* ROUND AUDIT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600">
                <th className="px-5 py-4">Group</th>
                <th className="px-5 py-4">Round</th>
                <th className="px-5 py-4 text-right">Target</th>
                <th className="px-5 py-4 text-right">Stored</th>
                <th className="px-5 py-4 text-right">Verified</th>
                <th className="px-5 py-4 text-right">Outstanding</th>
                <th className="px-5 py-4 text-right">Payout</th>
                <th className="px-5 py-4">Activity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/70">
              {loading && (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center text-sm text-zinc-600">
                    Loading financial audit...
                  </td>
                </tr>
              )}

              {!loading && filteredRounds.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-20 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/60" />
                    <p className="mt-4 text-sm font-black text-emerald-400">
                      NO UNRESOLVED FINANCE ISSUES
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      All monitored rounds are healthy. The supervisor is waiting for new activity.
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRounds.map((round) => {
                  const group = groups.get(round.group_id)
                  const issue = getIssueStyle(round.issue)
                  const isCritical = round.issue === 'critical'

                  return (
                    <tr key={round.id} className="transition hover:bg-zinc-800/30">
                      {/* GROUP */}
                      <td className="px-5 py-5">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {group?.name || 'Unknown Group'}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold text-zinc-500">
                            GROUP #{group?.group_number || '—'}
                          </p>
                          <p className="mt-1 max-w-[180px] truncate text-[9px] text-zinc-700">
                            {round.group_id}
                          </p>
                        </div>
                      </td>

                      {/* ROUND */}
                      <td className="px-5 py-5">
                        <span className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-sm font-black text-white">
                          #{round.round_number}
                        </span>
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600">
                          {round.status}
                        </p>
                        <p className="mt-1 max-w-[160px] truncate text-[9px] text-zinc-700">
                          {round.id}
                        </p>
                      </td>

                      {/* TARGET */}
                      <td className="px-5 py-5 text-right">
                        <span className="text-sm font-semibold text-zinc-300">
                          {formatAmount(round.target_amount)}
                        </span>
                      </td>

                      {/* STORED */}
                      <td className="px-5 py-5 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            round.stored_collected > round.verified_paid
                              ? 'text-red-400'
                              : round.stored_collected < round.verified_paid
                                ? 'text-amber-400'
                                : 'text-zinc-300'
                          }`}
                        >
                          {formatAmount(round.stored_collected)}
                        </span>
                      </td>

                      {/* VERIFIED */}
                      <td className="px-5 py-5 text-right">
                        <span className="text-sm font-bold text-emerald-400">
                          {formatAmount(round.verified_paid)}
                        </span>
                        <p className="mt-1 text-[10px] text-zinc-600">
                          {round.paid_transaction_count} paid tx
                        </p>
                      </td>

                      {/* OUTSTANDING */}
                      <td className="px-5 py-5 text-right">
                        <span
                          className={`text-sm font-bold ${
                            round.outstanding_amount > 0
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {formatAmount(round.outstanding_amount)}
                        </span>
                        <p className="mt-1 text-[9px] text-zinc-600">
                          target − verified
                        </p>
                      </td>

                      {/* PAYOUT */}
                      <td className="px-5 py-5 text-right">
                        <span
                          className={`text-sm font-bold ${
                            round.payout_amount > round.verified_paid
                              ? 'text-red-400'
                              : 'text-zinc-300'
                          }`}
                        >
                          {formatAmount(round.payout_amount)}
                        </span>

                        {round.payout_amount > round.verified_paid && (
                          <p className="mt-1 text-[9px] font-bold text-red-500">
                            RISK {formatAmount(round.payout_amount - round.verified_paid)}
                          </p>
                        )}
                      </td>

                      {/* ACTIVITY */}
                      <td className="px-5 py-5">
                        <div className="space-y-1 text-[10px] text-zinc-500">
                          <p>
                            <span className="text-emerald-400">
                              {round.paid_transaction_count}
                            </span>{' '}
                            paid
                          </p>
                          <p>
                            <span className="text-red-400">
                              {round.failed_transaction_count}
                            </span>{' '}
                            failed
                          </p>
                          <p>
                            <span className="text-amber-400">
                              {round.pending_transaction_count}
                            </span>{' '}
                            pending
                          </p>
                          <p>{round.paid_member_count} paid members</p>
                          <p>{round.payout_count} payout record(s)</p>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black tracking-wider ${issue.className}`}
                        >
                          {issue.label}
                        </span>
                        <p className="mt-2 max-w-[220px] text-[9px] leading-4 text-zinc-600">
                          {round.issue_reason}
                        </p>
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-5 text-right">
                        {isCritical ? (
                          <button
                            type="button"
                            onClick={() => openInvestigation(round.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-red-300 hover:bg-red-500/20 hover:text-white"
                          >
                            Investigate
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMemberPaymentRequired(round)}
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 hover:text-white"
                          >
                            Pay Remaining
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTNOTE */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <p className="text-[11px] leading-5 text-zinc-600">
          Financial truth on this page is based on contribution transactions with{' '}
          <span className="font-bold text-zinc-400">status = paid</span>.
          The stored round <span className="font-bold text-zinc-400">collected_amount</span>{' '}
          is displayed separately so historical inconsistencies can be detected.
          Outstanding money is not automatically treated as an integrity error. It means members still owe money toward the round target.
          Administrative repair is reserved for actual integrity problems.
        </p>
      </div>

      <MerryGoRoundIntegrityDrawer
        round={selectedRound}
        onClose={closeInvestigation}
        onRecalculate={recalculateRound}
        repairing={repairing}
        onTriggerB2C={triggerB2C}
        triggeringB2C={triggeringB2C}
      />
    </div>
  )
}

// ===============================================================
// SUMMARY CARD
// ===============================================================

function SummaryCard({
  label,
  value,
  icon,
  danger = false,
  warning = false,
}: {
  label: string
  value: string | number
  icon: ReactNode
  danger?: boolean
  warning?: boolean
}) {
  const emphasis = danger
    ? 'border-red-500/20 text-red-400'
    : warning
      ? 'border-amber-500/20 text-amber-400'
      : 'border-zinc-800 text-zinc-100'

  return (
    <div className={`rounded-2xl border bg-zinc-900/70 p-5 ${
      danger
        ? 'border-red-500/20'
        : warning
          ? 'border-amber-500/20'
          : 'border-zinc-800'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className={`mt-3 text-2xl font-bold ${emphasis.split(' ').filter((c) => c.startsWith('text-')).join(' ')}`}>
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            danger
              ? 'bg-red-500/10 text-red-400'
              : warning
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
