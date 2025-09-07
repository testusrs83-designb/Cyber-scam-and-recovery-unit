"use client"

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

export function RouteTransition() {
  const pathname = usePathname()
  const prevPathRef = useRef<string | null>(null)
  const [active, setActive] = useState(false)
  const [ts, setTs] = useState<number>(0)

  useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname
      return
    }
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      setActive(true)
      setTs(Date.now())
      const t = setTimeout(() => setActive(false), 3000)
      return () => clearTimeout(t)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-[80]"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-3 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/20 via-transparent to-brand-green/20" />
            <Shimmer key={ts} />
            <Progress key={`p-${ts}`} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Shimmer() {
  return (
    <motion.div
      aria-hidden
      initial={{ y: '100%' }}
      animate={{ y: '-100%' }}
      transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
      className="absolute -inset-x-10 h-40 opacity-40"
      style={{ background: 'linear-gradient( to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)' }}
    />
  )
}

function Progress() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        className="h-full bg-gradient-to-r from-brand-green via-emerald-400 to-brand-green"
      />
    </div>
  )
}

export default RouteTransition
