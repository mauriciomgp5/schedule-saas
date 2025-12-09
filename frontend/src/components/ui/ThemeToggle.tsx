import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'

export default function ThemeToggle({ className }: { className?: string }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check system preference and localStorage
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group overflow-hidden',
        className
      )}
      aria-label="Toggle dark mode"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={cn(
            'absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300',
            darkMode
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 animate-pulse-slow'
          )}
        />
        <Moon
          className={cn(
            'absolute inset-0 w-6 h-6 text-blue-500 transition-all duration-300',
            darkMode
              ? 'rotate-0 scale-100 opacity-100 animate-pulse-slow'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
      <span className="sr-only">{darkMode ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}
