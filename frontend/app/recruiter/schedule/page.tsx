"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Calendar, Clock, Users, Video, Globe, ChevronLeft, ChevronRight, 
  Sparkles, CheckCircle, Search, Bell, Settings, LogOut, Plus, 
  MapPin, Eye, Download, Info, Menu, Briefcase, Star, Loader2, Send
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
const suggestions = [
  { date: "Oct 12", time: "10:00 AM" },
  { date: "Oct 12", time: "2:00 PM", isSelected: true },
  { date: "Oct 13", time: "1:30 PM" }
];

function ScheduleContent() {
  const { user, logout } = useAuthStore();
  const searchParams = useSearchParams();
  
  const candidateName = searchParams.get("candidate") || "Sarah Jenkins";
  const appId = searchParams.get("appId");
  
  const initials = candidateName.split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2) || "SJ";
  
  const [meetingType, setMeetingType] = useState("Technical Assessment");
  const [duration, setDuration] = useState("60m");
  const [selectedSlot, setSelectedSlot] = useState("Oct 12, 2:00 PM");

  const name = user?.full_name || user?.email?.split("@")[0] || "Recruiter";

  return (
    <div className="bg-[#f9f9ff] text-[#111c2d] font-sans h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row">
      {/* Main Content Area */}
      <main className="flex-grow h-full flex flex-col md:flex-row overflow-hidden bg-[#f9f9ff]">
        {/* Left Panel: Candidate Context */}
        <section className="w-full md:w-1/3 lg:w-[400px] bg-white border-r border-[#c4c5d5] flex flex-col shrink-0 overflow-y-auto h-full">
          {/* Breadcrumb & Header */}
          <div className="p-6 border-b border-[#c4c5d5] bg-white sticky top-0 z-10">
            <div className="flex items-center gap-1 text-xs text-[#444653] mb-4">
              <Link href="/recruiter/dashboard" className="hover:text-[#00288e] transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-[#111c2d] font-medium">Schedule</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#111c2d]">Schedule Interview</h2>
          </div>

          {/* Candidate Info Card */}
          <div className="p-6 flex-1">
            <div className="bg-[#f9f9ff] border border-[#c4c5d5] rounded-xl p-6 shadow-sm flex flex-col items-center text-center mb-6 relative">
              {/* Match Badge */}
              <div className="absolute -top-3 right-6 bg-[#00554f] text-[#75cac1] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-[#80d5cb]">
                <Star className="w-3.5 h-3.5 fill-[#75cac1]" />
                <span>94% Match</span>
              </div>
              <div className="w-20 h-20 rounded-full bg-[#1e40af] text-white flex items-center justify-center font-bold text-3xl shadow-md mb-4">
                {initials}
              </div>
              <h3 className="text-xl font-bold text-[#111c2d] mb-1">{candidateName}</h3>
              <p className="text-xs text-[#444653] mb-4">Applicant for active pipeline</p>
              <div className="flex gap-2 mb-6">
                <span className="bg-white text-[#444653] text-[10px] font-bold px-2 py-1 rounded border border-[#c4c5d5]">React</span>
                <span className="bg-white text-[#444653] text-[10px] font-bold px-2 py-1 rounded border border-[#c4c5d5]">TypeScript</span>
                <span className="bg-white text-[#444653] text-[10px] font-bold px-2 py-1 rounded border border-[#c4c5d5]">CSS</span>
              </div>
            </div>

            {/* Interview Configuration */}
            <div className="space-y-6">
              <h4 className="font-bold text-[#111c2d]">Interview Details</h4>
              {/* Meeting Type */}
              <div>
                <label className="block text-xs text-[#444653] font-semibold mb-2">Meeting Type</label>
                <select 
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full bg-[#f9f9ff] border border-[#c4c5d5] text-sm text-[#111c2d] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00288e] cursor-pointer shadow-sm"
                >
                  <option>Technical Assessment</option>
                  <option>Cultural Fit</option>
                  <option>Final Interview</option>
                  <option>Initial Screening</option>
                </select>
              </div>
              {/* Interviewers */}
              <div>
                <label className="block text-xs text-[#444653] font-semibold mb-2">Interviewers</label>
                <div className="bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg p-2 flex items-center gap-2 flex-wrap shadow-sm">
                  <div className="bg-[#e7eeff] text-[#111c2d] text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 border border-[#c4c5d5]">
                    <span>Alex M.</span>
                  </div>
                  <div className="bg-[#e7eeff] text-[#111c2d] text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 border border-[#c4c5d5]">
                    <span>Priya K.</span>
                  </div>
                  <button className="text-[#444653] hover:bg-[#d8e3fb] p-1 rounded-full transition-colors flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Duration */}
              <div>
                <label className="block text-xs text-[#444653] font-semibold mb-2">Duration</label>
                <div className="flex gap-2">
                  {["30m", "60m", "90m"].map((dur) => (
                    <button 
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-colors ${
                        duration === dur 
                          ? "border-2 border-[#00288e] bg-[#dde1ff] text-[#00288e]" 
                          : "border-[#c4c5d5] bg-[#f9f9ff] text-[#111c2d] hover:bg-[#f0f3ff]"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-[#c4c5d5] bg-white mt-auto">
            <button onClick={() => { alert(`Interview scheduled via email for ${candidateName}!`); }} className="w-full bg-[#00288e] text-white font-semibold py-3.5 rounded-lg shadow-md hover:bg-[#1e40af] transition-colors flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Invitation
            </button>
          </div>
        </section>

        {/* Right Panel: Calendar Integration */}
        <section className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 border-b border-[#c4c5d5] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg border border-[#c4c5d5] hover:bg-[#f0f3ff] transition-colors flex items-center justify-center shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-[#111c2d] min-w-[120px] text-center">October 2023</h3>
              <button className="p-2 rounded-lg border border-[#c4c5d5] hover:bg-[#f0f3ff] transition-colors flex items-center justify-center shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#444653]">Timezone: PST</span>
              <div className="bg-[#f0f3ff] rounded-lg p-1 flex">
                <button className="px-4 py-1.5 text-xs font-semibold bg-white rounded shadow-sm text-[#00288e]">Week</button>
                <button className="px-4 py-1.5 text-xs font-semibold text-[#444653] hover:text-[#111c2d] transition-colors">Day</button>
              </div>
            </div>
          </div>

          {/* AI Suggestions Banner */}
          <div className="bg-[#f0f3ff] border-b border-[#c4c5d5] p-6 flex items-start gap-4 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#8f8bff] flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111c2d] mb-1">AI-Suggested Times</h4>
              <p className="text-xs text-[#444653] mb-3">Found 3 optimal slots where Alex, Priya, and {candidateName.split(" ")[0]} are available for {duration === "30m" ? "30" : duration === "90m" ? "90" : "60"} minutes.</p>
              <div className="flex gap-2.5 flex-wrap">
                {suggestions.map((slot) => (
                  <button 
                    key={`${slot.date}-${slot.time}`}
                    onClick={() => setSelectedSlot(`${slot.date}, ${slot.time}`)}
                    className={`border text-xs px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
                      selectedSlot === `${slot.date}, ${slot.time}`
                        ? "bg-[#8f8bff] border-[#231791] text-[#231791] font-bold"
                        : "bg-white border-[#c4c5d5] text-[#111c2d] hover:bg-[#e7eeff]"
                    }`}
                  >
                    <span>{slot.date}, {slot.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Body */}
          <div className="flex-grow overflow-y-auto relative p-6 bg-[#f9f9ff]">
            {/* Days Header */}
            <div className="grid grid-cols-6 border-b border-[#c4c5d5] pb-2 text-center sticky top-0 bg-[#f9f9ff] z-10">
              <div className="text-xs text-[#444653] uppercase font-bold text-left pl-4">Time</div>
              <div className="text-xs text-[#444653] uppercase">Mon 9</div>
              <div className="text-xs text-[#444653] uppercase">Tue 10</div>
              <div className="text-xs text-[#444653] uppercase">Wed 11</div>
              <div className="text-xs text-[#00288e] font-bold">Thu 12</div>
              <div className="text-xs text-[#444653] uppercase">Fri 13</div>
            </div>

            {/* Time Slots */}
            <div className="divide-y divide-[#c4c5d5]/30">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-6 py-4 items-center">
                  <div className="text-xs font-semibold text-[#757684]">{time}</div>
                  <div className="h-12 border-r border-[#c4c5d5]/20"></div>
                  <div className="h-12 border-r border-[#c4c5d5]/20"></div>
                  <div className="h-12 border-r border-[#c4c5d5]/20"></div>
                  <div className="h-12 border-r border-[#c4c5d5]/20 bg-[#e7eeff]/40 relative px-1">
                    {time === "02:00 PM" && (
                      <div className="absolute inset-x-1 top-1 bottom-1 bg-[#8f8bff] border border-[#231791] text-[#231791] rounded-lg p-2 text-[10px] font-bold shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-center">
                          <span>Tech Screen</span>
                          <CheckCircle className="w-3 h-3 text-[#231791]" />
                        </div>
                        <span className="opacity-75 font-normal">{candidateName}</span>
                      </div>
                    )}
                  </div>
                  <div className="h-12"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function RecruiterSchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  );
}
