'use client'

import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Lock,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
  Wallet,
  LogOut,
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ThemeMode =
  | 'system'
  | 'light'
  | 'dark'

export default function SettingsPage() {
  const router = useRouter()

  const [theme, setTheme] =
    useState<ThemeMode>('system')

  const [notifications, setNotifications] =
    useState(true)

  const [messages, setMessages] =
    useState(true)

  const [reaxNotifications, setReaxNotifications] =
    useState(true)

  /*
   * =====================================================
   * LOAD SETTINGS
   * =====================================================
   */

  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem(
          'streetgo-theme'
        ) as ThemeMode | null

      const savedNotifications =
        localStorage.getItem(
          'streetgo-notifications'
        )

      const savedMessages =
        localStorage.getItem(
          'streetgo-messages'
        )

      const savedReax =
        localStorage.getItem(
          'streetgo-reax-notifications'
        )

      if (
        savedTheme === 'system' ||
        savedTheme === 'light' ||
        savedTheme === 'dark'
      ) {
        setTheme(savedTheme)

        const root =
          document.documentElement

        if (savedTheme === 'light') {
          root.dataset.theme = 'light'
        } else if (
          savedTheme === 'dark'
        ) {
          root.dataset.theme = 'dark'
        } else {
          const prefersDark =
            window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches

          root.dataset.theme =
            prefersDark
              ? 'dark'
              : 'light'
        }
      }

      if (
        savedNotifications !== null
      ) {
        setNotifications(
          savedNotifications === 'true'
        )
      }

      if (
        savedMessages !== null
      ) {
        setMessages(
          savedMessages === 'true'
        )
      }

      if (
        savedReax !== null
      ) {
        setReaxNotifications(
          savedReax === 'true'
        )
      }
    } catch {
      // Ignore local settings errors.
    }
  }, [])

  /*
   * =====================================================
   * APPLY THEME
   * =====================================================
   */

  const applyTheme = (
    nextTheme: ThemeMode
  ) => {
    setTheme(nextTheme)

    try {
      localStorage.setItem(
        'streetgo-theme',
        nextTheme
      )

      const root =
        document.documentElement

      if (
        nextTheme === 'light'
      ) {
        root.dataset.theme =
          'light'

        return
      }

      if (
        nextTheme === 'dark'
      ) {
        root.dataset.theme =
          'dark'

        return
      }

      const prefersDark =
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches

      root.dataset.theme =
        prefersDark
          ? 'dark'
          : 'light'
    } catch {
      // Ignore.
    }
  }

  /*
   * =====================================================
   * NOTIFICATION SETTINGS
   * =====================================================
   */

  const updateNotifications = (
    value: boolean
  ) => {
    setNotifications(value)

    try {
      localStorage.setItem(
        'streetgo-notifications',
        String(value)
      )
    } catch {}
  }

  const updateMessages = (
    value: boolean
  ) => {
    setMessages(value)

    try {
      localStorage.setItem(
        'streetgo-messages',
        String(value)
      )
    } catch {}
  }

  const updateReaxNotifications = (
    value: boolean
  ) => {
    setReaxNotifications(value)

    try {
      localStorage.setItem(
        'streetgo-reax-notifications',
        String(value)
      )
    } catch {}
  }

  /*
   * =====================================================
   * COMMON ROW
   * =====================================================
   */

  const rowClass = `
    flex
    w-full
    items-center
    gap-3
    px-3
    py-3.5
    text-left
    transition-colors
    duration-150
    hover:bg-[var(--surface-hover)]
  `

  return (
    <main
      className="
        min-h-screen
        bg-[var(--background)]
        text-[var(--foreground)]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-2xl
          px-3
          py-4
          sm:px-5
          sm:py-6
        "
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <header
          className="
            mb-4
            flex
            items-center
            gap-2
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
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              text-[var(--muted)]
              transition-colors
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--foreground)]
              active:scale-95
            "
          >
            <ChevronRight
              size={15}
              className="rotate-180"
            />
          </button>

          <div>
            <h1
              className="
                font-['Courier_New']
                text-[15px]
                font-black
                tracking-tight
              "
            >
              Settings
            </h1>

            <p
              className="
                mt-0.5
                font-['Courier_New']
                text-[9px]
                text-[var(--muted)]
              "
            >
              StreetGO preferences
            </p>
          </div>
        </header>

        {/* =================================================
            APPEARANCE
            ================================================= */}

        <section
          className="
            mb-3
            overflow-hidden
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          <div
            className="
              px-3
              py-2.5
              font-['Courier_New']
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--muted)]
            "
          >
            Appearance
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-1
              px-2
              pb-2
            "
          >
            {(
              [
                [
                  'system',
                  'System',
                  Palette,
                ],
                [
                  'light',
                  'Light',
                  Sun,
                ],
                [
                  'dark',
                  'Dark',
                  Moon,
                ],
              ] as const
            ).map(
              ([
                value,
                label,
                Icon,
              ]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    applyTheme(value)
                  }
                  className={`
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1.5
                    rounded-lg
                    px-2
                    py-3
                    font-['Courier_New']
                    text-[9px]
                    font-bold
                    transition-colors
                    duration-150

                    ${
                      theme === value
                        ? `
                          bg-[var(--surface-hover)]
                          text-[var(--accent)]
                        `
                        : `
                          text-[var(--muted)]
                          hover:bg-[var(--surface-hover)]
                          hover:text-[var(--foreground)]
                        `
                    }
                  `}
                >
                  <Icon
                    size={14}
                    strokeWidth={1.8}
                  />

                  {label}
                </button>
              )
            )}
          </div>
        </section>

        {/* =================================================
            ACCOUNT
            ================================================= */}

        <section
          className="
            mb-3
            overflow-hidden
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          <div
            className="
              px-3
              py-2.5
              font-['Courier_New']
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--muted)]
            "
          >
            Account
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/settings/profile'
              )
            }
            className={rowClass}
          >
            <User
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Profile
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                Edit your profile
              </span>
            </span>

            <ChevronRight
              size={13}
              className="text-[var(--muted)]"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              router.push('/reax')
            }
            className={rowClass}
          >
            <Wallet
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-emerald-500
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                  text-emerald-500
                "
              >
                REAX Wallet
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                Balance and transactions
              </span>
            </span>

            <ChevronRight
              size={13}
              className="text-[var(--muted)]"
            />
          </button>
        </section>

        {/* =================================================
            NOTIFICATIONS
            ================================================= */}

        <section
          className="
            mb-3
            overflow-hidden
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          <div
            className="
              px-3
              py-2.5
              font-['Courier_New']
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--muted)]
            "
          >
            Notifications
          </div>

          <label
            className="
              flex
              w-full
              cursor-pointer
              items-center
              gap-3
              px-3
              py-3.5
              hover:bg-[var(--surface-hover)]
            "
          >
            <Bell
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Push notifications
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                General StreetGO alerts
              </span>
            </span>

            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) =>
                updateNotifications(
                  event.target.checked
                )
              }
              className="
                h-3.5
                w-3.5
                accent-[var(--accent)]
              "
            />
          </label>

          <label
            className="
              flex
              w-full
              cursor-pointer
              items-center
              gap-3
              px-3
              py-3.5
              hover:bg-[var(--surface-hover)]
            "
          >
            <User
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Messages
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                New message alerts
              </span>
            </span>

            <input
              type="checkbox"
              checked={messages}
              onChange={(event) =>
                updateMessages(
                  event.target.checked
                )
              }
              className="
                h-3.5
                w-3.5
                accent-[var(--accent)]
              "
            />
          </label>

          <label
            className="
              flex
              w-full
              cursor-pointer
              items-center
              gap-3
              px-3
              py-3.5
              hover:bg-[var(--surface-hover)]
            "
          >
            <Wallet
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-emerald-500
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                  text-emerald-500
                "
              >
                REAX activity
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                REAX transaction alerts
              </span>
            </span>

            <input
              type="checkbox"
              checked={
                reaxNotifications
              }
              onChange={(event) =>
                updateReaxNotifications(
                  event.target.checked
                )
              }
              className="
                h-3.5
                w-3.5
                accent-emerald-500
              "
            />
          </label>
        </section>

        {/* =================================================
            PRIVACY & SECURITY
            ================================================= */}

        <section
          className="
            mb-3
            overflow-hidden
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          <div
            className="
              px-3
              py-2.5
              font-['Courier_New']
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--muted)]
            "
          >
            Privacy & Security
          </div>

          <button
            type="button"
            className={rowClass}
          >
            <Lock
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Password & Security
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                Protect your account
              </span>
            </span>

            <ChevronRight
              size={13}
              className="text-[var(--muted)]"
            />
          </button>

          <button
            type="button"
            className={rowClass}
          >
            <Shield
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Privacy
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                Manage your visibility
              </span>
            </span>

            <ChevronRight
              size={13}
              className="text-[var(--muted)]"
            />
          </button>

          <button
            type="button"
            className={rowClass}
          >
            <Globe
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Language & Region
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                Language and regional settings
              </span>
            </span>

            <ChevronRight
              size={13}
              className="text-[var(--muted)]"
            />
          </button>
        </section>

        {/* =================================================
            SUPPORT
            ================================================= */}

        <section
          className="
            mb-3
            overflow-hidden
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          <div
            className="
              px-3
              py-2.5
              font-['Courier_New']
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--muted)]
            "
          >
            Support
          </div>

          <button
            type="button"
            onClick={() =>
              router.push('/help')
            }
            className={rowClass}
          >
            <HelpCircle
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 flex-1">
              <span
                className="
                  block
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                "
              >
                Help & Support
              </span>

              <span
                className="
                  mt-0.5
                  block
                  font-['Courier_New']
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                Get help with StreetGO
              </span>
            </span>

            <ChevronRight
              size={13}
              className="text-[var(--muted)]"
            />
          </button>
        </section>

        {/* =================================================
            SIGN OUT
            ================================================= */}

        <button
          type="button"
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-rose-500/15
            px-3
            py-2.5
            font-['Courier_New']
            text-[9px]
            font-bold
            text-rose-500
            transition-colors
            hover:bg-rose-500/10
            active:scale-[0.99]
          "
        >
          <LogOut
            size={13}
            strokeWidth={1.9}
          />

          Sign out
        </button>

        <div
          className="
            pt-4
            text-center
            font-['Courier_New']
            text-[7px]
            tracking-[0.14em]
            text-[var(--muted)]
          "
        >
          STREETGO SETTINGS
        </div>
      </div>
    </main>
  )
}