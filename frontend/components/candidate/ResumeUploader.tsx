"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onUploadSuccess?: (resume: any) => void;
}

export default function ResumeUploader({ onUploadSuccess }: Props = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);

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
    setErrorMsg(null);
    setTimeLeft(60);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);
    
    try {
      // 1. Get presigned URL from core API
      const { default: api } = await import('@/lib/api');
      
      const presignRes = await api.post('/v1/resumes/upload-url', undefined, {
        signal: controller.signal
      });
      const { upload_url, s3_key } = presignRes.data;

      // 2. Upload to S3 directly
      const s3Res = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
        signal: controller.signal
      });

      if (!s3Res.ok) throw new Error("Failed to upload to S3");

      // 3. Confirm with core API
      const confirmRes = await api.post('/v1/resumes/confirm', { s3_key }, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      setStatus("success");
      if (onUploadSuccess) onUploadSuccess(confirmRes.data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      console.error("Upload error", err);
      
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        setErrorMsg("Upload timed out after 1 minute. Please try again.");
      } else if (err.response?.data?.error?.message || err.response?.data?.error?.detail) {
        setErrorMsg(err.response.data.error.message || err.response.data.error.detail);
      } else {
        setErrorMsg(err.message || "An unknown error occurred.");
      }
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
              <p className="text-indigo-400 text-sm mt-2 font-mono">
                Timeout in: 00:{timeLeft.toString().padStart(2, '0')}
              </p>
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
              {errorMsg || "There was an error uploading. Please try again."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
