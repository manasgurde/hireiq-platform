"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { resumesApi, type Resume } from "@/lib/api";

interface Props {
  resume: Resume;
  onUpdate: (updatedResume: Resume) => void;
}

export default function AIResumeEvaluation({ resume, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluation = resume.ai_evaluation;

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumesApi.evaluate();
      onUpdate(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to generate AI evaluation.");
    } finally {
      setLoading(false);
    }
  };

  if (!evaluation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">AI Resume Analysis</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Get instant, actionable feedback on your resume from our AI. We'll score your ATS compatibility and give you tips to improve.
        </p>
        
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Generate Evaluation
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">AI Resume Analysis</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - evaluation.rating / 100)}`}
                strokeLinecap="round"
                className={`${
                  evaluation.rating >= 80 ? "text-green-500" : evaluation.rating >= 60 ? "text-amber-500" : "text-red-500"
                } transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white">{evaluation.rating}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>
          <p className="text-slate-400 font-medium text-center">ATS Compatibility Score</p>
        </div>

        <div className="md:w-2/3 space-y-6">
          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-5">
            <h4 className="flex items-center gap-2 font-semibold text-green-400 mb-3">
              <CheckCircle2 className="w-5 h-5" /> Strong Points
            </h4>
            <ul className="space-y-2">
              {evaluation.good_points.map((point, i) => (
                <li key={i} className="text-slate-300 text-sm flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-400 mb-3">
            <AlertTriangle className="w-5 h-5" /> Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {evaluation.bad_points.map((point, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start">
                <span className="text-amber-500 mr-2 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5">
          <h4 className="flex items-center gap-2 font-semibold text-blue-400 mb-3">
            <Lightbulb className="w-5 h-5" /> Suggested Updates
          </h4>
          <ul className="space-y-2">
            {evaluation.suggestions.map((point, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
