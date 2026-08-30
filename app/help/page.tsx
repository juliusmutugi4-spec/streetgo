'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  XCircle,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { getSupabaseBrowser } from '../lib/supabase-browser'

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

const categories = [
  'General',
  'Account',
  'Payments / REAX',
  'Get Ride',
  'Videos',
  'Messages',
  'Technical Problem',
  'Report a User',
  'Other',
]

export default function HelpPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

if (
  typeof window !== 'undefined'
) {
  ;(
    window as typeof window & {
      streetgoSupabase?: typeof supabase
    }
  ).streetgoSupabase = supabase
}


  const [userId, setUserId] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [requests, setRequests] =
    useState<SupportRequest[]>([])

  const [category, setCategory] =
    useState('General')

  const [subject, setSubject] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [selectedRequestId, setSelectedRequestId] =
    useState<string | null>(null)

  /*
   * =====================================================
   * LOAD CURRENT USER
   * =====================================================
   */

  useEffect(() => {
    let mounted = true

    const loadSupportData =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession()

          if (error) {
            console.error(
              'SUPPORT SESSION ERROR:',
              error
            )

            return
          }

          const user =
            data.session?.user ?? null

          if (!user) {
            router.push('/login')
            return
          }

          if (!mounted) {
            return
          }

          setUserId(user.id)

          await loadRequests(
            user.id
          )
        } catch (error) {
          console.error(
            'SUPPORT LOAD FAILED:',
            error
          )
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }

    void loadSupportData()

    return () => {
      mounted = false
    }
  }, [router, supabase])



