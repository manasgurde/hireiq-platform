"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, Bold, Italic, Underline, List, ListOrdered, Sparkles, 
  Send, HelpCircle, LogOut, CheckCircle, AlertCircle, Plus, 
  Search, Bell, Settings, Globe, Users, Calendar, ArrowRight, ClipboardList
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function RecruiterOfferLetterPage() {
  const { user, logout } = useAuthStore();
  const [template, setTemplate] = useState("Standard Full-Time");
  const [salary, setSalary] = useState("TBD");
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [editorContent, setEditorContent] = useState(
    `Dear Sarah Jenkins,\n\nWe are thrilled to extend an offer of employment for the position of Senior Frontend Engineer at HireIQ.\n\nBased on our conversations, we are confident you will be a tremendous addition to our team.\n\n**Compensation**\nYour starting annualized base salary will be {{salary}}, paid semi-monthly.\n\n**Start Date**\nYour anticipated start date is October 24, 2024.\n\nPlease review the attached documents detailing benefits, PTO, and other standard company policies.\n\nWe look forward to welcoming you to the team!\n\nSincerely,\nThe HireIQ Team`
  );

  const name = user?.full_name || user?.email?.split("@")[0] || "Recruiter";

  const handleRewrite = () => {
    // Simulate AI rewriting for impact
    const rewritten = editorContent.replace(
      "We are thrilled to extend an offer of employment",
      "We are absolutely delighted to offer you the position"
    );
    setEditorContent(rewritten);
  };

  return (
    <div className="bg-[#f9f9ff] text-[#111c2d] font-sans h-[calc(100vh-64px)] overflow-hidden flex flex-col">

        {/* Page Header & Actions */}
        <div className="px-8 py-4 flex justify-between items-center bg-white border-b border-[#c4c5d5] shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#111c2d] mb-1">Offer Letter Generator</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#444653]">
              <span>Sarah Jenkins</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-[#111c2d]">Senior Frontend Engineer</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#111c2d] hover:bg-[#f0f3ff] transition-colors">
              Save Draft
            </button>
            <button className="px-4 py-2 bg-[#1e40af] text-white rounded-lg text-sm font-semibold hover:bg-[#00288e] transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send via DocuSign
            </button>
          </div>
        </div>

        {/* Multi-pane Workspace */}
        <main className="flex-1 overflow-hidden flex bg-[#e7eeff]/30 p-6 gap-6">
          {/* Left Pane: Templates & Checklist */}
          <div className="w-80 bg-white rounded-xl border border-[#c4c5d5] shadow-sm flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-[#c4c5d5]">
              <h3 className="font-semibold text-lg text-[#111c2d] mb-3">Templates</h3>
              <select 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-2.5 border border-[#c4c5d5] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1e40af] focus:outline-none"
              >
                <option>Standard Full-Time</option>
                <option>Executive</option>
                <option>Contractor</option>
              </select>
            </div>
            <div className="p-6 flex-1">
              <h3 className="font-semibold text-lg text-[#111c2d] mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#00288e]" />
                <span>Smart Fields</span>
              </h3>
              <p className="text-xs text-[#444653] mb-6">Ensure all required data points are filled.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#0f766e]" />
                    <span className="text-sm font-medium text-[#111c2d]">Candidate Name</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#0f766e]" />
                    <span className="text-sm font-medium text-[#111c2d]">Job Title</span>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-3 bg-[#f9f9ff] border rounded-lg border-l-4 ${
                  salary === "TBD" ? "border-l-[#ba1a1a] border-[#c4c5d5]" : "border-l-[#0f766e] border-[#c4c5d5]"
                }`}>
                  <div className="flex items-center gap-2.5">
                    {salary === "TBD" ? (
                      <AlertCircle className="w-4 h-4 text-[#ba1a1a]" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#0f766e]" />
                    )}
                    <span className="text-sm font-medium text-[#111c2d]">Salary: {salary}</span>
                  </div>
                  {isEditingSalary ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        placeholder="$130,000"
                        className="w-24 p-1 text-xs border rounded"
                        onBlur={(e) => {
                          if (e.target.value) {
                            setSalary(e.target.value);
                            setEditorContent(editorContent.replace("{{salary}}", e.target.value));
                          }
                          setIsEditingSalary(false);
                        }}
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingSalary(true)} 
                      className="text-[#00288e] font-semibold text-xs hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#0f766e]" />
                    <span className="text-sm font-medium text-[#111c2d]">Start Date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Pane: Editor */}
          <div className="flex-1 bg-white rounded-xl border border-[#c4c5d5] shadow-sm flex flex-col overflow-hidden">
            {/* Editor Toolbar */}
            <div className="border-b border-[#c4c5d5] p-2.5 flex items-center gap-1.5 bg-[#f9f9ff]">
              <button className="p-2 hover:bg-[#e7eeff] rounded transition-colors text-[#444653]"><Bold className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-[#e7eeff] rounded transition-colors text-[#444653]"><Italic className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-[#e7eeff] rounded transition-colors text-[#444653]"><Underline className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-[#c4c5d5] mx-2"></div>
              <button className="p-2 hover:bg-[#e7eeff] rounded transition-colors text-[#444653]"><List className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-[#e7eeff] rounded transition-colors text-[#444653]"><ListOrdered className="w-4 h-4" /></button>
            </div>

            {/* Editor Content */}
            <textarea 
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="p-8 overflow-y-auto flex-1 text-sm leading-relaxed text-[#111c2d] whitespace-pre-wrap outline-none resize-none border-none focus:ring-0"
            />
          </div>

          {/* Right Pane: AI Assistant */}
          <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto">
            {/* AI Optimizer */}
            <div className="bg-white rounded-xl border border-[#c4c5d5] shadow-sm overflow-hidden flex flex-col relative">
              <div className="h-1 w-full bg-gradient-to-r from-[#1e40af] via-[#00554f] to-[#544fc0]"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#544fc0]" />
                  <h3 className="font-semibold text-lg text-[#111c2d]">AI Offer Optimizer</h3>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-[#444653]">Tone Analysis</span>
                    <span className="text-xs font-bold text-[#0f766e]">Professional &amp; Welcoming</span>
                  </div>
                  <div className="w-full bg-[#dee8ff] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0f766e] h-full w-[85%] rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 bg-[#f9f9ff] rounded-lg border border-[#c4c5d5] mb-6">
                  <h4 className="font-semibold text-xs text-[#111c2d] mb-1">Market Competitiveness</h4>
                  <p className="text-[10px] text-[#444653] mb-3">Based on SF market data for Senior Frontend Engineers.</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-4 border-[#dee8ff]">
                      <span className="text-xs font-bold text-[#111c2d]">75%</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-[#111c2d] leading-snug">Base salary is slightly below median. Consider adding equity to strengthen offer.</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleRewrite}
                  className="w-full py-2 bg-[#f0f3ff] text-[#1e40af] font-semibold text-xs rounded-lg hover:bg-[#d8e3fb] transition-colors flex justify-center items-center gap-2 border border-[#c4c5d5]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Rewrite for Impact</span>
                </button>
              </div>
            </div>

            {/* Package Summary */}
            <div className="bg-white rounded-xl border border-[#c4c5d5] shadow-sm p-6">
              <h3 className="font-semibold text-lg text-[#111c2d] mb-4 border-b border-[#c4c5d5] pb-2">Package Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#444653]">Base Salary</span>
                  <span className="font-bold text-[#111c2d]">{salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444653]">Sign-on Bonus</span>
                  <span className="font-bold text-[#111c2d]">$10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444653]">Equity (RSUs)</span>
                  <span className="font-bold text-[#111c2d]">None added</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#c4c5d5] flex justify-between items-center">
                <span className="font-bold text-[#111c2d]">Total Value</span>
                <span className="font-bold text-[#00288e]">{salary !== "TBD" ? `$${Number(salary.replace(/[^0-9]/g, "")) + 10000}` : "--"}</span>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
