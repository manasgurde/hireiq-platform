import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Briefcase, Sparkles, UserCircle, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="HireIQ Logo" className="h-9 w-9 object-contain" />
          <span className="font-semibold text-xl tracking-tight">HireIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative w-full pt-20 pb-32">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">AI-Powered Hiring Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 mb-6 leading-tight">
            Hire Smarter.<br />
            Hire Faster.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Connect top talent with leading companies using advanced AI matching, automated resume screening, and intelligent skill assessments.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition-colors"
            >
              Log in to account
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl w-full grid md:grid-cols-3 gap-6 mt-32 relative z-10">
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-blue-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Resume Parsing</h3>
            <p className="text-slate-400 leading-relaxed">
              Instantly extract skills, experience, and qualifications from any resume format with 99% accuracy.
            </p>
          </div>
          
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-indigo-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
            <p className="text-slate-400 leading-relaxed">
              Our algorithm ranks candidates instantly based on job requirements, saving hours of manual screening.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pipeline Management</h3>
            <p className="text-slate-400 leading-relaxed">
              Track candidates from application to offer with our intuitive, drag-and-drop recruiter dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