useEffect(() => {
  if (
    requests.length ===
    0
  ) {
    return
  }

  const replies =
    requests.filter(
      (
        request
      ) =>
        Boolean(
          request.admin_reply
        )
    )

  if (
    replies.length ===
    0
  ) {
    return
  }

  const seenKey =
    'streetgo-support-seen'

  let seen:
    Record<string, string> = {}

  try {
    const stored =
      localStorage.getItem(
        seenKey
      )

    seen = stored
      ? JSON.parse(stored)
      : {}
  } catch {
    seen = {}
  }

  for (
    const request of replies
  ) {
    if (
      request.admin_reply
    ) {
      seen[request.id] =
        request.admin_reply
    }
  }

  localStorage.setItem(
    seenKey,
    JSON.stringify(seen)
  )

  window.dispatchEvent(
    new Event(
      'streetgo-support-seen'
    )
  )
}, [requests])





  /*
   * =====================================================
   * LOAD MY SUPPORT REQUESTS
   * =====================================================
   */

  const loadRequests =
    async (
      currentUserId: string
    ) => {
      const {
        data,
        error,
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
          .eq(
            'user_id',
            currentUserId
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            }
          )

      if (error) {
console.error(
  'SUPPORT REQUEST LOAD ERROR:',
  error
)

console.error(
  'SUPPORT REQUEST LOAD ERROR JSON:',
  JSON.stringify(
    error,
    Object.getOwnPropertyNames(
      error
    )
  )
)

console.error(
  'SUPPORT REQUEST ERROR DETAILS:',
  {
    message:
      error?.message,
    code:
      error?.code,
    details:
      error?.details,
    hint:
      error?.hint,
    status:
      error?.status,
    statusText:
      error?.statusText,
    name:
      error?.name,
  }
)

        return
      }

      setRequests(
        (data || []) as SupportRequest[]
      )
    }

  /*
   * =====================================================
   * SUBMIT REQUEST
   * =====================================================
   */

  const submitRequest =
    async () => {
      if (!userId) {
        router.push('/login')
        return
      }

      const cleanSubject =
        subject.trim()

      const cleanMessage =
        message.trim()

      if (!cleanSubject) {
        window.alert(
          'Please enter a subject.'
        )

        return
      }

      if (!cleanMessage) {
        window.alert(
          'Please describe your problem.'
        )

        return
      }

      if (
        cleanSubject.length <
        3
      ) {
        window.alert(
          'Subject is too short.'
        )

        return
      }

      if (
        cleanMessage.length <
        5
      ) {
        window.alert(
          'Please provide more details.'
        )

        return
      }

      setSubmitting(true)

      try {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              'support_requests'
            )
            .insert({
              user_id:
                userId,
              subject:
                cleanSubject,
              message:
                cleanMessage,
              category,
              status:
                'open',
            })
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
            .single()

        if (error) {
          console.error(
            'SUPPORT SUBMIT ERROR:',
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

          window.alert(
            error.message ||
              'Unable to send your support request.'
          )

          return
        }

        const newRequest =
          data as SupportRequest

        setRequests(
          (previous) => [
            newRequest,
            ...previous,
          ]
        )

        setSubject('')
        setMessage('')
        setCategory(
          'General'
        )

        setSelectedRequestId(
          newRequest.id
        )

        window.alert(
          'Your support request has been sent.'
        )
      } catch (error) {
        console.error(
          'SUPPORT SUBMIT FAILED:',
          error
        )

        window.alert(
          'Unable to send your support request.'
        )
      } finally {
        setSubmitting(false)
      }
    }

  /*
   * =====================================================
   * STATUS
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
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[var(--background)]
          text-[var(--foreground)]
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-[var(--muted)]
          "
        >
          <Loader2
            size={17}
            className="animate-spin"
          />

          Loading Support...
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
        bg-[var(--background)]
        text-[var(--foreground)]
      "
    >
      {/* HEADER */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-[var(--border)]
          bg-[var(--background)]/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-full
            max-w-4xl
            items-center
            gap-2
            px-3
            sm:px-4
          "
        >
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-[var(--muted)]
              transition-colors
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--foreground)]
              active:scale-95
            "
          >
            <ArrowLeft
              size={18}
              strokeWidth={2}
            />
          </button>

          <div className="min-w-0">
            <h1
              className="
                truncate
                text-sm
                font-bold
                text-[var(--foreground)]
              "
            >
              StreetGO Support
            </h1>

            <p
              className="
                truncate
                text-[10px]
                text-[var(--muted)]
              "
            >
              We're here to help
            </p>
          </div>
        </div>
      </header>

      <div
        className="
          mx-auto
          flex
          w-full
          max-w-4xl
          flex-col
          gap-4
          px-3
          py-4
          sm:px-4
          sm:py-6
        "
      >
        {/* =================================================
            SUPPORT INTRO
            ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            p-4
            sm:p-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[var(--accent)]/10
                text-[var(--accent)]
              "
            >
<HelpCircle
  size={20}
  strokeWidth={1.9}
/>
            </div>

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                "
              >
                Need help?
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-[var(--muted)]
                "
              >
                Contact the StreetGO support team through this center. Your request will be delivered to our admin team.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTACT OPTIONS
            ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            gap-2
            sm:grid-cols-2
          "
        >
          <a
            href="mailto:support@streetgo.app"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
              p-3.5
              transition-colors
              hover:bg-[var(--surface-hover)]
              active:scale-[0.99]
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[var(--surface-hover)]
                text-[var(--accent)]
              "
            >
              <Mail
                size={17}
              />
            </div>

            <div className="min-w-0">
              <div
                className="
                  text-xs
                  font-bold
                "
              >
                Email Support
              </div>

              <div
                className="
                  mt-0.5
                  truncate
                  text-[10px]
                  text-[var(--muted)]
                "
              >
                support@streetgo.app
              </div>
            </div>
          </a>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
              p-3.5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[var(--surface-hover)]
                text-[var(--accent)]
              "
            >
              <MessageSquare
                size={17}
              />
            </div>

            <div className="min-w-0">
              <div
                className="
                  text-xs
                  font-bold
                "
              >
                Admin Support
              </div>

              <div
                className="
                  mt-0.5
                  text-[10px]
                  text-[var(--muted)]
                "
              >
                Send a request below
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            NEW REQUEST
            ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            p-4
            sm:p-5
          "
        >
          <div className="mb-4">
            <h2
              className="
                text-sm
                font-bold
              "
            >
              Contact StreetGO
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-[var(--muted)]
              "
            >
              Tell us what happened and we'll review your request.
            </p>
          </div>

          {/* CATEGORY */}

          <label
            className="
              block
              text-[10px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[var(--muted)]
            "
          >
            Category
          </label>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            className="
              mt-1.5
              h-10
              w-full
              rounded-lg
              border
              border-[var(--border)]
              bg-[var(--background)]
              px-3
              text-sm
              text-[var(--foreground)]
              outline-none
              focus:border-[var(--accent)]
            "
          >
            {categories.map(
              (
                item
              ) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          {/* SUBJECT */}

          <label
            className="
              mt-4
              block
              text-[10px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[var(--muted)]
            "
          >
            Subject
          </label>

          <input
            type="text"
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value
              )
            }
            maxLength={120}
            placeholder="What do you need help with?"
            className="
              mt-1.5
              h-10
              w-full
              rounded-lg
              border
              border-[var(--border)]
              bg-[var(--background)]
              px-3
              text-sm
              text-[var(--foreground)]
              outline-none
              placeholder:text-[var(--muted)]
              focus:border-[var(--accent)]
            "
          />

          {/* MESSAGE */}

          <label
            className="
              mt-4
              block
              text-[10px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[var(--muted)]
            "
          >
            Message
          </label>

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            maxLength={3000}
            rows={7}
            placeholder="Describe your problem in detail..."
            className="
              mt-1.5
              w-full
              resize-y
              rounded-lg
              border
              border-[var(--border)]
              bg-[var(--background)]
              px-3
              py-3
              text-sm
              leading-6
              text-[var(--foreground)]
              outline-none
              placeholder:text-[var(--muted)]
              focus:border-[var(--accent)]
            "
          />

          <div
            className="
              mt-2
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-[10px]
                text-[var(--muted)]
              "
            >
              {message.length}/3000
            </span>

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                void submitRequest()
              }
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[var(--accent)]
                px-4
                text-xs
                font-bold
                text-black
                transition-all
                hover:opacity-90
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={14}
                  strokeWidth={2}
                />
              )}

              {submitting
                ? 'Sending...'
                : 'Send Request'}
            </button>
          </div>
        </section>

        {/* =================================================
            MY REQUESTS
            ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          <div
            className="
              border-b
              border-[var(--border)]
              px-4
              py-3
              sm:px-5
            "
          >
            <h2
              className="
                text-sm
                font-bold
              "
            >
              My Support Requests
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-[var(--muted)]
              "
            >
              Track requests you've sent to StreetGO.
            </p>
          </div>

          {requests.length ===
          0 ? (
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
                  text-[var(--muted)]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                "
              >
                No requests yet
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--muted)]
                "
              >
                Your support requests will appear here.
              </p>
            </div>
          ) : (
            <div>
              {requests.map(
                (
                  request
                ) => {
                  const selected =
                    selectedRequestId ===
                    request.id

                  return (
                    <div
                      key={
                        request.id
                      }
                      className="
                        border-b
                        border-[var(--border)]
                        last:border-b-0
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRequestId(
                            selected
                              ? null
                              : request.id
                          )
                        }
                        className="
                          w-full
                          px-4
                          py-3.5
                          text-left
                          transition-colors
                          hover:bg-[var(--surface-hover)]
                          sm:px-5
                        "
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
                                flex-wrap
                                items-center
                                gap-1.5
                                text-[10px]
                                text-[var(--muted)]
                              "
                            >
                              <span>
                                {
                                  request.category
                                }
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {formatDate(
                                  request.created_at
                                )}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`
                              shrink-0
                              rounded-full
                              border
                              px-2
                              py-1
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
                      </button>

                      {selected && (
                        <div
                          className="
                            border-t
                            border-[var(--border)]
                            px-4
                            py-4
                            sm:px-5
                          "
                        >
                          <div
                            className="
                              rounded-xl
                              border
                              border-[var(--border)]
                              bg-[var(--background)]
                              p-3.5
                            "
                          >
                            <div
                              className="
                                mb-2
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.1em]
                                text-[var(--muted)]
                              "
                            >
                              Your message
                            </div>

                            <p
                              className="
                                whitespace-pre-wrap
                                text-sm
                                leading-6
                              "
                            >
                              {
                                request.message
                              }
                            </p>
                          </div>

                          {request.admin_reply && (
                            <div
                              className="
                                mt-3
                                rounded-xl
                                border
                                border-emerald-500/20
                                bg-emerald-500/5
                                p-3.5
                              "
                            >
                              <div
                                className="
                                  mb-2
                                  flex
                                  items-center
                                  gap-1.5
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-[0.1em]
                                  text-emerald-500
                                "
                              >
                                <CheckCircle2
                                  size={12}
                                />

                                StreetGO Admin
                              </div>

                              <p
                                className="
                                  whitespace-pre-wrap
                                  text-sm
                                  leading-6
                                "
                              >
                                {
                                  request.admin_reply
                                }
                              </p>
                            </div>
                          )}

                          {request.status ===
                            'resolved' && (
                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                gap-2
                                text-[10px]
                                text-emerald-500
                              "
                            >
                              <CheckCircle2
                                size={13}
                              />

                              This request has been resolved.
                            </div>
                          )}

                          {request.status ===
                            'closed' && (
                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                gap-2
                                text-[10px]
                                text-[var(--muted)]
                              "
                            >
                              <XCircle
                                size={13}
                              />

                              This request is closed.
                            </div>
                          )}

                          {request.status ===
                            'in_progress' && (
                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                gap-2
                                text-[10px]
                                text-sky-400
                              "
                            >
                              <Clock3
                                size={13}
                              />

                              Our team is working on it.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}