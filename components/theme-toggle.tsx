"use client"
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import * as Switch from '@radix-ui/react-switch'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = (resolvedTheme ?? theme) === 'dark'
  if (!mounted) return null
  return (
    <label className="inline-flex items-center gap-2" aria-label="Toggle dark mode">
      <SunIcon aria-hidden className="h-4 w-4" />
      <Switch.Root
        className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-brand-green transition"
        checked={isDark}
        onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
      >
        <Switch.Thumb className="block h-5 w-5 bg-white rounded-full shadow absolute top-0.5 left-0.5 transition data-[state=checked]:translate-x-6" />
      </Switch.Root>
      <MoonIcon aria-hidden className="h-4 w-4" />
    </label>
  )
}
