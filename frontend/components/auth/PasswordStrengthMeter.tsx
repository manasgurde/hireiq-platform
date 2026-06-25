'use client'

import { useMemo } from 'react'

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = [
  'bg-slate-700',      // 0 ? no input
  'bg-red-500',        // 1 ? Weak
  'bg-orange-400',     // 2 ? Fair
  'bg-yellow-400',     // 3 ? Good
  'bg-emerald-500',    // 4 ? Strong
]
const STRENGTH_TEXT_COLORS = [
  'text-slate-500',
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-emerald-400',
]

interface Props {
  password: string
}

export default function PasswordStrengthMeter({ password }: Props) {
  const score = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length > 7) s += 1
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s += 1
    if (/[0-9]/.test(password)) s += 1
    if (/[^a-zA-Z0-9]/.test(password)) s += 1
    return Math.min(4, Math.max(1, s))
  }, [password])

  const label = password ? STRENGTH_LABELS[score] : ''

  return (
    <div className="mt-2 space-y-1">
      {/* Bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              password && score >= bar ? STRENGTH_COLORS[score] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      {/* Label */}
      {label && (
        <p className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[score]}`}>
          Password strength: {label}
        </p>
      )}
    </div>
  )
}
