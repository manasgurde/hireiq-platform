"use client";
import { useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
export default function Page() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await applicationsApi.listMine();
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const handleWithdraw = async (id: string) => {
    try {
      await applicationsApi.updateStatus(id, "withdrawn");
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: "withdrawn" } : app
      ));
    } catch (err) {
      console.error("Failed to withdraw:", err);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === "all") return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted": return "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]";
      case "interview": return "bg-blue-50 text-blue-700 border-blue-200";
      case "hired": return "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]";
      case "applied": return "bg-primary-container/10 text-primary border-primary-container/20";
      case "rejected": return "bg-error-container text-on-error-container border-[#FAD2CF]";
      case "withdrawn": return "bg-surface-variant text-on-surface-variant border-outline-variant";
      default: return "bg-surface-variant text-on-surface-variant border-outline-variant";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted": return "bg-[#137333]";
      case "interview": return "bg-blue-600";
      case "hired": return "bg-[#137333]";
      case "applied": return "bg-primary";
      case "rejected": return "bg-error";
      case "withdrawn": return "bg-on-surface-variant";
      default: return "bg-on-surface-variant";
    }
  };

  const recentlyShortlisted = applications.find(a => a.status.toLowerCase() === "shortlisted");

  return (
    <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
      <div className="p-6 md:p-12 flex-1 flex flex-col gap-8">

        <div className="flex flex-col gap-1">
<h1 className="font-h1 text-h1 text-on-surface">My Applications</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Track and manage your current job applications.</p>
</div>

{recentlyShortlisted && (
<div className="bg-surface-container-lowest border-l-4 border-tertiary-container shadow-sm rounded-r-lg p-6 flex items-center justify-between glass animate-fade-in-up">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">celebration</span>
</div>
<div>
<h3 className="font-body-base font-semibold text-on-surface">Great news! You've been shortlisted.</h3>
<p className="font-body-sm text-on-surface-variant">{recentlyShortlisted.job?.company_name || 'A company'} moved your application for {recentlyShortlisted.job?.title || 'a role'} to the next round.</p>
</div>
</div>
<Link href={`/jobs/${recentlyShortlisted.job_id}`} className="px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-md font-body-sm font-medium hover:opacity-90 transition-opacity">
                    View Details
                </Link>
</div>
)}

<div className="flex items-center gap-4 border-b border-outline-variant overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
<button 
  onClick={() => setFilter("all")}
  className={`px-4 py-2 font-body-base transition-colors ${filter === "all" ? "font-semibold text-primary border-b-2 border-primary -mb-[1px]" : "text-on-surface-variant hover:text-primary"}`}>
                    All ({applications.length})
                </button>
<button 
  onClick={() => setFilter("applied")}
  className={`px-4 py-2 font-body-base transition-colors ${filter === "applied" ? "font-semibold text-primary border-b-2 border-primary -mb-[1px]" : "text-on-surface-variant hover:text-primary"}`}>
                    Applied ({applications.filter(a => a.status.toLowerCase() === "applied").length})
                </button>
<button 
  onClick={() => setFilter("shortlisted")}
  className={`px-4 py-2 font-body-base transition-colors ${filter === "shortlisted" ? "font-semibold text-primary border-b-2 border-primary -mb-[1px]" : "text-on-surface-variant hover:text-primary"}`}>
                    Shortlisted ({applications.filter(a => a.status.toLowerCase() === "shortlisted").length})
                </button>
<button 
  onClick={() => setFilter("rejected")}
  className={`px-4 py-2 font-body-base transition-colors ${filter === "rejected" ? "font-semibold text-primary border-b-2 border-primary -mb-[1px]" : "text-on-surface-variant hover:text-primary"}`}>
                    Rejected ({applications.filter(a => a.status.toLowerCase() === "rejected").length})
                </button>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-low font-body-sm text-on-surface-variant border-b border-outline-variant">
<tr>
<th className="py-4 px-6 font-medium">Company &amp; Job</th>
<th className="py-4 px-6 font-medium">Applied Date</th>
<th className="py-4 px-6 font-medium text-center">AI Match Score</th>
<th className="py-4 px-6 font-medium">Status</th>
<th className="py-4 px-6 font-medium text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">

{loading ? (
  <tr>
    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
      Loading applications...
    </td>
  </tr>
) : filteredApps.length === 0 ? (
  <tr>
    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
      No applications found.
    </td>
  </tr>
) : filteredApps.map((app) => (
  <tr key={app.id} className="hover:bg-surface-container-low transition-colors group">
  <td className="py-4 px-6">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-lg bg-surface-variant text-on-surface flex items-center justify-center font-bold text-h3 border border-outline-variant uppercase">
                                          {(app.job?.company_name || "NA").substring(0, 2)}
                                      </div>
  <div>
  <p className="font-body-base font-semibold text-on-surface">{app.job?.title || "Unknown Job"}</p>
  <p className="font-body-sm text-on-surface-variant">{app.job?.company_name || "Unknown Company"}</p>
  </div>
  </div>
  </td>
  <td className="py-4 px-6 font-body-sm text-on-surface-variant">{format(new Date(app.created_at), 'MMM dd, yyyy')}</td>
  <td className="py-4 px-6">
  <div className="flex justify-center">
  {(() => {
    const score = app.overall_score ? Math.round(app.overall_score * 100) : 0;
    return (
      <div className={`relative w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest border-2 ${score >= 80 ? 'border-tertiary-container' : score >= 60 ? 'border-[#F29900]' : 'border-error'}`}>
      <span className={`font-body-sm font-bold ${score >= 80 ? 'text-tertiary-container' : score >= 60 ? 'text-[#B06000]' : 'text-error'}`}>{score}</span>
      </div>
    );
  })()}
  </div>
  </td>
  <td className="py-4 px-6">
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-body-sm font-medium border ${getStatusColor(app.status)}`}>
  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(app.status)}`}></span>
                                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                  </span>
  </td>
  <td className="py-4 px-6 text-right">
  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <Link href={`/jobs/${app.job_id}`} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-container" title="View Job">
  <span className="material-symbols-outlined text-[20px]">visibility</span>
  </Link>
  </div>
  </td>
  </tr>
))}
</tbody>
</table>
</div>
</div>
    </div>
  );
}
