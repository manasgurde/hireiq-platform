"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, Code, Calendar, User, Star, Plus, Globe, Settings, LogOut, Send,
  ThumbsUp, ThumbsDown, CheckCircle, Sparkles, Brain, Save, ArrowLeft,
  ChevronRight, Activity
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function RecruiterFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const name = user?.full_name || user?.email?.split("@")[0] || "Recruiter";

  // Ratings state
  const [ratings, setRatings] = useState({
    technical: 4,
    problemSolving: 5,
    communication: 3,
    culturalAdd: 0
  });

  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("Hire");

  const handleRating = (key: keyof typeof ratings, score: number) => {
    setRatings(prev => ({ ...prev, [key]: score }));
  };

  const handleSubmit = () => {
    // Navigate back to candidates list after submit
    router.push("/recruiter/candidates");
  };

  return (
    <div className="bg-[#f9f9ff] text-[#111c2d] min-h-[calc(100vh-64px)] flex font-sans">
      {/* Main Canvas */}
      <main className="flex-grow p-6 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Header Section */}
        <header className="bg-white rounded-xl p-6 shadow-sm border border-[#c4c5d5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1e40af] text-white flex items-center justify-center font-bold text-3xl shadow-sm">
              SJ
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111c2d] mb-1">Sarah Jenkins</h2>
              <p className="text-sm text-[#444653] flex items-center gap-1">
                <Code className="w-4 h-4 text-[#757684]" />
                <span>Senior Frontend Engineer</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1 text-xs text-[#444653] font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#757684]" />
              <span>October 24, 2023 • Technical Round 2</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#757684]" />
              <span>Interviewer: {name}</span>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Core Competencies Ratings */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#c4c5d5] flex flex-col gap-6">
              <h3 className="text-lg font-bold text-[#111c2d] border-b border-[#c4c5d5] pb-2">Core Competencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating Technical */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#111c2d]">Technical Skills</label>
                    <span className="text-xs font-bold text-[#00288e]">{ratings.technical} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => handleRating("technical", s)}
                        className={`h-10 flex-1 rounded-md border transition-colors ${
                          ratings.technical >= s 
                            ? "bg-[#00288e] border-[#00288e] text-white" 
                            : "bg-[#f9f9ff] border-[#c4c5d5] hover:bg-[#e7eeff]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Rating Problem Solving */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#111c2d]">Problem Solving</label>
                    <span className="text-xs font-bold text-[#00288e]">{ratings.problemSolving} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => handleRating("problemSolving", s)}
                        className={`h-10 flex-1 rounded-md border transition-colors ${
                          ratings.problemSolving >= s 
                            ? "bg-[#00288e] border-[#00288e] text-white" 
                            : "bg-[#f9f9ff] border-[#c4c5d5] hover:bg-[#e7eeff]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Rating Communication */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#111c2d]">Communication</label>
                    <span className="text-xs font-bold text-[#00288e]">{ratings.communication} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => handleRating("communication", s)}
                        className={`h-10 flex-1 rounded-md border transition-colors ${
                          ratings.communication >= s 
                            ? "bg-[#00288e] border-[#00288e] text-white" 
                            : "bg-[#f9f9ff] border-[#c4c5d5] hover:bg-[#e7eeff]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Rating Cultural Add */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#111c2d]">Cultural Add</label>
                    <span className="text-xs font-bold text-[#00288e]">{ratings.culturalAdd || "--"}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => handleRating("culturalAdd", s)}
                        className={`h-10 flex-1 rounded-md border transition-colors ${
                          ratings.culturalAdd >= s 
                            ? "bg-[#00288e] border-[#00288e] text-white" 
                            : "bg-[#f9f9ff] border-[#c4c5d5] hover:bg-[#e7eeff]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Notes */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#c4c5d5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#c4c5d5] pb-2">
                <h3 className="text-lg font-bold text-[#111c2d]">Detailed Notes</h3>
              </div>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-48 p-4 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm focus:ring-2 focus:ring-[#00288e] transition-all resize-none outline-none"
                placeholder="Enter detailed observations here... Sarah demonstrated strong React knowledge but struggled slightly with the advanced system design question..."
              />
            </section>
          </div>

          {/* Right Column: AI & Recommendations */}
          <div className="flex flex-col gap-6">
            {/* AI Co-Pilot Tone Check */}
            <aside className="bg-[#f0f3ff] rounded-xl p-6 shadow-sm border border-[#80d5cb] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-12 h-12 text-[#0f766e]" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#00554f]" />
                <h3 className="font-bold text-sm text-[#111c2d]">AI Co-Pilot</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#c4c5d5] shadow-sm">
                  <p className="text-xs text-[#444653] leading-relaxed">
                    <strong className="text-[#00554f]">Tone Check:</strong> Your notes are currently leaning <span className="font-bold text-[#111c2d]">positive</span> but lack specific examples for the 'Communication' rating. Consider adding a brief instance to support the 3/5 score for objectivity.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full h-2 bg-[#dee8ff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00554f] w-[85%] rounded-full"></div>
                  </div>
                  <span className="text-[10px] text-[#444653] font-bold">85% Objective</span>
                </div>
              </div>
            </aside>

            {/* Final Recommendation */}
            <section className="bg-white rounded-xl p-6 shadow-md border border-[#c4c5d5] flex flex-col gap-6 flex-grow">
              <h3 className="text-lg font-bold text-[#111c2d] border-b border-[#c4c5d5] pb-2">Final Recommendation</h3>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  recommendation === "Strong Hire" ? "border-[#00288e] bg-[#e7eeff]/30" : "border-[#c4c5d5] hover:border-[#00288e] bg-[#f9f9ff]"
                }`}>
                  <input 
                    type="radio" 
                    name="recommendation" 
                    checked={recommendation === "Strong Hire"}
                    onChange={() => setRecommendation("Strong Hire")}
                    className="w-5 h-5 text-[#00288e] focus:ring-[#00288e] border-[#c4c5d5]"
                  />
                  <span className="text-sm font-semibold text-[#111c2d] flex-grow">Strong Hire</span>
                  <ThumbsUp className="w-5 h-5 text-[#00288e]" />
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  recommendation === "Hire" ? "border-[#00288e] bg-[#e7eeff]/30" : "border-[#c4c5d5] hover:border-[#00288e] bg-[#f9f9ff]"
                }`}>
                  <input 
                    type="radio" 
                    name="recommendation" 
                    checked={recommendation === "Hire"}
                    onChange={() => setRecommendation("Hire")}
                    className="w-5 h-5 text-[#00288e] focus:ring-[#00288e] border-[#c4c5d5]"
                  />
                  <span className="text-sm font-semibold text-[#111c2d] flex-grow">Hire</span>
                  <CheckCircle className="w-5 h-5 text-[#00288e]" />
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  recommendation === "No Hire" ? "border-[#ba1a1a] bg-[#ffdad6]/20" : "border-[#c4c5d5] hover:border-[#ba1a1a] bg-[#f9f9ff]"
                }`}>
                  <input 
                    type="radio" 
                    name="recommendation" 
                    checked={recommendation === "No Hire"}
                    onChange={() => setRecommendation("No Hire")}
                    className="w-5 h-5 text-[#ba1a1a] focus:ring-[#ba1a1a] border-[#c4c5d5]"
                  />
                  <span className="text-sm font-semibold text-[#111c2d] flex-grow">No Hire</span>
                  <ThumbsDown className="w-5 h-5 text-[#ba1a1a]" />
                </label>
              </div>

              <div className="mt-auto pt-6 flex gap-4">
                <button className="flex-1 py-3 px-4 rounded-lg border border-[#c4c5d5] text-[#111c2d] font-semibold hover:bg-[#f0f3ff] transition-colors">
                  Save Draft
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-[2] py-3 px-4 rounded-lg bg-[#00288e] text-white font-semibold shadow-md hover:bg-[#1e40af] transition-all flex items-center justify-center"
                >
                  Submit Feedback
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
