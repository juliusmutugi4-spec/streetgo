'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  CalendarDays,
  Wallet,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { getSupabaseBrowser } from '../../lib/supabase-browser'

type Group = {
  id: string
  group_number: string
  name: string
  organizer_id: string
  organizer_name: string
  member_limit: number
  contribution_amount: number
  frequency: string
  start_date: string
  status: string
  active_members: number
}

export default function AdminGroupsPage() {
  const supabase = getSupabaseBrowser()

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  async function loadGroups() {
    try {
      // ---------------------------------------------------------
      // 1. LOAD GROUPS
      // ---------------------------------------------------------
      const { data: groupData, error: groupError } = await supabase
        .from('contribution_groups')
        .select(`
          id,
          group_number,
          name,
          organizer_id,
          member_limit,
          contribution_amount,
          frequency,
          start_date,
          status
        `)
        .order('created_at', { ascending: false })

      if (groupError) {
        console.error('Failed to load groups:', groupError)
        return
      }

      const groupsData = groupData ?? []

      // ---------------------------------------------------------
      // 2. GET ORGANIZER IDS
      // ---------------------------------------------------------
      const organizerIds = [
        ...new Set(
          groupsData
            .map((group: any) => group.organizer_id)
            .filter(Boolean)
        ),
      ]

      // ---------------------------------------------------------
      // 3. LOAD ORGANIZER NAMES FROM PROFILES
      // ---------------------------------------------------------
      const organizerMap = new Map<string, string>()

      if (organizerIds.length > 0) {
        const { data: profilesData, error: profilesError } =
          await supabase
            .from('profiles')
            .select('id, username')
            .in('id', organizerIds)

        if (profilesError) {
          console.error(
            'Failed to load organizer names:',
            profilesError
          )
        } else {
          for (const profile of profilesData ?? []) {
            organizerMap.set(
              profile.id,
              profile.username || 'Unknown Organizer'
            )
          }
        }
      }

      // ---------------------------------------------------------
      // 4. LOAD MEMBERS SEPARATELY
      //
      // We do this separately instead of relying on the nested
      // Supabase relationship because the previous query was
      // returning 0 active members on the dashboard.
      // ---------------------------------------------------------
      const groupIds = groupsData.map(
        (group: any) => group.id
      )

      const memberCounts = new Map<string, number>()

      if (groupIds.length > 0) {
        const { data: membersData, error: membersError } =
          await supabase
            .from('contribution_members')
            .select('group_id, status')
            .in('group_id', groupIds)

        if (membersError) {
          console.error(
            'Failed to load group members:',
            membersError
          )
        } else {
          for (const member of membersData ?? []) {
            if (member.status !== 'active') continue

            const currentCount =
              memberCounts.get(member.group_id) ?? 0

            memberCounts.set(
              member.group_id,
              currentCount + 1
            )
          }
        }
      }

      // ---------------------------------------------------------
      // 5. FORMAT GROUPS
      // ---------------------------------------------------------
      const formattedGroups: Group[] = groupsData.map(
        (group: any) => {
          return {
            id: group.id,
            group_number: group.group_number,
            name: group.name,
            organizer_id: group.organizer_id,

            organizer_name:
              organizerMap.get(group.organizer_id) ||
              'Unknown Organizer',

            member_limit: Number(
              group.member_limit ?? 0
            ),

            contribution_amount: Number(
              group.contribution_amount ?? 0
            ),

            frequency: group.frequency,
            start_date: group.start_date,
            status: group.status,

            active_members:
              memberCounts.get(group.id) ?? 0,
          }
        }
      )

      setGroups(formattedGroups)
    } catch (error) {
      console.error(
        'Unexpected error loading groups:',
        error
      )
    }
  }

  async function handleRefresh() {
    setRefreshing(true)

    await loadGroups()

    setRefreshing(false)
  }

  useEffect(() => {
    async function initialLoad() {
      setLoading(true)

      await loadGroups()

      setLoading(false)
    }

    initialLoad()
  }, [])

  // -----------------------------------------------------------
  // SEARCH
  // -----------------------------------------------------------
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return groups
    }

    return groups.filter((group) => {
      return (
        group.name
          .toLowerCase()
          .includes(query) ||

        group.group_number
          .toLowerCase()
          .includes(query) ||

        group.organizer_name
          .toLowerCase()
          .includes(query) ||

        group.status
          .toLowerCase()
          .includes(query)
      )
    })
  }, [groups, search])

  // -----------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------
  const totalGroups = groups.length

  const formingGroups = groups.filter(
    (group) => group.status === 'forming'
  ).length

  const fullGroups = groups.filter(
    (group) =>
      group.active_members >= group.member_limit
  ).length

  const totalActiveMembers = groups.reduce(
    (total, group) =>
      total + group.active_members,
    0
  )

  // -----------------------------------------------------------
  // FORMATTING
  // -----------------------------------------------------------
  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  function formatDate(date: string) {
    if (!date) return '—'

    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
  }

  function getStatusStyles(status: string) {
    switch (status.toLowerCase()) {
      case 'verified':
        return {
          label: 'VERIFIED',
          className:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        }

      case 'pro':
        return {
          label: 'PRO',
          className:
            'border-blue-500/20 bg-blue-500/10 text-blue-400',
        }

      case 'elite':
        return {
          label: 'ELITE',
          className:
            'border-purple-500/20 bg-purple-500/10 text-purple-400',
        }

      default:
        return {
          label: 'FORMING',
          className:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
        }
    }
  }

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-50">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <Users className="h-4 w-4" />
            Contribution System
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Group Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Monitor Merry-Go-Round groups, membership growth,
            activity, and group progression.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl
            border border-zinc-800
            bg-zinc-900
            px-4 py-2.5
            text-xs font-bold
            text-zinc-300
            transition
            hover:border-zinc-700
            hover:bg-zinc-800
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />

          {refreshing ? 'REFRESHING' : 'REFRESH'}
        </button>

      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL GROUPS */}
        <div
          className="
            rounded-2xl
            border border-zinc-800
            bg-zinc-900/70
            p-5
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total Groups
              </p>

              <p className="mt-3 text-3xl font-bold">
                {loading ? '—' : totalGroups}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                All contribution groups
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800 p-3">
              <Users className="h-5 w-5 text-zinc-300" />
            </div>

          </div>
        </div>

        {/* FORMING */}
        <div
          className="
            rounded-2xl
            border border-amber-500/10
            bg-zinc-900/70
            p-5
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Forming
              </p>

              <p className="mt-3 text-3xl font-bold text-amber-400">
                {loading ? '—' : formingGroups}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Awaiting progression
              </p>
            </div>

            <div className="rounded-xl bg-amber-500/10 p-3">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>

          </div>
        </div>

        {/* FULL GROUPS */}
        <div
          className="
            rounded-2xl
            border border-emerald-500/10
            bg-zinc-900/70
            p-5
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                At Capacity
              </p>

              <p className="mt-3 text-3xl font-bold text-emerald-400">
                {loading ? '—' : fullGroups}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Groups at member limit
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>

          </div>
        </div>

        {/* ACTIVE MEMBERS */}
        <div
          className="
            rounded-2xl
            border border-blue-500/10
            bg-zinc-900/70
            p-5
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Active Members
              </p>

              <p className="mt-3 text-3xl font-bold text-blue-400">
                {loading ? '—' : totalActiveMembers}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Across all groups
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/10 p-3">
              <Users className="h-5 w-5 text-blue-400" />
            </div>

          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:max-w-md">

          <Search
            className="
              pointer-events-none
              absolute left-3 top-1/2
              h-4 w-4
              -translate-y-1/2
              text-zinc-600
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search group, organizer, or group number..."
            className="
              w-full
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              py-3 pl-10 pr-4
              text-sm
              text-white
              outline-none
              placeholder:text-zinc-600
              focus:border-zinc-700
              focus:ring-1
              focus:ring-zinc-700
            "
          />

        </div>

        <p className="text-xs text-zinc-500">
          Showing {filteredGroups.length} of {totalGroups} groups
        </p>

      </div>

      {/* GROUP TABLE */}
      <div
        className="
          overflow-hidden
          rounded-2xl
          border border-zinc-800
          bg-zinc-900/60
        "
      >

        {/* TABLE HEADER */}
        <div
          className="
            hidden
            border-b border-zinc-800
            bg-zinc-900
            px-5 py-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-zinc-600
            lg:grid
            lg:grid-cols-[2fr_1.5fr_1.2fr_1.3fr_1.2fr_1.2fr_32px]
            lg:items-center
            lg:gap-4
          "
        >
          <span>Group</span>
          <span>Organizer</span>
          <span>Members</span>
          <span>Contribution</span>
          <span>Frequency</span>
          <span>Status</span>
          <span />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="space-y-3 p-5">

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="
                  h-20
                  animate-pulse
                  rounded-xl
                  bg-zinc-800/50
                "
              />
            ))}

          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredGroups.length === 0 && (
          <div className="px-6 py-16 text-center">

            <Users className="mx-auto h-8 w-8 text-zinc-700" />

            <h3 className="mt-4 text-sm font-bold text-zinc-300">
              No groups found
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              Try another search term.
            </p>

          </div>
        )}

        {/* GROUPS */}
        {!loading && filteredGroups.length > 0 && (
          <div className="divide-y divide-zinc-800/70">

            {filteredGroups.map((group) => {

              const status = getStatusStyles(
                group.status
              )

              const memberPercentage =
                group.member_limit > 0
                  ? Math.min(
                      100,
                      (group.active_members /
                        group.member_limit) *
                        100
                    )
                  : 0

              const isFull =
                group.active_members >=
                group.member_limit

              return (
                <Link
                  key={group.id}
                  href={`/admin/groups/${group.id}`}
                  className="
                    group
                    block
                    transition
                    hover:bg-zinc-800/30
                  "
                >

                  <div
                    className="
                      grid
                      gap-4
                      px-5 py-5
                      lg:grid-cols-[2fr_1.5fr_1.2fr_1.3fr_1.2fr_1.2fr_32px]
                      lg:items-center
                      lg:gap-4
                    "
                  >

                    {/* GROUP */}
                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex h-10 w-10
                            shrink-0
                            items-center justify-center
                            rounded-xl
                            border border-zinc-800
                            bg-zinc-950
                            text-xs
                            font-bold
                            text-zinc-400
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

                          <p className="truncate text-sm font-bold text-white">
                            {group.name ||
                              'Unnamed Group'}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] font-medium tracking-wide text-zinc-600">
                            {group.group_number}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* ORGANIZER */}
                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <div
                          className="
                            flex h-8 w-8
                            shrink-0
                            items-center justify-center
                            rounded-lg
                            border border-zinc-800
                            bg-zinc-950
                            text-[10px]
                            font-bold
                            text-zinc-500
                          "
                        >
                          {group.organizer_name
                            ? group.organizer_name
                                .trim()
                                .slice(0, 1)
                                .toUpperCase()
                            : 'O'}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-xs font-semibold text-zinc-300">
                            {group.organizer_name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-zinc-600">
                            Organizer
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* MEMBERS */}
                    <div>

                      <div className="flex items-center justify-between lg:justify-start lg:gap-3">

                        <span className="text-sm font-bold text-zinc-200">
                          {group.active_members}

                          <span className="font-normal text-zinc-600">
                            {' '}
                            / {group.member_limit}
                          </span>
                        </span>

                        {isFull && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            FULL
                          </span>
                        )}

                      </div>

                      <div className="mt-2 h-1.5 w-full max-w-[110px] overflow-hidden rounded-full bg-zinc-800">

                        <div
                          className={`
                            h-full
                            rounded-full
                            transition-all
                            ${
                              isFull
                                ? 'bg-emerald-500'
                                : 'bg-zinc-500'
                            }
                          `}
                          style={{
                            width: `${memberPercentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* CONTRIBUTION */}
                    <div className="flex items-center gap-2">

                      <Wallet className="h-3.5 w-3.5 text-zinc-600" />

                      <span className="text-sm font-semibold text-zinc-300">
                        {formatAmount(
                          group.contribution_amount
                        )}
                      </span>

                    </div>

                    {/* FREQUENCY */}
                    <div className="flex items-center gap-2">

                      <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />

                      <span className="text-xs font-medium capitalize text-zinc-400">
                        {group.frequency}
                      </span>

                    </div>

                    {/* STATUS */}
                    <div>

                      <span
                        className={`
                          inline-flex
                          rounded-full
                          border
                          px-2.5 py-1
                          text-[9px]
                          font-black
                          tracking-wider
                          ${status.className}
                        `}
                      >
                        {status.label}
                      </span>

                    </div>

                    {/* ARROW */}
                    <div className="flex justify-end">

                      <ChevronRight
                        className="
                          h-4 w-4
                          text-zinc-700
                          transition
                          group-hover:translate-x-0.5
                          group-hover:text-zinc-400
                        "
                      />

                    </div>

                  </div>

                  {/* MOBILE EXTRA INFO */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-t border-zinc-800/50
                      bg-zinc-950/20
                      px-5 py-3
                      lg:hidden
                    "
                  >

                    <div className="flex flex-col gap-1">

                      <span className="text-[10px] text-zinc-600">
                        Organizer:{' '}
                        <span className="font-semibold text-zinc-400">
                          {group.organizer_name}
                        </span>
                      </span>

                      <span className="text-[10px] text-zinc-600">
                        Starts {formatDate(
                          group.start_date
                        )}
                      </span>

                    </div>

                    <span className="text-[10px] font-semibold text-zinc-500">
                      {group.active_members} /{' '}
                      {group.member_limit} members
                    </span>

                  </div>

                </Link>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}