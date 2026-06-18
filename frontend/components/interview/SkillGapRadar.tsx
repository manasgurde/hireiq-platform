"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";

interface SkillGapRadarProps {
  candidateSkills: string[];
  requiredSkills: string[];
}

export default function SkillGapRadar({ candidateSkills, requiredSkills }: SkillGapRadarProps) {
  // Compute the intersection to generate the radar chart data
  const allSkills = Array.from(new Set([...requiredSkills, ...candidateSkills])).slice(0, 8); // Max 8 for clean radar

  const data = allSkills.map(skill => {
    return {
      subject: skill,
      A: requiredSkills.includes(skill) ? 100 : 0, // Job Requirement
      B: candidateSkills.includes(skill) ? 100 : 0, // Candidate Skill
      fullMark: 100,
    };
  });

  return (
    <div className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col">
      <h3 className="text-white font-bold text-lg mb-2">Skill Gap Analysis</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Required by Job"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.3}
            />
            <Radar
              name="Candidate Profile"
              dataKey="B"
              stroke="#2dd4bf"
              fill="#2dd4bf"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
