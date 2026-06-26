"use client";
import { useState, useEffect, useRef } from "react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecruiterProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: "",
    location: "",
    bio: "",
    avatar_url: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await usersApi.getProfile();
        setFormData({
          full_name: res.data.full_name || user?.full_name || "",
          email: user?.email || "",
          phone_number: res.data.phone_number || "",
          location: res.data.location || "",
          bio: res.data.bio || "",
          avatar_url: res.data.avatar_url || ""
        });
        if (user && res.data.avatar_url && user.avatar_url !== res.data.avatar_url) {
          setUser({ ...user, avatar_url: res.data.avatar_url });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        location: formData.location,
        bio: formData.bio
      });
      if (user) {
        setUser({ ...user, full_name: formData.full_name });
      }
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const res = await usersApi.uploadAvatar(formDataUpload);
        if (res.data.avatar_url) {
          setFormData((prev) => ({ ...prev, avatar_url: res.data.avatar_url! }));
          if (user) {
            setUser({ ...user, avatar_url: res.data.avatar_url });
          }
        }
      } catch (err) {
        console.error("Failed to upload avatar", err);
        alert("Failed to upload avatar.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen pb-24 font-sans text-slate-900">
        <div className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col gap-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 font-sans text-slate-900">
      <div className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recruiter Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your public information and settings.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full group cursor-pointer" onClick={handlePhotoClick}>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <img alt="Profile Photo" className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-sm transition-all group-hover:brightness-75" src={formData.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.full_name || "Recruiter")} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <button onClick={handlePhotoClick} className="text-blue-600 text-sm hover:underline font-semibold">Change Photo</button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-slate-700 text-xs font-semibold mb-1.5 uppercase tracking-wide">Full Name</label>
                <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm outline-none" type="text"/>
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5 uppercase tracking-wide">Email</label>
                <input name="email" value={formData.email} disabled className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm outline-none cursor-not-allowed" type="email"/>
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5 uppercase tracking-wide">Phone Number</label>
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm outline-none" type="tel" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-slate-700 text-xs font-semibold mb-1.5 uppercase tracking-wide">Location / Office</label>
                <input name="location" value={formData.location} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm outline-none" type="text" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-slate-700 text-xs font-semibold mb-1.5 uppercase tracking-wide">Bio / Department</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm outline-none resize-y" rows={4} placeholder="E.g., Senior Technical Recruiter focusing on Engineering roles..."></textarea>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
