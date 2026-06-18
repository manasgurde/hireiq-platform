"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import AIChatInterface from "@/components/interview/AIChatInterface";
import SkillGapRadar from "@/components/interview/SkillGapRadar";
import { Activity, Target, ShieldCheck } from "lucide-react";

// Mock data for UI demonstration. In reality, fetch from API using `applicationId`.
const MOCK_REQUIRED_SKILLS = ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker"];
const MOCK_CANDIDATE_SKILLS = ["React", "JavaScript", "Node.js", "MySQL", "AWS"];

export default function InterviewPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const [semanticScore, setSemanticScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold tracking-widest uppercase">
                Live Session
              </span>
              <span className="text-slate-500 text-sm font-mono">{applicationId.substring(0, 8)}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              AI Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Interview</span>
            </h1>
            <p className="text-slate-400">
              Answer the behavioral questions. Our SBERT AI will score your semantic similarity against ideal rubrics.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AIChatInterface 
              applicationId={applicationId} 
              onScoreUpdated={(score) => setSemanticScore(score)}
              onComplete={() => setIsCompleted(true)}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Live Telemetry Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"></div>
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" /> Live Telemetry
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Semantic Accuracy Score</span>
                    <span className="text-white font-bold">{Math.round(semanticScore * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div 
                      className="bg-cyan-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.round(semanticScore * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300">Identity Verified</span>
                  </div>
                </div>
                
                {isCompleted && (
                  <div className="pt-4 border-t border-slate-800 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
                      <Target className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <div className="text-indigo-300 font-bold mb-1">Interview Complete</div>
                        <div className="text-slate-400 text-sm">Your semantic scores have been recorded and sent to the recruiter.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recharts Radar */}
            <SkillGapRadar 
              requiredSkills={MOCK_REQUIRED_SKILLS} 
              candidateSkills={MOCK_CANDIDATE_SKILLS} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
