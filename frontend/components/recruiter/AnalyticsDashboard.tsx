"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const MOCK_DATA = [
  { date: "Mon", applications: 12 },
  { date: "Tue", applications: 19 },
  { date: "Wed", applications: 15 },
  { date: "Thu", applications: 25 },
  { date: "Fri", applications: 32 },
  { date: "Sat", applications: 10 },
  { date: "Sun", applications: 14 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">Application Volume (Last 7 Days)</h3>
      </div>
      <div className="p-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dx={-10} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="applications" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorApps)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
