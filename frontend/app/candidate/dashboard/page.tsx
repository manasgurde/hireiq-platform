import ResumeUploader from "@/components/candidate/ResumeUploader";
import ApplicationStatusTracker from "@/components/candidate/ApplicationStatusTracker";

export default function CandidateDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Job Seeker <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your resumes, track applications, and practice with AI interviews.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* Resume Upload Widget */}
            <ResumeUploader />
            
            {/* Quick Stats or Tips Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-3">AI Matching Tips</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  Upload your most recent PDF resume to improve your match score.
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  Our AI extracts your skills and compares them to the job description.
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  Complete mock interviews to boost your recruiter visibility.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {/* Applications Table */}
            <ApplicationStatusTracker />
          </div>
        </div>
      </main>
    </div>
  );
}
