'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Building2, Loader2, ExternalLink, Receipt } from 'lucide-react'
import axios from 'axios'

const PLAN_ICONS = {
  free: '🆓',
  pro: '⚡',
  enterprise: '🏢',
}

const PLAN_COLORS = {
  free: {
    border: 'border-slate-700',
    bg: 'bg-slate-900/50',
    badge: 'bg-slate-800 text-slate-300',
    button: 'bg-slate-700 hover:bg-slate-600 text-white',
    glow: '',
  },
  pro: {
    border: 'border-blue-500',
    bg: 'bg-blue-950/30',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',
    glow: 'ring-2 ring-blue-500/20',
  },
  enterprise: {
    border: 'border-purple-500',
    bg: 'bg-purple-950/20',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    button: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25',
    glow: 'ring-2 ring-purple-500/20',
  },
}

interface Plan {
  name: string
  price_usd: number
  job_limit: number | null
  ai_access: boolean
  features: string[]
}

interface CurrentSub {
  plan: string
  status: string
  current_period_end: string | null
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Record<string, Plan>>({})
  const [currentSub, setCurrentSub] = useState<CurrentSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
    headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          api.get('/billing/plans'),
          api.get('/billing/me'),
        ])
        setPlans(plansRes.data.data)
        setCurrentSub(subRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'free') return
    setSubscribing(planKey)
    try {
      const res = await api.post('/billing/subscribe', {
        plan: planKey,
        success_url: `${window.location.origin}/billing?success=1`,
        cancel_url: `${window.location.origin}/billing?cancelled=1`,
      })
      window.location.href = res.data.data.checkout_url
    } catch (e) {
      console.error(e)
    } finally {
      setSubscribing(null)
    }
  }

  const handlePortal = async () => {
    try {
      const res = await api.post('/billing/portal')
      window.open(res.data.data.portal_url, '_blank')
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  const planKeys = ['free', 'pro', 'enterprise']

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Scale your hiring as your team grows. Upgrade or downgrade anytime.
          </p>

          {currentSub && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
              <span className="text-sm text-slate-400">Current plan:</span>
              <span className="font-semibold text-white capitalize">{currentSub.plan}</span>
              {currentSub.status === 'active' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {currentSub.plan !== 'free' && (
                <button
                  onClick={handlePortal}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Receipt className="w-3 h-3" /> Manage billing
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {planKeys.map((key) => {
            const plan = plans[key]
            if (!plan) return null
            const colors = PLAN_COLORS[key as keyof typeof PLAN_COLORS]
            const isCurrent = currentSub?.plan === key
            const isPro = key === 'pro'

            return (
              <div
                key={key}
                className={`relative rounded-3xl border p-8 flex flex-col ${colors.border} ${colors.bg} ${colors.glow} transition-all duration-300 hover:scale-[1.02]`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-3xl mb-2">{PLAN_ICONS[key as keyof typeof PLAN_ICONS]}</div>
                  <div className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${colors.badge}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${plan.price_usd}</span>
                    {plan.price_usd > 0 && <span className="text-slate-400 text-sm">/month</span>}
                  </div>
                  {plan.price_usd === 0 && <p className="text-slate-400 text-sm mt-1">Forever free</p>}
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    ✓ Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={subscribing === key || key === 'free'}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${colors.button} disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {subscribing === key ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : key === 'free' ? (
                      'Downgrade to Free'
                    ) : (
                      <>Upgrade to {plan.name} <ExternalLink className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ / Trust signals */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            All plans include SSL security, GDPR-compliant data handling, and 99.9% uptime SLA.
            <br />
            Questions? <a href="mailto:support@hireiq.app" className="text-blue-400 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  )
}
