'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  CalendarDays,
  Wallet,
  RefreshCw,
  Trophy,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LockKeyhole,
  UnlockKeyhole,
  Crown,
  ChevronRight,
} from 'lucide-react'
import { getSupabaseBrowser } from '../../../lib/supabase-browser'

type Group = {
  id: string
  group_number: string
  name: string
  organizer_id: string
  member_limit: number
  approved_member_limit: number
  contribution_amount: number
  frequency: string
  start_date: string
  status: string

  // Admin progression
  progression_status: 'forming' | 'verified' | 'pro' | 'elite'
  expansion_enabled: boolean
  progression_updated_at: string | null
  progression_updated_by: string | null
}

type Organizer = {
  id: string
  username: string | null
  avatar_url: string | null
}

type Member = {
  id: string
  user_id: string
  member_number: number
  member_code: string | null
  role: string
  status: string
  display_name: string | null
  phone_number: string | null
  phone_verified: boolean
  joined_at: string
}

type Round = {
  id: string
  round_number: number
  recipient_member_id: string
  target_amount: number
  collected_amount: number
  status: string
  completed_at: string | null
  paid_at: string | null
  created_at: string
}

type Disbursement = {
  id: string
  round_id: string
  recipient_member_id: string
  amount: number
  deduction_amount: number
  net_amount: number | null
  phone_number: string
  status: string
  mpesa_transaction_id: string | null
  failure_reason: string | null
  requested_at: string | null
  paid_at: string | null
}

const PROGRESSION_LEVELS = [
  {
    key: 'forming',
    label: 'FORMING',
    description: 'New or developing group',
    color: 'amber',
  },
  {
    key: 'verified',
    label: 'VERIFIED',
    description: 'Admin verified group',
    color: 'emerald',
  },
  {
    key: 'pro',
    label: 'PRO',
    description: 'Established and trusted group',
    color: 'blue',
  },
  {
    key: 'elite',
    label: 'ELITE',
    description: 'Top-performing group',
    color: 'purple',
  },
] as const

