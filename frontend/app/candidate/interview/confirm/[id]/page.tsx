"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle, Calendar, Clock, Users, Video, ExternalLink, 
  Sparkles, TrendingUp, Brain, Handshake, ArrowLeft, Info 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function CandidateInterviewConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const name = user?.full_name || user?.email?.split("@")[0] || "Candidate";

  const handleReturn = () => {
    router.push("/candidate/dashboard");
  };

  return (
    <div className="bg-[#f9f9ff] text-[#111c2d] font-sans min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      {/* Transactional Header */}
      <header className="w-full max-w-4xl py-4 flex items-center justify-between border-b border-[#c4c5d5]/50 bg-transparent mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00288e] flex items-center justify-center text-white font-bold">H</div>
          <span className="text-xl font-bold text-[#00288e] tracking-tight">HireIQ</span>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left Container: Success Confirmation */}
        <section className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-[#c4c5d5] p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-[#10b981]" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#111c2d] mb-2">Interview Scheduled!</h1>
            <p className="text-sm text-[#444653] max-w-md">
              You're all set, {name}. An invitation has been sent and added to your schedule.
            </p>

            {/* Event Details Card */}
            <div className="w-full mt-8 text-left bg-[#f0f3ff] rounded-xl p-6 border border-[#c4c5d5]">
              <h2 className="text-lg font-bold text-[#111c2d] mb-4 border-b border-[#c4c5d5] pb-2">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#00288e] mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#444653] uppercase tracking-wider font-semibold">Date</p>
                    <p className="text-sm font-bold text-[#111c2d]">Thursday, Oct 24, 2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#00288e] mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#444653] uppercase tracking-wider font-semibold">Time</p>
                    <p className="text-sm font-bold text-[#111c2d]">2:00 PM - 3:00 PM EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Users className="w-5 h-5 text-[#00288e] mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#444653] uppercase tracking-wider font-semibold">Participants</p>
                    <p className="text-sm font-semibold text-[#111c2d] mt-1">
                      Alex Rivera (Interviewer) &amp; {name} (You)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Video className="w-5 h-5 text-[#00288e] mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#444653] uppercase tracking-wider font-semibold">Meeting Link</p>
                    <a className="text-sm font-bold text-[#00288e] hover:underline flex items-center gap-1 mt-0.5" href="#">
                      Join Google Meet
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button className="bg-[#1e40af] text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Add to Calendar
              </button>
              <button 
                onClick={handleReturn}
                className="bg-transparent text-[#00288e] border border-[#00288e] font-semibold py-3 px-6 rounded-lg hover:bg-[#e7eeff] transition-colors flex items-center justify-center gap-2"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: AI Prep Card */}
        <aside className="md:col-span-5 flex flex-col">
          <div className="bg-gradient-to-br from-[#f0f3ff] to-[#e2dfff] rounded-2xl shadow-md border border-[#c4c5d5] p-6 flex flex-col h-full relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#e2dfff] opacity-30 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10 text-[#544fc0]">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-[#111c2d]">AI Interview Prep</h3>
            </div>
            <p className="text-xs text-[#444653] mb-6 relative z-10">
              Based on your profile and the Senior Frontend Developer requirements, here are suggested areas to focus on during your conversation.
            </p>
            <div className="space-y-4 relative z-10 flex-grow">
              {/* Strength Focus */}
              <div className="bg-white/70 backdrop-blur-md rounded-lg p-4 border-l-4 border-[#10b981] shadow-sm">
                <div className="flex items-center gap-1 mb-1 text-[#10b981]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111c2d]">Explore Strength</span>
                </div>
                <p className="text-sm font-bold text-[#111c2d] mb-1">React Performance Optimization</p>
                <p className="text-xs text-[#444653]">Your resume shows extensive experience here. Be prepared to share how you reduced render times in previous roles.</p>
              </div>

              {/* Gap Focus */}
              <div className="bg-white/70 backdrop-blur-md rounded-lg p-4 border-l-4 border-[#544fc0] shadow-sm">
                <div className="flex items-center gap-1 mb-1 text-[#544fc0]">
                  <Brain className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111c2d]">Assess Gap</span>
                </div>
                <p className="text-sm font-bold text-[#111c2d] mb-1">Team Leadership Experience</p>
                <p className="text-xs text-[#444653]">The role requires mentoring. If requested, highlight informal mentoring, code review contributions, or pair programming.</p>
              </div>

              {/* Culture Fit */}
              <div className="bg-white/70 backdrop-blur-md rounded-lg p-4 border-l-4 border-[#00288e] shadow-sm">
                <div className="flex items-center gap-1 mb-1 text-[#00288e]">
                  <Handshake className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111c2d]">Culture &amp; Values</span>
                </div>
                <p className="text-sm font-bold text-[#111c2d] mb-1">Adaptability to Fast-Paced Shifts</p>
                <p className="text-xs text-[#444653]">Inquire about a time you pivoted your technical approach mid-sprint to deliver successful outcomes.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#c4c5d5]/30 relative z-10 flex justify-between items-center text-xs">
              <span className="text-[#444653] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Generated by HireIQ AI
              </span>
              <button className="text-[#00288e] font-semibold hover:underline">
                View Full Brief
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
