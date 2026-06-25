"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { analyticsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  jobId?: string | null;
}

const trendData = [
  { week: "Week 1", applications: 120 },
  { week: "Week 2", applications: 190 },
  { week: "Week 3", applications: 155 },
  { week: "Week 4", applications: 225 },
];

const scoreData: any[] = [];

export default function AnalyticsDashboard({ jobId }: Props) {
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunnel() {
      setLoading(true);
      try {
        const res = await analyticsApi.getFunnel(jobId || undefined);
        if (res.data?.success && res.data.data?.funnel) {
          const funnelMap = res.data.data.funnel;
          const formatted = Object.keys(funnelMap).map((stage) => ({
            stage: stage.charAt(0).toUpperCase() + stage.slice(1),
            count: funnelMap[stage],
          }));
          setFunnelData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch funnel analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFunnel();
  }, [jobId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Hiring Funnel Stage Data (Real Funnel Data) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Real-Time Hiring Funnel</h3>
            <p className="text-xs text-slate-400 mt-0.5">Active candidates by pipeline stage</p>
          </div>
        </div>
        <div className="h-48">
          {loading ? (
            <div className="w-full h-full flex items-end gap-4 px-4 pb-4">
              <Skeleton className="h-[40%] w-full rounded-t-md" />
              <Skeleton className="h-[70%] w-full rounded-t-md" />
              <Skeleton className="h-[100%] w-full rounded-t-md" />
              <Skeleton className="h-[60%] w-full rounded-t-md" />
            </div>
          ) : funnelData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No funnel data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                  cursor={{ fill: "#f1f5f9", opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI Score Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Score Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Talent quality breakdown</p>
          </div>
        </div>
        <div className="h-48">
          {scoreData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No score data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12, color: "#fff" }}
                  itemStyle={{ color: "#a5b4fc" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
