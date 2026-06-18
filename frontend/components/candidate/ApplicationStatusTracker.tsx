"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  job?: { title: string; company: string };
}

export default function ApplicationStatusTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const token = localStorage.getItem("hireiq_token");
        const res = await fetch("http://localhost:8000/api/v1/applications/my", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "interview":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Interview Stage
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-slate-800 rounded-xl h-64 w-full"></div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-xl font-bold text-white">Your Applications</h3>
      </div>
      
      {applications.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <p>You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-800">
                <th className="px-6 py-4 font-medium">Job Title</th>
                <th className="px-6 py-4 font-medium">Applied Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">
                      {app.job?.title || `Job #${app.job_id.substring(0, 8)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4">
                    {app.status.toLowerCase() === "interview" && (
                      <Link 
                        href={`/candidate/interview/${app.id}`}
                        className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        Start Mock Interview <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
