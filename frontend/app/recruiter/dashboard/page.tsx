"use client";

import { useState } from "react";
import CandidatesTable from "@/components/recruiter/CandidatesTable";

// Hardcoded for the MVP demonstration purposes.
// In a full implementation, you'd fetch the recruiter's active jobs list.
const DEMO_JOB_ID = "00000000-0000-0000-0000-000000000000"; // Replace with a real UUID if testing integration

export default function RecruiterDashboard() {
  const [jobId, setJobId] = useState(DEMO_JOB_ID);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Recruiter <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Pipeline</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Manage your job postings and review AI-scored candidate applications.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-lg">
            <label className="text-sm font-medium text-slate-400 pl-2">Active Job:</label>
            <input 
              type="text" 
              value={jobId} 
              onChange={(e) => setJobId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 w-64 font-mono"
              placeholder="Enter Job UUID..."
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Candidates Table view */}
          <CandidatesTable jobId={jobId} />
        </div>
      </main>
    </div>
  );
}
