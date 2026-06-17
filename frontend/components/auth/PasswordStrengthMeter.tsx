'use client'

import { useMemo } from 'react'
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommon from '@zxcvbn-ts/language-common'

// Configure zxcvbn once
zxcvbnOptions.setOptions({
  translations: zxcvbnCommon.translations,
  graphs: zxcvbnCommon.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommon.dictionary,
  },
})

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = [
  'bg-slate-700',      // 0 — no input
  'bg-red-500',        // 1 — Weak
  'bg-orange-400',     // 2 — Fair
  'bg-yellow-400',     // 3 — Good
  'bg-emerald-500',    // 4 — Strong
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
  const result = useMemo(() => {
    if (!password) return null
    return zxcvbn(password)
  }, [password])

  const score = result?.score ?? 0
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