export default function AdminGroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const groupId = String(params.id)

  const [group, setGroup] = useState<Group | null>(null)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvedMemberLimitInput, setApprovedMemberLimitInput] = useState('')
  const [savingMemberLimit, setSavingMemberLimit] = useState(false)

  async function loadGroup() {
    try {
      setError(null)

      // ---------------------------------------------------------
      // 1. LOAD GROUP
      // ---------------------------------------------------------
      const { data: groupData, error: groupError } = await supabase
        .from('contribution_groups')
        .select(`
          id,
          group_number,
          name,
          organizer_id,
          member_limit,
          approved_member_limit,
          contribution_amount,
          frequency,
          start_date,
          status,
          progression_status,
          expansion_enabled,
          progression_updated_at,
          progression_updated_by
        `)
        .eq('id', groupId)
        .single()

      if (groupError) {
        console.error('Failed to load group:', groupError)
        setError('Unable to load this group.')
        return
      }

      setGroup(groupData as Group)
      setApprovedMemberLimitInput(
        String(
          groupData.approved_member_limit ??
            groupData.member_limit
        )
      )

      // ---------------------------------------------------------
      // 2. LOAD ORGANIZER
      // ---------------------------------------------------------
      const { data: organizerData, error: organizerError } =
        await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', groupData.organizer_id)
          .maybeSingle()

      if (organizerError) {
        console.error(
          'Failed to load organizer:',
          organizerError
        )
      }

      setOrganizer(organizerData)

      // ---------------------------------------------------------
      // 3. LOAD MEMBERS
      // ---------------------------------------------------------
      const { data: membersData, error: membersError } =
        await supabase
          .from('contribution_members')
          .select(`
            id,
            user_id,
            member_number,
            member_code,
            role,
            status,
            display_name,
            phone_number,
            phone_verified,
            joined_at
          `)
          .eq('group_id', groupId)
          .order('member_number', {
            ascending: true,
          })

      if (membersError) {
        console.error(
          'Failed to load members:',
          membersError
        )
      }

      setMembers(membersData ?? [])

      // ---------------------------------------------------------
      // 4. LOAD ROUNDS
      // ---------------------------------------------------------
      const { data: roundsData, error: roundsError } =
        await supabase
          .from('contribution_rounds')
          .select(`
            id,
            round_number,
            recipient_member_id,
            target_amount,
            collected_amount,
            status,
            completed_at,
            paid_at,
            created_at
          `)
          .eq('group_id', groupId)
          .order('round_number', {
            ascending: false,
          })

      if (roundsError) {
        console.error(
          'Failed to load rounds:',
          roundsError
        )
      }

      setRounds(roundsData ?? [])

      // ---------------------------------------------------------
      // 5. LOAD DISBURSEMENTS
      // ---------------------------------------------------------
      const {
        data: disbursementData,
        error: disbursementError,
      } = await supabase
        .from('contribution_disbursements')
        .select(`
          id,
          round_id,
          recipient_member_id,
          amount,
          deduction_amount,
          net_amount,
          phone_number,
          status,
          mpesa_transaction_id,
          failure_reason,
          requested_at,
          paid_at
        `)
        .eq('group_id', groupId)
        .order('created_at', {
          ascending: false,
        })

      if (disbursementError) {
        console.error(
          'Failed to load disbursements:',
          disbursementError
        )
      }

      setDisbursements(disbursementData ?? [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(
        'Something went wrong while loading the group.'
      )
    }
  }




  async function handleApprovedMemberLimitUpdate() {
    if (!group) return

    const nextLimit = Number(
      approvedMemberLimitInput.trim()
    )

    if (!Number.isInteger(nextLimit) || nextLimit < 1) {
      setError(
        'Approved member limit must be a whole number greater than 0.'
      )
      return
    }

    if (nextLimit < activeMembers.length) {
      setError(
        `Approved member limit cannot be below the current active member count (${activeMembers.length}).`
      )
      return
    }

    const confirmed = window.confirm(
      `Set the Admin-approved member limit for ${group.name} to ${nextLimit} members?`
    )

    if (!confirmed) return

    try {
      setSavingMemberLimit(true)
      setError(null)

const { data, error } = await supabase.rpc(
  'admin_update_group_member_limit',
  {
    p_group_id: group.id,
    p_approved_member_limit: nextLimit,
  }
)

if (error) {
  const errorDetails = {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    status: error?.status,
    statusCode: error?.statusCode,
    raw: String(error),
    ownProperties: Object.getOwnPropertyNames(error),
  }

  console.error(
    'APPROVED MEMBER LIMIT RPC ERROR:',
    JSON.stringify(errorDetails, null, 2)
  )

  setError(
    error?.message ||
      error?.details ||
      error?.hint ||
      `RPC failed: ${String(error)}`
  )

  return
}

      setGroup(data as Group)
      setApprovedMemberLimitInput(
        String(
          data.approved_member_limit ??
            data.member_limit
        )
      )
    } catch (err) {
      console.error(
        'Unexpected approved member limit error:',
        err
      )

      setError(
        'Something went wrong while updating the approved member limit.'
      )
    } finally {
      setSavingMemberLimit(false)
    }
  }


async function handleProgressionUpdate(
  progressionStatus: 'forming' | 'verified' | 'pro' | 'elite',
  expansionEnabled: boolean
) {
  if (!group) return

  const confirmed = window.confirm(
    `Change ${group.name} to ${progressionStatus.toUpperCase()} and ${
      expansionEnabled
        ? 'ENABLE'
        : 'DISABLE'
    } member expansion?`
  )

  if (!confirmed) return

  try {
    setRefreshing(true)
    setError(null)

    const { data, error } = await supabase.rpc(
      'admin_update_group_progression',
      {
        p_group_id: group.id,
        p_progression_status: progressionStatus,
        p_expansion_enabled: expansionEnabled,
      }
    )

    if (error) {
      console.error(
        'Progression update failed:',
        error
      )

      setError(
        error.message ||
          'Unable to update group progression.'
      )

      return
    }

    if (!data) {
      setError(
        'The progression update returned no group.'
      )

      return
    }

    setGroup(data as Group)

    await loadGroup()
  } catch (err) {
    console.error(
      'Unexpected progression error:',
      err
    )

    setError(
      'Something went wrong while updating progression.'
    )
  } finally {
    setRefreshing(false)
  }
}





  async function handleRefresh() {
    setRefreshing(true)
    await loadGroup()
    setRefreshing(false)
  }

  useEffect(() => {
    if (!groupId) return

    async function initialLoad() {
      setLoading(true)
      await loadGroup()
      setLoading(false)
    }

    initialLoad()
  }, [groupId])

  // -----------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  function formatDate(value: string | null) {
    if (!value) return '—'

    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  }

  function formatDateTime(value: string | null) {
    if (!value) return '—'

    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  function getMemberName(memberId: string) {
    const member = members.find(
      (item) => item.id === memberId
    )

    if (!member) return 'Unknown Member'

    return (
      member.display_name ||
      member.member_code ||
      `Member #${member.member_number}`
    )
  }

  function getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'

      case 'pro':
        return 'border-blue-500/20 bg-blue-500/10 text-blue-400'

      case 'elite':
        return 'border-purple-500/20 bg-purple-500/10 text-purple-400'

      case 'completed':
      case 'paid':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'

      case 'processing':
      case 'submitted':
        return 'border-blue-500/20 bg-blue-500/10 text-blue-400'

      case 'failed':
        return 'border-red-500/20 bg-red-500/10 text-red-400'

      case 'ready':
        return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'

      default:
        return 'border-amber-500/20 bg-amber-500/10 text-amber-400'
    }
  }

  function getProgressionStyle(
    status: string
  ) {
    switch (status) {
      case 'verified':
        return {
          badge:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
          dot: 'bg-emerald-400',
          ring: 'ring-emerald-500/20',
        }

      case 'pro':
        return {
          badge:
            'border-blue-500/20 bg-blue-500/10 text-blue-400',
          dot: 'bg-blue-400',
          ring: 'ring-blue-500/20',
        }

      case 'elite':
        return {
          badge:
            'border-purple-500/20 bg-purple-500/10 text-purple-400',
          dot: 'bg-purple-400',
          ring: 'ring-purple-500/20',
        }

      default:
        return {
          badge:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
          dot: 'bg-amber-400',
          ring: 'ring-amber-500/20',
        }
    }
  }

  // -----------------------------------------------------------
  // CALCULATED DATA
  // -----------------------------------------------------------

  const activeMembers = members.filter(
    (member) => member.status === 'active'
  )

  const completedRounds = rounds.filter(
    (round) =>
      round.status === 'completed' ||
      round.status === 'paid'
  )

  const paidDisbursements = disbursements.filter(
    (item) => item.status === 'paid'
  )

  const totalGrossPaid = paidDisbursements.reduce(
    (total, item) =>
      total + Number(item.amount ?? 0),
    0
  )

  const totalDeductions = paidDisbursements.reduce(
    (total, item) =>
      total + Number(item.deduction_amount ?? 0),
    0
  )

  const totalNetPaid = paidDisbursements.reduce(
    (total, item) =>
      total +
      Number(
        item.net_amount ??
          item.amount ??
          0
      ),
    0
  )

  const approvedMemberLimit =
    group?.approved_member_limit ??
    group?.member_limit ??
    0

  const contributionPerMember =
    Number(group?.contribution_amount ?? 0)

  const currentPoolAmount =
    activeMembers.length * contributionPerMember

  const maximumPoolAmount =
    approvedMemberLimit * contributionPerMember

  const memberPercentage =
    approvedMemberLimit > 0
      ? Math.min(
          100,
          (activeMembers.length /
            approvedMemberLimit) *
            100
        )
      : 0

  const currentProgression =
    group?.progression_status || 'forming'

  const currentProgressionIndex =
    PROGRESSION_LEVELS.findIndex(
      (level) =>
        level.key === currentProgression
    )

  const progressionStyle =
    getProgressionStyle(currentProgression)

  const nextProgression =
    currentProgressionIndex >= 0 &&
    currentProgressionIndex <
      PROGRESSION_LEVELS.length - 1
      ? PROGRESSION_LEVELS[
          currentProgressionIndex + 1
        ]
      : null

  // -----------------------------------------------------------
  // LOADING
  // -----------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-50">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-32 animate-pulse rounded bg-zinc-800" />

          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-zinc-900" />

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-zinc-900"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------
  // NOT FOUND
  // -----------------------------------------------------------

  if (!group) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-50">
        <div className="mx-auto max-w-3xl text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

          <h1 className="mt-4 text-xl font-bold">
            Group not found
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error ||
              'This contribution group could not be found.'}
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace('/admin/groups')
            }
            className="
              mt-6 inline-flex items-center gap-2
              rounded-xl border border-zinc-800
              bg-zinc-900 px-4 py-2.5
              text-sm font-bold text-zinc-300
              hover:bg-zinc-800
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-50">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            TOP NAV
        ====================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              router.replace('/admin/groups')
            }
            className="
              inline-flex items-center gap-2
              text-sm font-semibold text-zinc-500
              transition hover:text-white
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Groups
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              inline-flex items-center gap-2
              rounded-xl border border-zinc-800
              bg-zinc-900 px-4 py-2.5
              text-xs font-bold text-zinc-300
              transition hover:border-zinc-700
              hover:bg-zinc-800 hover:text-white
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? 'animate-spin'
                  : ''
              }`}
            />

            {refreshing
              ? 'REFRESHING'
              : 'REFRESH'}
          </button>
        </div>

        {/* =====================================================
            GROUP HEADER
        ====================================================== */}

        <div
          className="
            rounded-3xl border border-zinc-800
            bg-zinc-900/70 p-6 md:p-8
          "
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex h-16 w-16 shrink-0
                  items-center justify-center
                  rounded-2xl border border-zinc-700
                  bg-zinc-950 text-xl font-black
                  text-zinc-300
                "
              >
                {group.name
                  ? group.name
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()
                  : 'G'}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {group.name}
                  </h1>

                  <span
                    className={`
                      inline-flex rounded-full border
                      px-3 py-1 text-[9px]
                      font-black tracking-wider
                      ${getStatusStyle(group.status)}
                    `}
                  >
                    {group.status.toUpperCase()}
                  </span>

                  <span
                    className={`
                      inline-flex rounded-full border
                      px-3 py-1 text-[9px]
                      font-black tracking-wider
                      ${progressionStyle.badge}
                    `}
                  >
                    {currentProgression.toUpperCase()}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  {group.group_number}
                </p>
              </div>
            </div>

            {/* ORGANIZER */}

            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-11 w-11 items-center
                  justify-center rounded-xl
                  border border-zinc-800
                  bg-zinc-950 text-sm font-bold
                  text-zinc-400
                "
              >
                {organizer?.username
                  ? organizer.username
                      .slice(0, 1)
                      .toUpperCase()
                  : 'O'}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  Organizer
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {organizer?.username ||
                    'Unknown Organizer'}
                </p>
              </div>
            </div>
          </div>

          {/* GROUP META */}

          <div
            className="
              mt-7 grid gap-4 border-t
              border-zinc-800 pt-6
              sm:grid-cols-2 lg:grid-cols-4
            "
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-zinc-600" />

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Members
                </p>

                <p className="mt-1 text-sm font-bold">
                  {activeMembers.length} /{' '}
                  {approvedMemberLimit}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Wallet className="h-4 w-4 text-zinc-600" />

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Contribution
                </p>

                <p className="mt-1 text-sm font-bold">
                  {formatAmount(
                    Number(
                      group.contribution_amount
                    )
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-zinc-600" />

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Frequency
                </p>

                <p className="mt-1 text-sm font-bold capitalize">
                  {group.frequency}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock3 className="h-4 w-4 text-zinc-600" />

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Started
                </p>

                <p className="mt-1 text-sm font-bold">
                  {formatDate(group.start_date)}
                </p>
              </div>
            </div>
          </div>

          {/* MEMBER PROGRESS */}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Membership Progress
              </span>

              <span className="text-[10px] font-bold text-zinc-500">
                {Math.round(memberPercentage)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-300 transition-all"
                style={{
                  width: `${memberPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  Rounds
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {completedRounds.length}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Completed
                </p>
              </div>

              <Trophy className="h-5 w-5 text-zinc-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  Paid Rounds
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {paidDisbursements.length}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Successful payouts
                </p>
              </div>

              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  Gross Paid
                </p>

                <p className="mt-3 text-xl font-bold">
                  {formatAmount(totalGrossPaid)}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Before deductions
                </p>
              </div>

              <CircleDollarSign className="h-5 w-5 text-zinc-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  Net Paid
                </p>

                <p className="mt-3 text-xl font-bold text-emerald-400">
                  {formatAmount(totalNetPaid)}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  After deductions
                </p>
              </div>

              <CircleDollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* =====================================================
            ADMIN PROGRESSION
        ====================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="border-b border-zinc-800 px-5 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-sm font-bold">
                      Admin Progression
                    </h2>

                    <span
                      className={`
                        rounded-full border px-2.5 py-1
                        text-[8px] font-black
                        uppercase tracking-wider
                        ${progressionStyle.badge}
                      `}
                    >
                      {currentProgression}
                    </span>
                  </div>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
                    Administrative control over this
                    group's trust level and expansion
                    permissions.
                  </p>
                </div>
              </div>

              {/* EXPANSION STATUS */}

              <div
                className={`
                  inline-flex items-center gap-2
                  self-start rounded-xl border
                  px-3 py-2 text-[9px] font-black
                  uppercase tracking-wider
                  ${
                    group.expansion_enabled
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-600'
                  }
                `}
              >
                {group.expansion_enabled ? (
                  <UnlockKeyhole className="h-3.5 w-3.5" />
                ) : (
                  <LockKeyhole className="h-3.5 w-3.5" />
                )}

                {group.expansion_enabled
                  ? 'Expansion Enabled'
                  : 'Expansion Locked'}
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* PROGRESSION TRACK */}

            <div className="grid gap-3 md:grid-cols-4">
              {PROGRESSION_LEVELS.map(
                (level, index) => {
                  const isCurrent =
                    level.key ===
                    currentProgression

                  const isPast =
                    currentProgressionIndex >=
                      0 &&
                    index <
                      currentProgressionIndex

                  return (
                    <div
                      key={level.key}
                      className={`
                        relative rounded-xl border
                        p-4 transition
                        ${
                          isCurrent
                            ? `${progressionStyle.badge} ring-1 ${progressionStyle.ring}`
                            : isPast
                              ? 'border-zinc-700 bg-zinc-900'
                              : 'border-zinc-800 bg-zinc-950/60'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg border
                            ${
                              isCurrent
                                ? 'border-white/10 bg-black/20'
                                : 'border-zinc-800 bg-zinc-900'
                            }
                          `}
                        >
                          {level.key ===
                          'elite' ? (
                            <Crown
                              className={`h-4 w-4 ${
                                isCurrent
                                  ? 'text-purple-400'
                                  : 'text-zinc-600'
                              }`}
                            />
                          ) : (
                            <span
                              className={`
                                h-2 w-2 rounded-full
                                ${
                                  isCurrent
                                    ? progressionStyle.dot
                                    : isPast
                                      ? 'bg-zinc-400'
                                      : 'bg-zinc-700'
                                }
                              `}
                            />
                          )}
                        </div>

                        {isCurrent && (
                          <span className="text-[8px] font-black uppercase tracking-wider">
                            Current
                          </span>
                        )}

                        {isPast && (
                          <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                        )}
                      </div>

                      <p className="mt-4 text-xs font-black uppercase tracking-wider">
                        {level.label}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-zinc-600">
                        {level.description}
                      </p>
                    </div>
                  )
                }
              )}
            </div>

            {/* ADMIN CONTROL AREA */}

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-zinc-900 p-2">
                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-300">
                      Current level
                    </p>

                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      {PROGRESSION_LEVELS.find(
                        (level) =>
                          level.key ===
                          currentProgression
                      )?.description ||
                        'Group progression level'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Next level
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    {nextProgression
                      ? nextProgression.label
                      : 'MAX LEVEL'}

                    {nextProgression && (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      rounded-lg p-2
                      ${
                        group.expansion_enabled
                          ? 'bg-emerald-500/10'
                          : 'bg-zinc-900'
                      }
                    `}
                  >
                    {group.expansion_enabled ? (
                      <UnlockKeyhole className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <LockKeyhole className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-300">
                      Admin member capacity
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-zinc-600">
                      Set the maximum number of members approved
                      after consultation with the organizer.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                        Current
                      </p>
                      <p className="mt-1 text-sm font-bold text-zinc-300">
                        {activeMembers.length} / {approvedMemberLimit}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                        Original limit
                      </p>
                      <p className="mt-1 text-sm font-bold text-zinc-400">
                        {group.member_limit}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                            Current Pool
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            {formatAmount(currentPoolAmount)}
                          </p>
                        </div>

                        <CircleDollarSign className="h-4 w-4 text-emerald-400" />
                      </div>

                      <p className="mt-1 text-[9px] text-zinc-700">
                        {activeMembers.length} members × {formatAmount(contributionPerMember)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                            Maximum Pool
                          </p>
                          <p className="mt-1 text-sm font-bold text-blue-400">
                            {formatAmount(maximumPoolAmount)}
                          </p>
                        </div>

                        <Wallet className="h-4 w-4 text-blue-400" />
                      </div>

                      <p className="mt-1 text-[9px] text-zinc-700">
                        {approvedMemberLimit} members × {formatAmount(contributionPerMember)}
                      </p>
                    </div>
                  </div>

                  <label className="mt-4 block text-[9px] font-black uppercase tracking-wider text-zinc-600">
                    Approved member limit
                  </label>

                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      min={activeMembers.length}
                      step={1}
                      value={approvedMemberLimitInput}
                      onChange={(event) =>
                        setApprovedMemberLimitInput(
                          event.target.value
                        )
                      }
                      disabled={savingMemberLimit}
                      className="
                        min-w-0 flex-1 rounded-lg
                        border border-zinc-800
                        bg-zinc-950 px-3 py-2.5
                        text-sm font-bold text-white
                        outline-none transition
                        focus:border-blue-500/50
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={handleApprovedMemberLimitUpdate}
                      disabled={savingMemberLimit}
                      className="
                        rounded-lg border
                        border-blue-500/20
                        bg-blue-500/10
                        px-3 py-2
                        text-[9px] font-black
                        uppercase tracking-wider
                        text-blue-400
                        transition
                        hover:border-blue-500/40
                        hover:bg-blue-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {savingMemberLimit
                        ? 'Saving...'
                        : 'Save Limit'}
                    </button>
                  </div>

                  <p className="mt-2 text-[9px] leading-4 text-zinc-700">
                    Admin can choose any whole-number capacity.
                    It cannot be lower than the current active
                    member count.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`
                      text-[10px] font-black uppercase
                      tracking-wider
                      ${
                        group.expansion_enabled
                          ? 'text-emerald-400'
                          : 'text-zinc-600'
                      }
                    `}
                  >
                    {group.expansion_enabled
                      ? 'EXPANSION ENABLED'
                      : 'EXPANSION LOCKED'}
                  </span>

                  <button
                    type="button"
                    disabled={
                      refreshing ||
                      !nextProgression
                    }
                    onClick={() => {
                      if (!nextProgression) return

                      handleProgressionUpdate(
                        nextProgression.key,
                        group.expansion_enabled
                      )
                    }}
                    className="
                      rounded-lg border
                      border-blue-500/20
                      bg-blue-500/10
                      px-3 py-2
                      text-[9px] font-black
                      uppercase tracking-wider
                      text-blue-400
                      transition
                      hover:border-blue-500/40
                      hover:bg-blue-500/20
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    {refreshing
                      ? 'Updating...'
                      : nextProgression
                        ? `Promote to ${nextProgression.label}`
                        : 'Maximum Level'}
                  </button>
                </div>
              </div>
            </div>

            {/* FUTURE ADMIN ACTION */}

            <div className="mt-5 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-300">
                    Admin approval controls
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-600">
                    Admin controls the approved member capacity
                    and the organizer expansion permission.
                    Membership enforcement is handled server-side.
                  </p>
                </div>

                <div className="flex items-center gap-2">
<button
  type="button"
  disabled={refreshing}
  onClick={() =>
    handleProgressionUpdate(
      group.progression_status,
      !group.expansion_enabled
    )
  }
  className="
    rounded-lg border
    border-zinc-700
    bg-zinc-900
    px-3 py-2
    text-[9px] font-black
    uppercase tracking-wider
    text-zinc-300
    transition
    hover:border-zinc-600
    hover:bg-zinc-800
    hover:text-white
    disabled:cursor-not-allowed
    disabled:opacity-40
  "
>
  {refreshing
    ? 'Updating...'
    : group.expansion_enabled
      ? 'Disable'
      : 'Enable'}
</button>
                </div>
              </div>
            </div>

            {group.progression_updated_at && (
              <p className="mt-4 text-[9px] text-zinc-700">
                Last progression update:{' '}
                {formatDateTime(
                  group.progression_updated_at
                )}
              </p>
            )}
          </div>
        </section>

        {/* =====================================================
            MEMBERS + ROUNDS
        ====================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* MEMBERS */}

          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="border-b border-zinc-800 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">
                    Group Members
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Current membership
                  </p>
                </div>

                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-400">
                  {activeMembers.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-zinc-800/70">
              {members.length === 0 && (
                <div className="px-5 py-10 text-center text-xs text-zinc-600">
                  No members found.
                </div>
              )}

              {members.map((member) => {
                const isOrganizer =
                  member.user_id ===
                  group.organizer_id

                return (
                  <div
                    key={member.id}
                    className="
                      flex items-center
                      justify-between gap-4
                      px-5 py-4
                    "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl border
                          border-zinc-800
                          bg-zinc-950
                          text-xs font-bold
                          text-zinc-500
                        "
                      >
                        {member.member_number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-zinc-200">
                            {member.display_name ||
                              member.member_code ||
                              `Member #${member.member_number}`}
                          </p>

                          {isOrganizer && (
                            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-400">
                              Organizer
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                          {member.member_code ||
                            `Member #${member.member_number}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {member.phone_verified && (
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      )}

                      <span
                        className={`
                          rounded-full border
                          px-2 py-1 text-[8px]
                          font-black uppercase
                          tracking-wider
                          ${
                            member.status === 'active'
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                          }
                        `}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ROUNDS */}

          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="border-b border-zinc-800 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold">
                  Round History
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Contribution and payout progression
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-800/70">
              {rounds.length === 0 && (
                <div className="px-5 py-10 text-center text-xs text-zinc-600">
                  No rounds recorded yet.
                </div>
              )}

              {rounds.map((round) => {
                const collectionPercentage =
                  round.target_amount > 0
                    ? Math.min(
                        100,
                        (Number(
                          round.collected_amount
                        ) /
                          Number(
                            round.target_amount
                          )) *
                          100
                      )
                    : 0

                return (
                  <div
                    key={round.id}
                    className="px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold">
                          Round #{round.round_number}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-600">
                          Recipient:{' '}
                          <span className="text-zinc-400">
                            {getMemberName(
                              round.recipient_member_id
                            )}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`
                          rounded-full border
                          px-2.5 py-1 text-[8px]
                          font-black uppercase
                          tracking-wider
                          ${getStatusStyle(
                            round.status
                          )}
                        `}
                      >
                        {round.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-600">
                          Collection
                        </span>

                        <span className="font-semibold text-zinc-400">
                          {formatAmount(
                            Number(
                              round.collected_amount
                            )
                          )}{' '}
                          /{' '}
                          {formatAmount(
                            Number(
                              round.target_amount
                            )
                          )}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-zinc-400"
                          style={{
                            width: `${collectionPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between text-[9px] text-zinc-600">
                      <span>
                        Created{' '}
                        {formatDate(
                          round.created_at
                        )}
                      </span>

                      <span>
                        {round.paid_at
                          ? `Paid ${formatDateTime(
                              round.paid_at
                            )}`
                          : 'Not paid'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* =====================================================
            PAYOUT HISTORY
        ====================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  Payout History
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  B2C disbursement activity for this group
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                  Deductions
                </p>

                <p className="mt-1 text-sm font-bold text-amber-400">
                  {formatAmount(totalDeductions)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {disbursements.length === 0 ? (
              <div className="px-5 py-12 text-center text-xs text-zinc-600">
                No payouts recorded yet.
              </div>
            ) : (
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                    <th className="px-5 py-3">
                      Round
                    </th>

                    <th className="px-5 py-3">
                      Recipient
                    </th>

                    <th className="px-5 py-3">
                      Gross
                    </th>

                    <th className="px-5 py-3">
                      Deduction
                    </th>

                    <th className="px-5 py-3">
                      Net
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      M-PESA
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800/70">
                  {disbursements.map((payout) => {
                    const round =
                      rounds.find(
                        (item) =>
                          item.id ===
                          payout.round_id
                      )

                    return (
                      <tr
                        key={payout.id}
                        className="text-xs"
                      >
                        <td className="px-5 py-4 font-semibold text-zinc-300">
                          #{round?.round_number ?? '—'}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-zinc-300">
                            {getMemberName(
                              payout.recipient_member_id
                            )}
                          </p>

                          <p className="mt-0.5 text-[9px] text-zinc-600">
                            {payout.phone_number}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-zinc-300">
                          {formatAmount(
                            Number(
                              payout.amount
                            )
                          )}
                        </td>

                        <td className="px-5 py-4 text-amber-400">
                          {formatAmount(
                            Number(
                              payout.deduction_amount ??
                                0
                            )
                          )}
                        </td>

                        <td className="px-5 py-4 font-bold text-emerald-400">
                          {formatAmount(
                            Number(
                              payout.net_amount ??
                                payout.amount ??
                                0
                            )
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex rounded-full
                              border px-2.5 py-1
                              text-[8px] font-black
                              uppercase tracking-wider
                              ${getStatusStyle(
                                payout.status
                              )}
                            `}
                          >
                            {payout.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {payout.mpesa_transaction_id ? (
                            <span className="font-mono text-[10px] text-zinc-400">
                              {payout.mpesa_transaction_id}
                            </span>
                          ) : payout.failure_reason ? (
                            <span className="text-[10px] text-red-400">
                              {payout.failure_reason}
                            </span>
                          ) : (
                            <span className="text-zinc-700">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* =====================================================
            ADMIN STATUS FOOTER
        ====================================================== */}

        <div className="mt-6 mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                Admin Control Layer
              </h2>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Admin progression and member-capacity controls
                are connected to secure server-side actions.
                The approved member limit controls how far a
                group may expand without changing the existing
                contribution, C2B, B2C, or Express payout engine.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}