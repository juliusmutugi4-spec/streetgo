'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { getSupabaseBrowser } from '../../lib/supabase-browser'
import { checkAdmin } from '../../lib/isAdmin'

interface SupportRequest {
  id: string
  user_id: string
  subject: string
  message: string
  category: string
  status:
    | 'open'
    | 'in_progress'
    | 'resolved'
    | 'closed'
  admin_reply: string | null
  created_at: string
  updated_at: string
}

interface SupportUser {
  id: string
  username: string | null
  avatar_url: string | null
  email: string | null
}

type StatusFilter =
  | 'all'
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'

export default function AdminSupportPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [authorized, setAuthorized] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [requests, setRequests] =
    useState<SupportRequest[]>([])

  const [users, setUsers] =
    useState<Record<string, SupportUser>>(
      {}
    )

  const [selectedRequestId, setSelectedRequestId] =
    useState<string | null>(null)

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  const [search, setSearch] =
    useState('')

  const [adminReply, setAdminReply] =
    useState('')

  const [savingReply, setSavingReply] =
    useState(false)

  const [updatingStatus, setUpdatingStatus] =
    useState(false)

  /*
   * =====================================================
   * CURRENT REQUEST
   * =====================================================
   */

  const selectedRequest =
    useMemo(
      () =>
        requests.find(
          (request) =>
            request.id ===
            selectedRequestId
        ) || null,
      [
        requests,
        selectedRequestId,
      ]
    )

  const selectedUser =
    selectedRequest
      ? users[selectedRequest.user_id] ||
        null
      : null

  /*
   * =====================================================
   * LOAD SUPPORT REQUESTS
   * =====================================================
   */

  const loadRequests =
    useCallback(
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from(
            'support_requests'
          )
          .select(
            `
              id,
              user_id,
              subject,
              message,
              category,
              status,
              admin_reply,
              created_at,
              updated_at
            `
          )
          .order(
            'created_at',
            {
              ascending: false,
            }
          )

        if (error) {
          console.error(
            'SUPPORT REQUEST LOAD ERROR:',
            {
              message:
                error.message,
              code:
                error.code,
              details:
                error.details,
              hint:
                error.hint,
            }
          )

          return
        }

        setRequests(
          (data || []) as SupportRequest[]
        )
      },
      [supabase]
    )

  /*
   * =====================================================
   * LOAD USER PROFILES
   * =====================================================
   */

  const loadUsers =
    useCallback(
      async (
        supportRequests:
          SupportRequest[]
      ) => {
        const userIds =
          Array.from(
            new Set(
              supportRequests.map(
                (
                  request
                ) =>
                  request.user_id
              )
            )
          )

        if (
          userIds.length ===
          0
        ) {
          setUsers({})
          return
        }

        const {
          data,
          error,
        } = await supabase
          .from(
            'profiles'
          )
          .select(
            'id, username, avatar_url'
          )
          .in(
            'id',
            userIds
          )

        if (error) {
          console.error(
            'SUPPORT USER LOAD ERROR:',
            {
              message:
                error.message,
              code:
                error.code,
              details:
                error.details,
              hint:
                error.hint,
            }
          )

          return
        }

        const nextUsers: Record<
          string,
          SupportUser
        > = {}

;(data || []).forEach(
  (
    profile: {
      id: string
      username: string | null
      avatar_url: string | null
    }
  ) => {
    nextUsers[
      profile.id
    ] = {
      id: profile.id,
      username:
        profile.username ??
        null,
      avatar_url:
        profile.avatar_url ??
        null,
      email: null,
    }
  }
)
        setUsers(
          nextUsers
        )
      },
      [supabase]
    )

  /*
   * =====================================================
   * INITIAL ADMIN CHECK
   * =====================================================
   */

  useEffect(() => {
    let mounted = true

    const verifyAdmin =
      async () => {
        try {
          const {
            data,
          } =
            await supabase.auth.getUser()

          if (!data.user) {
            router.push(
              '/login'
            )

            return
          }

          const admin =
            await checkAdmin(
              data.user.id
            )

          if (!admin) {
            router.push('/')

            return
          }

          if (!mounted) {
            return
          }

          setAuthorized(true)

          const {
            data: requestData,
            error:
              requestError,
          } =
            await supabase
              .from(
                'support_requests'
              )
              .select(
                `
                  id,
                  user_id,
                  subject,
                  message,
                  category,
                  status,
                  admin_reply,
                  created_at,
                  updated_at
                `
              )
              .order(
                'created_at',
                {
                  ascending:
                    false,
                }
              )

          if (requestError) {
            console.error(
              'SUPPORT INITIAL LOAD ERROR:',
              requestError
            )

            return
          }

          const loadedRequests =
            (requestData ||
              []) as SupportRequest[]

          if (!mounted) {
            return
          }

          setRequests(
            loadedRequests
          )

          await loadUsers(
            loadedRequests
          )
        } catch (error) {
          console.error(
            'SUPPORT ADMIN CHECK FAILED:',
            error
          )
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }

    void verifyAdmin()

    return () => {
      mounted = false
    }
  }, [
    supabase,
    router,
    loadUsers,
  ])

  /*
   * =====================================================
   * REFRESH
   * =====================================================
   */

  const refreshRequests =
    async () => {
      setRefreshing(true)

      try {
        await loadRequests()

        /*
         * Reload users after request
         * changes as well.
         */
        const {
          data,
          error,
        } = await supabase
          .from(
            'support_requests'
          )
          .select(
            `
              id,
              user_id,
              subject,
              message,
              category,
              status,
              admin_reply,
              created_at,
              updated_at
            `
          )
          .order(
            'created_at',
            {
              ascending: false,
            }
          )

        if (
          !error &&
          data
        ) {
          await loadUsers(
            data as SupportRequest[]
          )
        }
      } catch (error) {
        console.error(
          'SUPPORT REFRESH FAILED:',
          error
        )
      } finally {
        setRefreshing(false)
      }
    }

  /*
   * =====================================================
   * SELECT REQUEST
   * =====================================================
   */

  const selectRequest =
    (
      request:
        SupportRequest
    ) => {
      setSelectedRequestId(
        request.id
      )

      setAdminReply(
        request.admin_reply ||
          ''
      )
    }

  /*
   * =====================================================
   * UPDATE STATUS
   * =====================================================
   */

  const updateStatus =
    async (
      status:
        | 'open'
        | 'in_progress'
        | 'resolved'
        | 'closed'
    ) => {
      if (
        !selectedRequest
      ) {
        return
      }

      setUpdatingStatus(true)

      try {
        const {
          error,
        } =
          await supabase
            .from(
              'support_requests'
            )
            .update({
              status,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              'id',
              selectedRequest.id
            )

        if (error) {
          console.error(
            'SUPPORT STATUS UPDATE ERROR:',
            error
          )

          window.alert(
            error.message
          )

          return
        }

        setRequests(
          (previous) =>
            previous.map(
              (request) =>
                request.id ===
                selectedRequest.id
                  ? {
                      ...request,
                      status,
                      updated_at:
                        new Date().toISOString(),
                    }
                  : request
            )
        )
      } catch (error) {
        console.error(
          'SUPPORT STATUS UPDATE FAILED:',
          error
        )
      } finally {
        setUpdatingStatus(
          false
        )
      }
    }

  /*
   * =====================================================
   * SAVE ADMIN REPLY
   * =====================================================
   */

  const saveReply =
    async () => {
      if (
        !selectedRequest
      ) {
        return
      }

      const reply =
        adminReply.trim()

      setSavingReply(true)

      try {
        const {
          error,
        } =
          await supabase
            .from(
              'support_requests'
            )
            .update({
              admin_reply:
                reply || null,
              status:
                reply
                  ? 'in_progress'
                  : selectedRequest.status,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              'id',
              selectedRequest.id
            )

        if (error) {
          console.error(
            'SUPPORT REPLY ERROR:',
            error
          )

          window.alert(
            error.message
          )

          return
        }

        setRequests(
          (previous) =>
            previous.map(
              (request) =>
                request.id ===
                selectedRequest.id
                  ? {
                      ...request,
                      admin_reply:
                        reply ||
                        null,
                      status:
                        reply
                          ? 'in_progress'
                          : request.status,
                      updated_at:
                        new Date().toISOString(),
                    }
                  : request
            )
        )

        if (reply) {
          setAdminReply(
            reply
          )
        }
      } catch (error) {
        console.error(
          'SUPPORT REPLY SAVE FAILED:',
          error
        )
      } finally {
        setSavingReply(false)
      }
    }

  /*
   * =====================================================
   * FILTERING
   * =====================================================
   */

  const filteredRequests =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase()

      return requests.filter(
        (request) => {
          const user =
            users[
              request.user_id
            ]

          const matchesStatus =
            statusFilter ===
              'all' ||
            request.status ===
              statusFilter

          if (
            !matchesStatus
          ) {
            return false
          }

          if (!normalized) {
            return true
          }

          return (
            request.subject
              .toLowerCase()
              .includes(
                normalized
              ) ||
            request.message
              .toLowerCase()
              .includes(
                normalized
              ) ||
            request.category
              .toLowerCase()
              .includes(
                normalized
              ) ||
            (
              user?.username ||
              ''
            )
              .toLowerCase()
              .includes(
                normalized
              )
          )
        }
      )
    }, [
      requests,
      users,
      statusFilter,
      search,
    ])

  /*
   * =====================================================
   * COUNTS
   * =====================================================
   */

  const counts = useMemo(() => {
    return {
      all: requests.length,

      open: requests.filter(
        (request) =>
          request.status ===
          'open'
      ).length,

      in_progress:
        requests.filter(
          (request) =>
            request.status ===
            'in_progress'
        ).length,

      resolved:
        requests.filter(
          (request) =>
            request.status ===
            'resolved'
        ).length,

      closed:
        requests.filter(
          (request) =>
            request.status ===
            'closed'
        ).length,
    }
  }, [requests])

  /*
   * =====================================================
   * STATUS DISPLAY
   * =====================================================
   */

  const statusLabel =
    (
      status:
        SupportRequest['status']
    ) => {
      switch (status) {
        case 'open':
          return 'Open'

        case 'in_progress':
          return 'In Progress'

        case 'resolved':
          return 'Resolved'

        case 'closed':
          return 'Closed'

        default:
          return status
      }
    }

  const statusClasses =
    (
      status:
        SupportRequest['status']
    ) => {
      switch (status) {
        case 'open':
          return `
            border-amber-500/30
            bg-amber-500/10
            text-amber-400
          `

        case 'in_progress':
          return `
            border-sky-500/30
            bg-sky-500/10
            text-sky-400
          `

        case 'resolved':
          return `
            border-emerald-500/30
            bg-emerald-500/10
            text-emerald-400
          `

        case 'closed':
          return `
            border-zinc-700
            bg-zinc-800
            text-zinc-400
          `
      }
    }

  /*
   * =====================================================
   * DATE
   * =====================================================
   */

  const formatDate =
    (
      value: string
    ) => {
      return new Intl.DateTimeFormat(
        'en-KE',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        }
      ).format(
        new Date(value)
      )
    }

  /*
   * =====================================================
   * AUTH LOADING
   * =====================================================
   */

  if (loading ||
      !authorized) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#09090b]
          text-white
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-zinc-400
          "
        >
          <Loader2
            size={17}
            className="animate-spin"
          />

          Checking permissions...
        </div>
      </main>
    )
  }

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main
      className="
        min-h-screen
        w-full
        bg-[#09090b]
        text-zinc-50
        antialiased
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1500px]
          flex-col
          gap-5
          p-4
          sm:p-6
          lg:p-8
        "
      >
        {/* HEADER */}

        <header
          className="
            flex
            flex-col
            gap-4
            border-b
            border-zinc-800/70
            pb-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <ShieldAlert
                size={20}
                className="text-amber-400"
              />

              <h1
                className="
                  text-xl
                  font-semibold
                  tracking-tight
                  text-zinc-100
                "
              >
                Support Center
              </h1>
            </div>

            <p
              className="
                mt-1
                text-xs
                text-zinc-500
              "
            >
              Receive and manage StreetGO user support requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void refreshRequests()
            }
            disabled={
              refreshing
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-zinc-700
              bg-zinc-900
              px-3
              py-2
              text-xs
              font-medium
              text-zinc-200
              transition-all
              hover:bg-zinc-800
              active:scale-[0.98]
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>
        </header>

        {/* STATS */}

        <section
          className="
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-5
          "
        >
          {(
            [
              [
                'All',
                'all',
                counts.all,
              ],
              [
                'Open',
                'open',
                counts.open,
              ],
              [
                'In Progress',
                'in_progress',
                counts.in_progress,
              ],
              [
                'Resolved',
                'resolved',
                counts.resolved,
              ],
              [
                'Closed',
                'closed',
                counts.closed,
              ],
            ] as const
          ).map(
            (item) => {
              const [
                label,
                value,
                count,
              ] = item

              const active =
                statusFilter ===
                value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      value
                    )
                  }
                  className={`
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-left
                    transition-all

                    ${
                      active
                        ? `
                          border-zinc-600
                          bg-zinc-800
                        `
                        : `
                          border-zinc-800
                          bg-zinc-900/70
                          hover:bg-zinc-800/70
                        `
                    }
                  `}
                >
                  <div
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-zinc-500
                    "
                  >
                    {label}
                  </div>

                  <div
                    className="
                      mt-1
                      text-xl
                      font-semibold
                      text-zinc-100
                    "
                  >
                    {count}
                  </div>
                </button>
              )
            }
          )}
        </section>

        {/* SEARCH */}

        <div className="relative">
          <Search
            size={16}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-zinc-600
            "
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search subject, message, category, or username..."
            className="
              h-10
              w-full
              rounded-lg
              border
              border-zinc-800
              bg-zinc-900
              pl-9
              pr-3
              text-sm
              text-zinc-100
              outline-none
              placeholder:text-zinc-600
              focus:border-zinc-600
            "
          />
        </div>

        {/* SUPPORT WORKSPACE */}

        <section
          className="
            grid
            min-h-[600px]
            grid-cols-1
            overflow-hidden
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900/50
            lg:grid-cols-[390px_minmax(0,1fr)]
          "
        >
          {/* REQUEST LIST */}

          <div
            className="
              flex
              min-h-0
              flex-col
              border-b
              border-zinc-800
              lg:border-b-0
              lg:border-r
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-zinc-800
                px-4
                py-3
              "
            >
              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-zinc-400
                "
              >
                Requests
              </span>

              <span
                className="
                  text-[10px]
                  text-zinc-600
                "
              >
                {filteredRequests.length}
              </span>
            </div>

            <div
              className="
                max-h-[620px]
                overflow-y-auto
              "
            >
              {filteredRequests.length ===
                0 && (
                <div
                  className="
                    px-5
                    py-12
                    text-center
                  "
                >
                  <MessageSquare
                    size={24}
                    className="
                      mx-auto
                      text-zinc-700
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-zinc-400
                    "
                  >
                    No support requests
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-zinc-600
                    "
                  >
                    Nothing matches the current filter.
                  </p>
                </div>
              )}

              {filteredRequests.map(
                (
                  request
                ) => {
                  const user =
                    users[
                      request.user_id
                    ]

                  const active =
                    request.id ===
                    selectedRequestId

                  return (
                    <button
                      key={
                        request.id
                      }
                      type="button"
                      onClick={() =>
                        selectRequest(
                          request
                        )
                      }
                      className={`
                        w-full
                        border-b
                        border-zinc-800
                        px-4
                        py-4
                        text-left
                        transition-colors

                        ${
                          active
                            ? `
                              bg-zinc-800/80
                            `
                            : `
                              hover:bg-zinc-900
                            `
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <div
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-zinc-100
                            "
                          >
                            {
                              request.subject
                            }
                          </div>

                          <div
                            className="
                              mt-1
                              flex
                              items-center
                              gap-1.5
                              text-[10px]
                              text-zinc-500
                            "
                          >
                            <User
                              size={11}
                            />

                            <span>
                              {user?.username ||
                                'Unknown user'}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {
                                request.category
                              }
                            </span>
                          </div>
                        </div>

                        <span
                          className={`
                            shrink-0
                            rounded-full
                            border
                            px-2
                            py-0.5
                            text-[9px]
                            font-semibold
                            ${statusClasses(
                              request.status
                            )}
                          `}
                        >
                          {statusLabel(
                            request.status
                          )}
                        </span>
                      </div>

                      <p
                        className="
                          mt-2
                          line-clamp-2
                          text-xs
                          leading-5
                          text-zinc-500
                        "
                      >
                        {
                          request.message
                        }
                      </p>

                      <div
                        className="
                          mt-2
                          text-[10px]
                          text-zinc-700
                        "
                      >
                        {formatDate(
                          request.created_at
                        )}
                      </div>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* REQUEST DETAIL */}

          <div
            className="
              min-w-0
              bg-zinc-950/30
            "
          >
            {!selectedRequest ? (
              <div
                className="
                  flex
                  min-h-[600px]
                  flex-col
                  items-center
                  justify-center
                  px-6
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-zinc-800
                    bg-zinc-900
                    text-zinc-600
                  "
                >
                  <MessageSquare
                    size={23}
                  />
                </div>

                <h2
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-zinc-300
                  "
                >
                  Select a support request
                </h2>

                <p
                  className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-zinc-600
                  "
                >
                  Choose a request from the list to read the user's message and respond.
                </p>
              </div>
            ) : (
              <div
                className="
                  flex
                  min-h-[600px]
                  flex-col
                "
              >
                {/* DETAIL HEADER */}

                <div
                  className="
                    border-b
                    border-zinc-800
                    px-4
                    py-4
                    sm:px-5
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <h2
                        className="
                          text-base
                          font-semibold
                          text-zinc-100
                        "
                      >
                        {
                          selectedRequest.subject
                        }
                      </h2>

                      <div
                        className="
                          mt-1
                          flex
                          flex-wrap
                          items-center
                          gap-2
                          text-[10px]
                          text-zinc-500
                        "
                      >
                        <span>
                          {selectedUser?.username ||
                            'Unknown user'}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {
                            selectedRequest.category
                          }
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {formatDate(
                            selectedRequest.created_at
                          )}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`
                        self-start
                        rounded-full
                        border
                        px-2.5
                        py-1
                        text-[9px]
                        font-semibold
                        ${statusClasses(
                          selectedRequest.status
                        )}
                      `}
                    >
                      {statusLabel(
                        selectedRequest.status
                      )}
                    </span>
                  </div>
                </div>

                {/* MESSAGE */}

                <div
                  className="
                    flex-1
                    space-y-5
                    overflow-y-auto
                    px-4
                    py-5
                    sm:px-5
                  "
                >
                  <div>
                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-zinc-600
                      "
                    >
                      <MessageSquare
                        size={12}
                      />

                      User message
                    </div>

                    <div
                      className="
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        p-4
                      "
                    >
                      <p
                        className="
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          text-zinc-300
                        "
                      >
                        {
                          selectedRequest.message
                        }
                      </p>
                    </div>
                  </div>

                  {/* EXISTING REPLY */}

                  {selectedRequest.admin_reply && (
                    <div>
                      <div
                        className="
                          mb-2
                          flex
                          items-center
                          gap-2
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.1em]
                          text-emerald-500/70
                        "
                      >
                        <ShieldAlert
                          size={12}
                        />

                        Admin reply
                      </div>

                      <div
                        className="
                          rounded-xl
                          border
                          border-emerald-500/20
                          bg-emerald-500/5
                          p-4
                        "
                      >
                        <p
                          className="
                            whitespace-pre-wrap
                            text-sm
                            leading-6
                            text-zinc-300
                          "
                        >
                          {
                            selectedRequest.admin_reply
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* REPLY */}

                  <div>
                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-zinc-600
                      "
                    >
                      <Mail
                        size={12}
                      />

                      Admin response
                    </div>

                    <textarea
                      value={adminReply}
                      onChange={(
                        event
                      ) =>
                        setAdminReply(
                          event.target
                            .value
                        )
                      }
                      placeholder="Write a response to this user..."
                      rows={6}
                      className="
                        w-full
                        resize-y
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        px-4
                        py-3
                        text-sm
                        leading-6
                        text-zinc-200
                        outline-none
                        placeholder:text-zinc-700
                        focus:border-zinc-600
                      "
                    />

                    <div
                      className="
                        mt-2
                        flex
                        justify-end
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void saveReply()
                        }
                        disabled={
                          savingReply
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          bg-zinc-100
                          px-3.5
                          py-2
                          text-xs
                          font-semibold
                          text-zinc-900
                          transition-all
                          hover:bg-white
                          active:scale-[0.98]
                          disabled:opacity-50
                        "
                      >
                        {savingReply && (
                          <Loader2
                            size={13}
                            className="animate-spin"
                          />
                        )}

                        Save response
                      </button>
                    </div>
                  </div>
                </div>

                {/* STATUS CONTROLS */}

                <div
                  className="
                    border-t
                    border-zinc-800
                    px-4
                    py-3
                    sm:px-5
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        mr-1
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-zinc-600
                      "
                    >
                      Status
                    </span>

                    <button
                      type="button"
                      disabled={
                        updatingStatus
                      }
                      onClick={() =>
                        void updateStatus(
                          'open'
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-amber-500/20
                        bg-amber-500/5
                        px-3
                        py-2
                        text-[10px]
                        font-semibold
                        text-amber-400
                        transition-colors
                        hover:bg-amber-500/10
                      "
                    >
                      <Clock3
                        size={12}
                      />

                      Open
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingStatus
                      }
                      onClick={() =>
                        void updateStatus(
                          'in_progress'
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-sky-500/20
                        bg-sky-500/5
                        px-3
                        py-2
                        text-[10px]
                        font-semibold
                        text-sky-400
                        transition-colors
                        hover:bg-sky-500/10
                      "
                    >
                      <Loader2
                        size={12}
                      />

                      In Progress
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingStatus
                      }
                      onClick={() =>
                        void updateStatus(
                          'resolved'
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-emerald-500/20
                        bg-emerald-500/5
                        px-3
                        py-2
                        text-[10px]
                        font-semibold
                        text-emerald-400
                        transition-colors
                        hover:bg-emerald-500/10
                      "
                    >
                      <CheckCircle2
                        size={12}
                      />

                      Resolve
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingStatus
                      }
                      onClick={() =>
                        void updateStatus(
                          'closed'
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-zinc-700
                        bg-zinc-900
                        px-3
                        py-2
                        text-[10px]
                        font-semibold
                        text-zinc-400
                        transition-colors
                        hover:bg-zinc-800
                      "
                    >
                      <XCircle
                        size={12}
                      />

                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}