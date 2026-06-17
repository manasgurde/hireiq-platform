'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, ChevronLeft, Briefcase, UserCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter'

// ---------------------------------------------------------------------------
// Schema (Step 2)
// ---------------------------------------------------------------------------
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>
type Role = 'candidate' | 'recruiter'

// ---------------------------------------------------------------------------
// Role cards data
// ---------------------------------------------------------------------------
const ROLE_OPTIONS = [
  {
    value: 'candidate' as Role,
    icon: UserCircle,
    title: 'Job Seeker',
    description: 'Find opportunities, upload resumes, and get AI-powered career insights.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'recruiter' as Role,
    icon: Briefcase,
    title: 'Recruiter',
    description: 'Post jobs, review AI-ranked candidates, and manage your hiring pipeline.',
    gradient: 'from-indigo-500 to-purple-600',
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const watchedPassword = watch('password', '')

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep(2)
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (!selectedRole) return
    setApiError(null)
    setIsLoading(true)
    try {
      const res = await authApi.register({
        email: data.email,
        password: data.password,
        role: selectedRole,
      })
      login(
        { id: res.data.user.id, email: res.data.user.email, role: res.data.user.role as 'candidate' | 'recruiter' | 'admin' },
        res.data.access_token
      )
      router.push('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } }
      setApiError(
        axiosErr?.response?.data?.error?.message ?? 'An unexpected error occurred. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step >= s
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className={`w-12 h-0.5 rounded-full transition-all duration-500 ${
                  step > s ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-slate-500">
          {step === 1 ? 'Select role' : 'Account details'}
        </span>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 1 — Role selection */}
      {/* ──────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400">Choose how you want to use HireIQ</p>
          </div>

          <div className="space-y-4">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = selectedRole === option.value

              return (
                <button
                  key={option.value}
                  id={`role-${option.value}`}
                  type="button"
                  onClick={() => handleRoleSelect(option.value)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{option.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{option.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 2 — Details form */}
      {/* ──────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          {/* Back button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Change role
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-white">Your details</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium capitalize border border-blue-500/30">
                {selectedRole}
              </span>
            </div>
            <p className="text-slate-400">Create your account to get started</p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-300 mb-2">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                {...register('name')}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500 outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                }`}
              />
              {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500 outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                }`}
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  {...register('password')}
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-800 border text-white placeholder-slate-500 outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrengthMeter password={watchedPassword} />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-800 border text-white placeholder-slate-500 outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
