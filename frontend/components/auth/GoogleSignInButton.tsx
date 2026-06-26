"use client";

import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function GoogleSignInButton({ 
  text = "Continue with Google",
  role
}: { 
  text?: string,
  role?: string 
}) {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await authApi.googleLogin(tokenResponse.access_token, role);
        login(res.data.user, res.data.access_token);
        
        // Redirect based on role
        if (res.data.user.role === "recruiter") {
          router.push("/recruiter/dashboard");
        } else {
          router.push("/candidate/dashboard");
        }
      } catch (err: any) {
        console.error("Google login failed", err);
        const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || err.message || "Google Sign-In failed. Please try again.";
        alert(errMsg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.error("Google Login Failed");
      alert("Google Sign-In failed. Please try again.");
    }
  });

  return (
    <button
      type="button"
      onClick={() => handleGoogleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      ) : (
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
      )}
      <span className="text-slate-700 font-medium">{text}</span>
    </button>
  );
}
