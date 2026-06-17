import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HireIQ — Sign In',
  description: 'Access your HireIQ account to manage your hiring pipeline.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 flex-col justify-between p-12">
        {/* Gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">HireIQ</span>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            AI-Powered Hiring<br />Intelligence Platform
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            Smarter candidates. Faster hiring. Explainable AI.
          </p>
          <ul className="space-y-4">
            {[
              { icon: '🎯', text: 'AI resume scoring with skill gap analysis' },
              { icon: '🤖', text: 'Mock interviews powered by NLP' },
              { icon: '📊', text: 'Real-time recruiter analytics dashboard' },
              { icon: '🔒', text: 'Enterprise-grade security & RBAC' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-blue-100">
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-white italic mb-3">
            &ldquo;HireIQ cut our time-to-hire by 40% and surfaced candidates we would have missed entirely.&rdquo;
          </p>
          <p className="text-blue-200 text-sm font-medium">— Sarah Chen, VP Engineering at Acme Corp</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="text-white text-xl font-bold">HireIQ</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
