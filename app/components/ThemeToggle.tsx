'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('streetgo-theme') as Theme | null

    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
      document.documentElement.dataset.theme = savedTheme
    } else {
      document.documentElement.dataset.theme = 'dark'
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)
    localStorage.setItem('streetgo-theme', nextTheme)

    document.documentElement.dataset.theme = nextTheme
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="
        relative flex h-9 w-9 items-center justify-center
        rounded-lg
        border border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--muted)]
        transition-all duration-200
        hover:border-[var(--border-hover)]
        hover:bg-[var(--surface-hover)]
        hover:text-[var(--foreground)]
      "
    >
      {theme === 'dark' ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
    </button>
  )
}