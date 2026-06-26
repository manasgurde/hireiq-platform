"use client";
import { useEffect, useState } from "react";
import { resumesApi } from "@/lib/api";
export default function Page() {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await resumesApi.getMine();
        if (res.data && res.data.ai_evaluation) {
          setEvaluation(res.data.ai_evaluation);
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const rating = evaluation?.rating || 0;
  const goodPoints = evaluation?.good_points || [];
  const suggestionsRaw = evaluation?.suggestions || [];
  const suggestions = suggestionsRaw
    .flatMap((s: any) => typeof s === 'string' ? s.split(/(?:,\s*and\s+|\s+and\s+)/i) : [])
    .map((s: string) => {
      let cleaned = s.replace(/^(adding|refine the|include|consider|focus on|you should)\s+/i, '');
      cleaned = cleaned.replace(/["']/g, '').replace(/\.$/, '').trim();
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .filter(Boolean);

  return (
    <div className="flex-1 md:ml-64 bg-background min-h-screen pb-24 md:pb-8 overflow-x-hidden">
      <div className="p-6 md:p-12 flex flex-col gap-8">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
<div>
<h2 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-surface tracking-tight">AI Insights</h2>
<p className="font-body-base text-body-base text-on-surface-variant mt-1">Deep learning analysis of your professional profile.</p>
</div>
<div className="flex gap-4">
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

<div className="bento-card col-span-1 md:col-span-12 xl:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-8 flex flex-col items-center justify-center glass-panel relative overflow-hidden">

<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-fixed-dim rounded-full blur-3xl opacity-30"></div>
<h3 className="font-h3 text-h3 text-on-surface mb-6 text-center w-full">AI Profile Strength</h3>

<div className="relative w-48 h-48 flex items-center justify-center mb-4">
<svg className="w-full h-full" viewBox="0 0 100 100">

<circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>

<circle className="text-tertiary-container stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" id="main-score-ring" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * rating) / 100} strokeLinecap="round" strokeWidth="8"></circle>
</svg>
<div className="absolute flex flex-col items-center justify-center">
<span className="font-display-xl text-display-xl text-on-surface leading-none tracking-tighter" id="main-score-text">{rating}</span>
<span className="font-body-sm text-body-sm text-tertiary font-semibold uppercase tracking-widest mt-1">
  {rating >= 80 ? "Excellent" : rating >= 60 ? "Good" : "Needs Work"}
</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant text-center px-6">
                    {evaluation ? "Based on our AI analysis, this is your overall profile strength score." : "Upload a resume to get your AI profile strength score."}
                </p>
</div>

<div className="col-span-1 md:col-span-12 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

<div className="bento-card bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
<div className="relative w-16 h-16 flex-shrink-0">
<svg className="w-full h-full" viewBox="0 0 100 100">
<circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="10"></circle>
<circle className="text-primary stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="37.68" strokeLinecap="round" strokeWidth="10" style={{ transitionDelay: "0.2s" }}></circle> 
</svg>
<div className="absolute inset-0 flex items-center justify-center font-h3 text-h3 font-bold text-on-surface">85</div>
</div>
<div>
<h4 className="font-body-base text-body-base font-semibold text-on-surface">Skills Match</h4>
<p className="font-caption text-caption text-on-surface-variant mt-1">Strong alignment with target roles.</p>
</div>
</div>

<div className="bento-card bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
<div className="relative w-16 h-16 flex-shrink-0">
<svg className="w-full h-full" viewBox="0 0 100 100">
<circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="10"></circle>
<circle className="text-secondary stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="70.33" strokeLinecap="round" strokeWidth="10" style={{ transitionDelay: "0.3s" }}></circle> 
</svg>
<div className="absolute inset-0 flex items-center justify-center font-h3 text-h3 font-bold text-on-surface">72</div>
</div>
<div>
<h4 className="font-body-base text-body-base font-semibold text-on-surface">Experience Depth</h4>
<p className="font-caption text-caption text-on-surface-variant mt-1">Solid tenure, needs more leadership keywords.</p>
</div>
</div>

<div className="bento-card bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
<div className="relative w-16 h-16 flex-shrink-0">
<svg className="w-full h-full" viewBox="0 0 100 100">
<circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="10"></circle>
<circle className="text-tertiary-fixed-dim stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="25.12" strokeLinecap="round" strokeWidth="10" style={{ transitionDelay: "0.4s" }}></circle> 
</svg>
<div className="absolute inset-0 flex items-center justify-center font-h3 text-h3 font-bold text-on-surface">90</div>
</div>
<div>
<h4 className="font-body-base text-body-base font-semibold text-on-surface">Education</h4>
<p className="font-caption text-caption text-on-surface-variant mt-1">Premium tier institutions detected.</p>
</div>
</div>

<div className="bento-card bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
<div className="relative w-16 h-16 flex-shrink-0">
<svg className="w-full h-full" viewBox="0 0 100 100">
<circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="10"></circle>
<circle className="text-outline stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="87.92" strokeLinecap="round" strokeWidth="10" style={{ transitionDelay: "0.5s" }}></circle> 
</svg>
<div className="absolute inset-0 flex items-center justify-center font-h3 text-h3 font-bold text-on-surface">65</div>
</div>
<div>
<h4 className="font-body-base text-body-base font-semibold text-on-surface">Profile Completeness</h4>
<p className="font-caption text-caption text-on-surface-variant mt-1">Missing portfolio links and recommendations.</p>
</div>
</div>
</div>

<div className="bento-card col-span-1 md:col-span-12 xl:col-span-6 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-8">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-primary">model_training</span>
<h3 className="font-h3 text-h3 text-on-surface">Skill Gap Analysis</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

<div>
<h4 className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide mb-4 border-b border-outline-variant pb-1">Verified Strengths</h4>
<ul className="space-y-4">
  {goodPoints.length > 0 ? goodPoints.map((pt: string, i: number) => (
    <li key={i} className="flex items-start gap-2">
    <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">check_circle</span>
    <div>
    <span className="font-body-base text-body-base font-semibold text-on-surface block">{pt}</span>
    </div>
    </li>
  )) : (
    <li className="text-on-surface-variant text-sm">No strengths found.</li>
  )}
</ul>
</div>

<div>
<h4 className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide mb-4 border-b border-outline-variant pb-1">Growth Opportunities</h4>
<ul className="space-y-4">
  {suggestions.length > 0 ? suggestions.map((pt: string, i: number) => (
    <li key={i} className="flex items-start gap-2">
    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">trending_up</span>
    <div>
    <span className="font-body-base text-body-base font-semibold text-on-surface block">{pt}</span>
    </div>
    </li>
  )) : (
    <li className="text-on-surface-variant text-sm">No suggestions yet.</li>
  )}
</ul>
</div>
</div>
</div>

<div className="col-span-1 md:col-span-12 xl:col-span-6 grid grid-cols-1 gap-6">

<div className="bento-card bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-8">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">radar</span>
<h3 className="font-h3 text-h3 text-on-surface">Role Affinity</h3>
</div>
<span className="font-caption text-caption bg-surface-container px-2 py-1 rounded text-on-surface-variant">Based on top 50 matches</span>
</div>
<div className="space-y-4">

<div>
<div className="flex justify-between text-body-sm font-body-sm mb-1">
<span className="text-on-surface font-semibold">Senior Frontend Engineer</span>
<span className="text-primary font-bold">92%</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2">
<div className="bg-primary h-2 rounded-full" style={{ width: "92%" }}></div>
</div>
</div>

<div>
<div className="flex justify-between text-body-sm font-body-sm mb-1">
<span className="text-on-surface font-semibold">Full Stack Developer</span>
<span className="text-primary font-bold">78%</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2">
<div className="bg-primary-container h-2 rounded-full opacity-80" style={{ width: "78%" }}></div>
</div>
</div>

<div>
<div className="flex justify-between text-body-sm font-body-sm mb-1">
<span className="text-on-surface font-semibold">Engineering Manager</span>
<span className="text-outline font-bold">45%</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2">
<div className="bg-outline-variant h-2 rounded-full" style={{ width: "45%" }}></div>
</div>
</div>
</div>
</div>

<div className="bento-card bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-8">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-primary-fixed-variant">checklist</span>
<h3 className="font-h3 text-h3 text-on-surface">Action Plan</h3>
</div>
<div className="space-y-2">
<label className="flex items-start gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
<input className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
<div>
<span className="font-body-base text-body-base font-semibold text-on-surface block">Quantify impact in recent role</span>
<span className="font-caption text-caption text-on-surface-variant">Add specific metrics (e.g., "Increased conversion by 15%")</span>
</div>
</label>
<label className="flex items-start gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
<input className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
<div>
<span className="font-body-base text-body-base font-semibold text-on-surface block">Add GitHub repository link</span>
<span className="font-caption text-caption text-on-surface-variant">Profiles with code samples rank 40% higher for technical roles.</span>
</div>
</label>
<label className="flex items-start gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
<input defaultChecked className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
<div>
<span className="font-body-base text-body-base font-semibold text-on-surface block line-through opacity-70">Update summary keyword density</span>
<span className="font-caption text-caption text-on-surface-variant opacity-70">Completed on Oct 12</span>
</div>
</label>
</div>
</div>
</div>
</div>
      </div>
    </div>
  );
}
