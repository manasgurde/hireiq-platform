"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { resumesApi, Resume } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { user } = useAuthStore();
  const [uploadState, setUploadState] = useState<"loading" | "idle" | "uploading" | "analyzing" | "complete">("loading");
  const [progress, setProgress] = useState(0);
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch existing resume on load
    resumesApi.getMine()
      .then((res) => {
        if (res.data) {
          setResume(res.data);
          setUploadState("complete");
        } else {
          setUploadState("idle");
        }
      })
      .catch((err) => {
        // 404 is expected if they have no resume
        if (err.response?.status !== 404) {
          console.error("Failed to fetch resume:", err);
        }
        setUploadState("idle");
      });
  }, []);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await performUpload(file);
    }
  };

  const performUpload = async (file: File) => {
    setError(null);
    setUploadState("uploading");
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Single-step upload: backend parses PDF and stores bytes in PostgreSQL
      setProgress(50);
      setUploadState("analyzing");

      const uploadRes = await resumesApi.upload(formData);
      setProgress(80);

      // Optionally call evaluate to get AI extraction (name, skills, rating)
      try {
        const evaluateRes = await resumesApi.evaluate();
        setResume(evaluateRes.data);
      } catch {
        // evaluate might fail if Gemini isn't configured — still show uploaded resume
        setResume(uploadRes.data);
      }

      setProgress(100);
      setTimeout(() => setUploadState("complete"), 500);

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "An error occurred during upload.";
      setError(msg);
      setUploadState("idle");
      setProgress(0);
    }
  };


  const deleteResume = async () => {
    if (!confirm("Are you sure you want to delete your resume?")) return;
    try {
      await resumesApi.delete();
      setResume(null);
      setUploadState("idle");
    } catch (err) {
      console.error("Failed to delete resume", err);
    }
  };

  if (uploadState === "loading") {
    return (
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-5xl mx-auto pb-24">
          <div className="mb-8 flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <Skeleton className="h-64 rounded-xl w-full" />
              <Skeleton className="h-64 rounded-xl w-full" />
            </div>
            <div className="flex flex-col gap-8">
              <Skeleton className="h-64 rounded-xl w-full" />
              <Skeleton className="h-64 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const parsedSkills = resume?.ai_evaluation?.extracted_skills?.length ? resume.ai_evaluation.extracted_skills : (resume?.ai_evaluation?.good_points || []);
  const suggestions = resume?.ai_evaluation?.suggestions || [];
  const candidateName = resume?.ai_evaluation?.candidate_name || user?.full_name || "N/A";

  return (
    <div className="flex-1 overflow-y-auto p-12">
      <div className="max-w-5xl mx-auto pb-24">

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="font-h1 text-h1 text-on-background">Resume Analysis</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Upload your resume and let our AI build your professional profile in seconds.</p>
          </div>
          {resume && uploadState === "complete" && (
            <button onClick={deleteResume} className="bg-error-container text-on-error-container px-4 py-2 rounded border border-error/20 hover:bg-error/10 text-sm font-medium">
              Delete Resume
            </button>
          )}
        </div>

        {error && (
          <div className="bg-error-container border border-error/20 rounded-lg p-4 mb-6 text-on-error-container">
            {error}
          </div>
        )}

        {uploadState === "idle" && (
          <div 
            onClick={handleUpload}
            className="bg-surface rounded-xl border-2 border-dashed border-outline-variant p-12 flex flex-col items-center justify-center text-center shadow-sm hover:border-primary-container transition-colors cursor-pointer group mb-8 relative overflow-hidden bg-white"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange} 
            />
            <div className="absolute inset-0 bg-primary-container opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-display-xl text-primary-container" style={{ fontVariationSettings: "'FILL' 0" }}>upload_file</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-background mb-2">Drag and drop your resume here</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">Supports PDF (Max 10MB)</p>
            <button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-h3 text-h3 font-semibold shadow-md hover:bg-secondary transition-colors z-10 flex items-center gap-2">
              <span className="material-symbols-outlined">folder_open</span>
              Browse Files
            </button>
          </div>
        )}

        {(uploadState === "uploading" || uploadState === "analyzing") && (
          <div className="bg-surface rounded-xl border border-outline-variant p-8 shadow-md mb-8 flex flex-col gap-6 relative overflow-hidden bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary animate-spin">autorenew</span>
                <h3 className="font-h3 text-h3 text-on-background">
                  {uploadState === "uploading" ? "Uploading file..." : "Analysis in Progress..."}
                </h3>
              </div>
              <span className="font-body-sm text-body-sm font-bold text-secondary">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container rounded-full relative transition-all duration-300" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white opacity-20 w-full animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <div className={`flex items-center gap-2 text-tertiary-container ${progress >= 30 ? "" : "opacity-50"}`}>
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>Uploading to secure storage...</span>
              </div>
              <div className={`flex items-center gap-2 text-tertiary-container ${progress >= 60 ? "" : "opacity-50"}`}>
                <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                <span>Extracting raw text...</span>
              </div>
              <div className={`flex items-center gap-2 text-tertiary-container ${progress >= 80 ? "" : "opacity-50"}`}>
                <span className="material-symbols-outlined text-[16px]">pending</span>
                <span>Running AI evaluation & mapping skills...</span>
              </div>
            </div>
          </div>
        )}

        <div className={`relative transition-all duration-500 ${uploadState !== "complete" ? "opacity-60 grayscale pointer-events-none blur-[1px]" : ""}`}>
          {uploadState !== "complete" && (
            <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="bg-surface border border-outline-variant px-8 py-4 rounded-lg shadow-lg flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <span className="font-h3 text-h3 text-on-surface-variant">Awaiting Analysis Completion</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <div className="bg-surface rounded-xl border border-outline-variant p-8 shadow-sm bg-white">
                <h3 className="font-h3 text-h3 text-on-background border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">person</span> Personal Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Name</span>
                    <span className="font-body-base text-body-base text-on-background font-medium">{candidateName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Email</span>
                    <span className="font-body-base text-body-base text-primary-container">{user?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Original File</span>
                    <a href={resume?.s3_url || "#"} target="_blank" rel="noreferrer" className="font-body-base text-body-base text-tertiary font-medium hover:underline flex items-center gap-1">
                      View PDF <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-outline-variant p-8 shadow-sm bg-white">
                <h3 className="font-h3 text-h3 text-on-background border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">lightbulb</span> AI Feedback & Suggestions
                </h3>
                <div className="space-y-4">
                  {suggestions.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">No suggestions available at this time.</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-2 text-on-surface-variant text-sm">
                      {suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-surface rounded-xl border border-outline-variant p-8 shadow-sm bg-white">
                <h3 className="font-h3 text-h3 text-on-background border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">code</span> Parsed Skills & Strengths
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-caption text-caption text-on-surface-variant mb-1">Identified Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {parsedSkills.length === 0 ? (
                        <span className="text-on-surface-variant text-sm italic">No skills detected.</span>
                      ) : (
                        parsedSkills.map((skill, idx) => (
                          <span key={idx} className="px-4 py-1 bg-surface-container-high text-on-background rounded-full font-body-sm text-body-sm">
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-outline-variant p-8 shadow-sm bg-white">
                <h3 className="font-h3 text-h3 text-on-background border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">analytics</span> Overall Score
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" fill="none" r="45" stroke="#e2e8f0" strokeWidth="8"></circle>
                      <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="45" stroke="#0F766E" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * (resume?.ai_evaluation?.rating || 0)) / 100} strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-h3 text-h3 text-tertiary-container">{resume?.ai_evaluation?.rating || 0}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-body-base text-body-base font-semibold text-on-surface">Resume AI Rating</p>
                    <p className="text-sm text-on-surface-variant">Based on parsing accuracy, structure, and keyword density.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
