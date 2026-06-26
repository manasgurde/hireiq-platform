"use client";
import { useState, useEffect, useRef } from "react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: "",
    location: "",
    bio: "",
    avatar_url: "",
    date_of_birth: "",
    linkedin_url: "",
    github_url: ""
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
          avatar_url: res.data.avatar_url || "",
          date_of_birth: res.data.date_of_birth || "",
          linkedin_url: res.data.linkedin_url || "",
          github_url: res.data.github_url || ""
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
        bio: formData.bio,
        date_of_birth: formData.date_of_birth,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url
      });
      // Update auth store with new name
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
      <div className="flex-1 md:ml-64 bg-background min-h-screen pb-24">
        <div className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col gap-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          <section className="bg-surface rounded-xl border border-outline-variant shadow-sm p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:ml-64 bg-background min-h-screen pb-24">
      <div className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-h2 font-h2 text-on-surface">Edit Profile</h2>
            <p className="text-on-surface-variant font-body-sm text-body-sm mt-1">Update your professional information.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-body-sm font-semibold shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

<section className="bg-surface rounded-xl border border-outline-variant shadow-sm p-8">
<h3 className="text-h3 font-h3 text-on-surface mb-6 border-b border-outline-variant pb-2">Personal Information</h3>
<div className="flex flex-col md:flex-row gap-8 items-start">

<div className="flex flex-col items-center gap-4">
<div className="relative w-32 h-32 rounded-full group cursor-pointer" onClick={handlePhotoClick}>
<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
<img alt="Profile Photo" className="w-full h-full object-cover rounded-full border-4 border-surface-container-low shadow-sm transition-all group-hover:brightness-75" src={formData.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.full_name || "User")} />
<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
<span className="material-symbols-outlined text-white text-3xl">edit</span>
</div>
</div>
<button onClick={handlePhotoClick} className="text-primary font-body-sm text-body-sm hover:underline font-semibold">Change Photo</button>
</div>

<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
<div className="col-span-1 md:col-span-2">
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold">Full Name</label>
<input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none" type="text"/>
</div>
<div>
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold">Email</label>
<input name="email" value={formData.email} disabled className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface-variant text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none cursor-not-allowed" type="email"/>
</div>
<div>
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold uppercase tracking-wider">Phone Number</label>
<input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none" type="tel" />
</div>
<div>
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold uppercase tracking-wider">Date of Birth</label>
<input name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none" type="date" />
</div>
<div className="col-span-1 md:col-span-2">
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold uppercase tracking-wider">Location</label>
<input name="location" value={formData.location} onChange={handleChange} className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none" type="text" />
</div>
<div className="col-span-1 md:col-span-2">
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold uppercase tracking-wider">Professional Summary</label>
<textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none resize-y" rows={4}></textarea>
</div>
</div>
</div>
</section>

<section className="bg-surface rounded-xl border border-outline-variant shadow-sm p-8">
<h3 className="text-h3 font-h3 text-on-surface mb-6 border-b border-outline-variant pb-2">Social Links</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
<div>
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold uppercase tracking-wider">LinkedIn URL</label>
<input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none" type="url" />
</div>
<div>
<label className="block text-on-surface-variant font-caption text-caption mb-1 font-semibold uppercase tracking-wider">GitHub URL</label>
<input name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/username" className="w-full border border-outline-variant rounded-lg px-4 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-base text-body-base outline-none" type="url" />
</div>
</div>
</section>
</div>
    </div>
  );
}
