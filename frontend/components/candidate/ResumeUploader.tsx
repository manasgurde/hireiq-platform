"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setStatus("idle");
    } else {
      setStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    
    try {
      // 1. Get presigned URL from core API
      const token = localStorage.getItem("hireiq_token");
      const presignRes = await fetch("http://localhost:8000/api/v1/resumes/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.name, content_type: file.type })
      });
      
      if (!presignRes.ok) throw new Error("Failed to get presigned URL");
      const { upload_url, s3_key, resume_id } = await presignRes.json();

      // 2. Upload to S3 directly
      const s3Res = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!s3Res.ok) throw new Error("Failed to upload to S3");

      // 3. Confirm with core API
      const confirmRes = await fetch(`http://localhost:8000/api/v1/resumes/confirm/${resume_id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!confirmRes.ok) throw new Error("Failed to parse resume");
      
      setStatus("success");
    } catch (err) {
      console.error("Upload error", err);
      setStatus("error");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 z-0" />
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-4">Upload Resume</h3>
        
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            status === "error" ? "border-red-500/50 bg-red-500/5" : 
            status === "success" ? "border-green-500/50 bg-green-500/5" :
            "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
          }`}
        >
          {status === "success" ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
              <p className="text-green-300 font-medium">Resume parsed & added to your profile!</p>
            </div>
          ) : status === "uploading" ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-indigo-300 font-medium">Uploading and parsing with AI...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center cursor-pointer">
              <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-300 mb-1 font-medium">
                {file ? file.name : "Drag and drop your PDF resume here"}
              </p>
              <p className="text-slate-500 text-sm">
                PDF up to 5MB
              </p>
              
              <div className="mt-6 flex gap-3">
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="file-upload"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:text-white"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Browse
                </Button>
                {file && (
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleUpload}
                  >
                    Parse & Save
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="mt-4 flex items-center justify-center text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              There was an error uploading. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
