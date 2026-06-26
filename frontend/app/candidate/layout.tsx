"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial system/saved preference (simplified to check class)
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    if (user && user.role === "recruiter") {
      window.location.href = "/recruiter/dashboard";
    }
  }, [user]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const handleNotificationsClick = () => {
    alert("You have no new notifications.");
  };

  const navLinks = [
    { name: "Dashboard", href: "/candidate/dashboard", icon: "dashboard" },
    { name: "Applications", href: "/candidate/applications", icon: "work" },
    { name: "Resume", href: "/candidate/resume", icon: "description" },
    { name: "Insights", href: "/candidate/insights", icon: "leaderboard" },
    { name: "Profile", href: "/candidate/profile", icon: "person" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col h-full border-r border-outline-variant bg-surface-container-lowest dark:bg-inverse-surface fixed left-0 top-0 w-64 z-50 shadow-sm transition-transform duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-outline-variant">
          <img src="/logo.png" alt="HireIQ Logo" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="font-h3 text-h3 font-bold text-primary dark:text-primary-fixed leading-none">
              HireIQ
            </h1>
            <p className="font-caption text-caption text-on-surface-variant leading-none mt-1">
              AI Recruitment
            </p>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors transition-transform duration-150 ${
                      isActive
                        ? "bg-secondary-fixed dark:bg-secondary-container text-on-secondary-fixed dark:text-on-secondary-container border-r-4 border-primary dark:border-primary-fixed hover:bg-surface-container-high dark:hover:bg-surface-container scale-95"
                        : "text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {link.icon}
                    </span>
                    <span className="font-body-base text-body-base font-medium">
                      {link.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-6 border-t border-outline-variant">
          <Link
            href="/jobs"
            className="w-full bg-primary-container text-on-primary font-body-base text-body-base py-2 rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
            Find Jobs
          </Link>
          <ul className="mt-6 space-y-2">
            <li>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-4 text-on-surface-variant dark:text-surface-variant px-2 py-2 hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors rounded-md"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-body-sm text-body-sm">Log Out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 w-full min-h-screen">
        <header className="flex justify-between items-center px-12 h-16 w-full md:w-[calc(100%-256px)] fixed top-0 right-0 bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleDarkMode} className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80">
              <span className="material-symbols-outlined">
                {isDarkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <div className="relative">
              <NotificationCenter />
            </div>
            <Link href="/candidate/profile" className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-primary text-on-primary flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity font-bold text-xs">
              {(user as any)?.avatar_url ? (
                <img 
                  src={(user as any).avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{getInitials(user?.full_name || user?.email || "User")}</span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 mt-16 overflow-y-auto">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant shadow-lg z-50 flex justify-around items-center h-16 pb-safe">
        {navLinks.slice(0, 4).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? "text-primary dark:text-primary-fixed"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span className="text-[10px] font-medium mt-1">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
