"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Brain,
  Menu,
  X,
  Calendar,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import NotificationCenter from "@/components/notifications/NotificationCenter";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/recruiter/dashboard" },
  { label: "Jobs", icon: Briefcase, href: "/recruiter/jobs" },
  { label: "Candidates", icon: Users, href: "/recruiter/candidates" },
  { label: "Analytics", icon: BarChart3, href: "/recruiter/analytics" },
  { label: "Profile", icon: UserCircle, href: "/recruiter/profile" },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (user && user.role === "candidate") {
      window.location.href = "/candidate/dashboard";
    }
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        {/* Logo */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="HireIQ Logo" className="h-9 w-9 object-contain" />
          <div>
            <div className="text-lg font-bold text-slate-900 leading-none">HireIQ</div>
            <div className="text-xs text-slate-500 font-medium">AI Recruitment</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post New Job CTA */}
        <div className="px-4 py-4 border-b border-slate-100">
          <Link href="/recruiter/jobs/new">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {navItems.map(({ label, icon: Icon, href }) => {
              const active = pathname === href || (href !== "/recruiter/dashboard" && href !== "/recruiter/profile" && pathname.startsWith(href));
              return (
                <Link key={href} href={href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      active
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                    {label}
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-3 space-y-0.5">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Help Center
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 md:px-6 flex-shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search candidates, jobs..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <NotificationCenter />
            
            {/* Avatar */}
            <Link href="/recruiter/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer overflow-hidden">
              {(user as any)?.avatar_url ? (
                <img src={(user as any).avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(user?.full_name || user?.email || "Recruiter")}</span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
