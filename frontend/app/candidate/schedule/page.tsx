export default function Page() {
  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
      <div className="md:col-span-4 flex flex-col gap-6">

<div className="mb-2">
<h1 className="font-h2 text-h2 text-on-surface mb-1 hidden md:block">Hi Sarah,</h1>
<h1 className="font-h1-mobile text-h1-mobile text-on-surface mb-1 md:hidden">Hi Sarah,</h1>
<p className="font-body-base text-body-base text-on-surface-variant">Please select a time for your Technical Interview.</p>
</div>

<div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden group">
<div className="absolute inset-0 bg-gradient-to-br from-tertiary-fixed/10 to-transparent opacity-50"></div>
<div className="relative z-10">
<div className="flex items-center gap-1 mb-4 text-tertiary-container">
<span className="material-symbols-outlined text-[18px]" data-weight="fill">auto_awesome</span>
<span className="font-body-sm text-body-sm font-semibold uppercase tracking-wider">AI Match Insights</span>
</div>
<div className="flex items-center gap-4 mb-4">

<div className="w-14 h-14 rounded-full border-4 border-surface-container-highest flex items-center justify-center relative">
<svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
<path className="text-tertiary-fixed stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="88, 100" strokeWidth="4"></path>
</svg>
<span className="font-h3 text-h3 text-tertiary-container relative z-10">92%</span>
</div>
<div>
<div className="font-h3 text-h3 text-on-surface">Senior Frontend Dev</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">Acme Corp</div>
</div>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        Your technical background heavily aligns with the core requirements for this role. The team is looking forward to discussing your recent projects.
                    </p>
</div>
</div>

<div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
<h3 className="font-body-base text-body-base font-semibold text-on-surface mb-4">Interview Details</h3>
<div className="flex items-center gap-4 mb-6 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Professional headshot of a diverse female engineering manager in a modern tech office setting. Bright, natural lighting, wearing a smart casual dark blue blazer. Corporate modern aesthetic, engaging and welcoming smile, shallow depth of field with blurred office background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgyWSaXj5VmpfOI8WZ-KJpO4dFrw3QHABpM6zXbrCgcAUI7HGQQtXwIS-AWLCfX9rrjhQ0Jgyf3GX05CSxrOcRQF6WFVTLNwbbHrRUrkTRRi8vFfkwRDHXV_zL7N3e5z5xex4rsDzRLCWNk7d2bGAGe9x8SCsTDBc6c7uxdtcyLJyAuPbuuf6WyHNZCJLd-XVzanT63I_5W47wx9kezLqLs_srTdp2Cv8FVO1NtBwmli72MchHF6jyv8WWaGBqJEsbePwAprMWPKM"/>
<div>
<div className="font-body-base text-body-base font-medium text-on-surface">Alex Rivera</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">VP of Engineering</div>
</div>
</div>
<div className="flex flex-col gap-2">
<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[20px]">schedule</span>
<span>45 Minutes Technical Screen</span>
</div>
<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[20px]">videocam</span>
<span>Google Meet (Link provided upon confirmation)</span>
</div>
</div>
</div>
</div>

<div className="md:col-span-8 flex flex-col h-full">
<div className="bg-surface rounded-xl border border-outline-variant p-6 md:p-12 shadow-sm flex flex-col h-full">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-outline-variant">
<h2 className="font-h3 text-h3 text-on-surface">Select a Date &amp; Time</h2>
<div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2">
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">public</span>
<select className="bg-transparent border-none text-body-sm font-body-sm text-on-surface focus:ring-0 cursor-pointer p-0 w-full outline-none">
<option value="PT">Pacific Time (PT) - 10:42 AM</option>
<option value="ET">Eastern Time (ET) - 01:42 PM</option>
<option value="CET">Central European Time (CET) - 07:42 PM</option>
</select>
</div>
</div>

<div className="mb-8">
<div className="flex items-center justify-between mb-4">
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<h3 className="font-body-base text-body-base font-semibold text-on-surface">October 2023</h3>
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
<div className="grid grid-cols-5 gap-2 md:gap-4">

<button className="flex flex-col items-center justify-center py-4 rounded-xl border border-surface-variant bg-surface-bright opacity-50 cursor-not-allowed">
<span className="font-body-sm text-body-sm text-on-surface-variant">Mon</span>
<span className="font-h3 text-h3 text-on-surface-variant mt-1">16</span>
</button>

<button className="flex flex-col items-center justify-center py-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-container-low transition-colors group">
<span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Tue</span>
<span className="font-h3 text-h3 text-on-surface mt-1 group-hover:text-primary transition-colors">17</span>
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container mt-2"></span>
</button>

<button className="flex flex-col items-center justify-center py-4 rounded-xl border-2 border-primary bg-primary-container shadow-sm relative">
<span className="font-body-sm text-body-sm text-on-primary-container font-medium">Wed</span>
<span className="font-h3 text-h3 text-on-primary-container font-bold mt-1">18</span>
<span className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary-fixed rounded-full border-2 border-surface"></span>
</button>

<button className="flex flex-col items-center justify-center py-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-container-low transition-colors group">
<span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Thu</span>
<span className="font-h3 text-h3 text-on-surface mt-1 group-hover:text-primary transition-colors">19</span>
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container mt-2"></span>
</button>

<button className="flex flex-col items-center justify-center py-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-container-low transition-colors group">
<span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">Fri</span>
<span className="font-h3 text-h3 text-on-surface mt-1 group-hover:text-primary transition-colors">20</span>
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container mt-2"></span>
</button>
</div>
</div>

<div className="flex-grow">
<h3 className="font-body-base text-body-base font-medium text-on-surface mb-4">Available Slots on Wednesday, Oct 18</h3>
<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
<button className="py-4 px-6 rounded-lg border border-outline-variant font-body-base text-body-base text-on-surface hover:border-primary hover:bg-surface-container transition-colors text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
                            09:00 AM
                        </button>

<button className="py-4 px-6 rounded-lg border-2 border-primary bg-primary text-on-primary font-body-base text-body-base font-semibold shadow-md text-center transition-transform hover:scale-[1.02] flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[18px]">check_circle</span>
                            10:30 AM
                        </button>
<button className="py-4 px-6 rounded-lg border border-outline-variant font-body-base text-body-base text-on-surface hover:border-primary hover:bg-surface-container transition-colors text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
                            01:00 PM
                        </button>
<button className="py-4 px-6 rounded-lg border border-outline-variant font-body-base text-body-base text-on-surface hover:border-primary hover:bg-surface-container transition-colors text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
                            02:30 PM
                        </button>
<button className="py-4 px-6 rounded-lg border border-outline-variant font-body-base text-body-base text-on-surface hover:border-primary hover:bg-surface-container transition-colors text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
                            04:00 PM
                        </button>
</div>
</div>

<div className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
<div className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">info</span>
                        Selecting 10:30 AM PT on Wed, Oct 18
                    </div>
<button className="w-full sm:w-auto bg-primary text-on-primary font-body-base text-body-base font-medium py-4 px-12 rounded-lg shadow-sm hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-all flex items-center justify-center gap-2 active:scale-95">
                        Confirm Time
                        <span className="material-symbols-outlined text-[20px]">event_available</span>
</button>
</div>
</div>
</div>
    </div>
  );
}
