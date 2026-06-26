export default function Page() {
  return (
    <div className="flex-1 p-4 md:p-12 xl:p-16 overflow-y-auto bg-surface">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h1 className="font-h1 text-h1 md:text-[36px] font-bold text-on-surface mb-1">Application History</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Track and manage your journey across all job applications.</p>
</div>
<div className="flex gap-4">
<button className="px-6 py-2 bg-surface-container border border-outline-variant rounded-lg font-body-sm text-body-sm font-semibold text-on-surface flex items-center gap-2 hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-[18px]">download</span>
                        Export
                    </button>
</div>
</div>

<div className="glass-panel rounded-xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm border border-outline-variant/50">
<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
<div className="relative flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Search company or role..." type="text"/>
</div>
<div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
<button className="px-4 py-1.5 bg-primary-container text-on-primary-container rounded-full font-body-sm text-body-sm whitespace-nowrap border border-primary/20">All Applications</button>
<button className="px-4 py-1.5 bg-surface text-on-surface-variant hover:bg-surface-variant rounded-full font-body-sm text-body-sm whitespace-nowrap border border-outline-variant transition-colors">Active</button>
<button className="px-4 py-1.5 bg-surface text-on-surface-variant hover:bg-surface-variant rounded-full font-body-sm text-body-sm whitespace-nowrap border border-outline-variant transition-colors">Interviewing</button>
<button className="px-4 py-1.5 bg-surface text-on-surface-variant hover:bg-surface-variant rounded-full font-body-sm text-body-sm whitespace-nowrap border border-outline-variant transition-colors">Offers</button>
</div>
</div>
<div className="flex items-center gap-4 w-full md:w-auto justify-end">
<span className="font-body-sm text-body-sm text-on-surface-variant">Sort by:</span>
<select className="bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary">
<option>Most Recent</option>
<option>Status Update</option>
<option>Match Score</option>
</select>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">

<div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-md border border-outline-variant/30 flex items-center justify-center bg-surface p-1 shadow-sm">
<img alt="TechNova Logo" className="w-full h-full object-contain" data-alt="A clean, minimalist vector logo of a modern tech company, utilizing geometric shapes and a vibrant blue and teal color palette on a white background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0tPVM701xn4of8YtE5aVzImJahSk8Pix5Os75t_JK0063LDUPhW2Rd5oPov4A7kriKmudWaUtMd_h9SiORBAEyLHOq_kEZEtKz1DgJYweCrfTOnsIBpECzK6YCNhzRg_z7w9nNFwaOpVejdS81SSCDFuQ-VjVi1p-iZ1G1WxtWsqVxHLBo4O269cVNQo6r43U8uWIzGlNmEBVuj6Y_JsDK-nceNmD8gjUxlr9up-vjzjTtWAHjW7u2KGfsVTph3ZfTHINa3Lj3iw"/>
</div>
<div>
<h3 className="font-h3 text-h3 font-semibold text-on-surface leading-tight mb-1">Senior Frontend Developer</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">TechNova Systems • San Francisco, CA</p>
</div>
</div>
</div>
<div className="flex items-center gap-4 mb-6">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FEF08A] text-[#854D0E] font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[14px]">videocam</span>
                            Interviewing
                        </span>
<span className="font-caption text-caption text-outline">Applied: Oct 10, 2023</span>
</div>
<div className="grid grid-cols-12 gap-4 mb-6 flex-1">

<div className="col-span-8 flex flex-col justify-center">
<div className="flex justify-between mb-2 px-2">
<span className="font-caption text-caption text-primary font-medium">Applied</span>
<span className="font-caption text-caption text-primary font-medium">Screen</span>
<span className="font-caption text-caption text-[#854D0E] font-medium">Technical</span>
<span className="font-caption text-caption text-outline">Offer</span>
</div>
<div className="relative flex items-center justify-between w-full px-4">
<div className="absolute left-4 right-4 h-1 bg-surface-container-high rounded-full -z-10"></div>
<div className="absolute left-4 w-[66%] h-1 bg-primary rounded-full -z-10"></div>
<div className="w-3 h-3 bg-primary rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-3 h-3 bg-primary rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-4 h-4 bg-[#FEF08A] border-2 border-[#854D0E] rounded-full shadow-sm ring-4 ring-surface-container-lowest flex items-center justify-center animate-pulse"></div>
<div className="w-3 h-3 bg-surface-container-high border border-outline-variant rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
</div>
</div>

<div className="col-span-4 flex items-center justify-end">
<div className="relative w-14 h-14 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
<path className="text-[#0F766E]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="94, 100" strokeLinecap="round" strokeWidth="3"></path>
</svg>
<div className="absolute flex flex-col items-center justify-center">
<span className="font-h3 text-h3 text-on-surface font-bold leading-none">94</span>
<span className="font-[Inter] text-[8px] text-on-surface-variant font-medium uppercase tracking-wider mt-px">Match</span>
</div>
</div>
</div>
</div>
<div className="mt-auto border-t border-outline-variant/30 pt-4 flex justify-between items-center bg-surface-container-lowest rounded-b-lg">
<div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
<span className="font-medium text-on-surface">Tech Interview</span> scheduled Oct 24
                        </div>
<button className="text-primary font-body-sm text-body-sm font-semibold hover:text-primary-container transition-colors flex items-center gap-1">
                            View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-md border border-outline-variant/30 flex items-center justify-center bg-surface p-1 shadow-sm">
<img alt="FinData Logo" className="w-full h-full object-contain" data-alt="A bold, modern abstract logo representing a finance or data company, using deep navy blues and sharp geometric angles, set against a pristine white background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLbSrToc2xJYsVuYbqd4fuiYNOasORNelIyr0CZriU2depW72UerXzeLOERODrNPmz3-gTNEhqzhiSXvIodPUJZXEqyqXesreZgHxNYhmLWiBUKmXegzF_DYrjvqt1-odAhWMM2B9GiqLAgwbdlBbud3bal_zq5RwuOOIkQi-YTxTNvdhna-lDVxut7wKDdrz0YIvMrdFlEJ_CcF3MMKMKWtCGgCk9zS8eEjx9lL_lutNgyQic62a04ebWdwP3aDbSUSqYqgOR1qs"/>
</div>
<div>
<h3 className="font-h3 text-h3 font-semibold text-on-surface leading-tight mb-1">Data Platform Engineer</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">FinData Analytics • Remote</p>
</div>
</div>
</div>
<div className="flex items-center gap-4 mb-6">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-fixed text-primary font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[14px]">send</span>
                            Applied
                        </span>
<span className="font-caption text-caption text-outline">Applied: Oct 18, 2023</span>
</div>
<div className="grid grid-cols-12 gap-4 mb-6 flex-1">

<div className="col-span-8 flex flex-col justify-center">
<div className="flex justify-between mb-2 px-2">
<span className="font-caption text-caption text-primary font-medium">Applied</span>
<span className="font-caption text-caption text-outline">Screen</span>
<span className="font-caption text-caption text-outline">Technical</span>
<span className="font-caption text-caption text-outline">Offer</span>
</div>
<div className="relative flex items-center justify-between w-full px-4">
<div className="absolute left-4 right-4 h-1 bg-surface-container-high rounded-full -z-10"></div>
<div className="absolute left-4 w-[0%] h-1 bg-primary rounded-full -z-10"></div>
<div className="w-4 h-4 bg-primary-fixed border-2 border-primary rounded-full shadow-sm ring-4 ring-surface-container-lowest flex items-center justify-center"></div>
<div className="w-3 h-3 bg-surface-container-high border border-outline-variant rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-3 h-3 bg-surface-container-high border border-outline-variant rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-3 h-3 bg-surface-container-high border border-outline-variant rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
</div>
</div>

<div className="col-span-4 flex items-center justify-end">
<div className="relative w-14 h-14 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
<path className="text-[#0F766E]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="88, 100" strokeLinecap="round" strokeWidth="3"></path>
</svg>
<div className="absolute flex flex-col items-center justify-center">
<span className="font-h3 text-h3 text-on-surface font-bold leading-none">88</span>
<span className="font-[Inter] text-[8px] text-on-surface-variant font-medium uppercase tracking-wider mt-px">Match</span>
</div>
</div>
</div>
</div>
<div className="mt-auto border-t border-outline-variant/30 pt-4 flex justify-between items-center bg-surface-container-lowest rounded-b-lg">
<div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">schedule</span>
                            Application under review
                        </div>
<button className="text-primary font-body-sm text-body-sm font-semibold hover:text-primary-container transition-colors flex items-center gap-1">
                            View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-md border border-outline-variant/30 flex items-center justify-center bg-surface p-1 shadow-sm">
<img alt="EcoTech Logo" className="w-full h-full object-contain" data-alt="A clean, flat corporate logo featuring a stylized green leaf or eco-friendly motif, set against a pristine white background. High resolution, vector art style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5AYd064DX5PHr0zP4318kH-ctwOzk5ZuShqpVSbUwCXGb9dWeAv2-yGF5r6qi17dauGb_gLAzXzwolOi0xf-iDQLGnnNbHRE_xqn78QyNBVMQq2ME8eIbxPGkTwr0JydaMIGwS8GhJgxCgJ8qZR4rnRHRxv5foPzqE30_ZC9kZ8TL9kkHFamjedV3TmP33qEz7DlLjIVkj7vUUkFLV1DjYTRrg4-3ygKiIie61rvN3ZGytognir-gvUswOzn7OPdZCIqZRSQanE"/>
</div>
<div>
<h3 className="font-h3 text-h3 font-semibold text-on-surface leading-tight mb-1">UI/UX Product Designer</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">EcoTech Solutions • Seattle, WA</p>
</div>
</div>
</div>
<div className="flex items-center gap-4 mb-6">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#DCFCE7] text-[#166534] font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[14px]">task_alt</span>
                            Offer Received
                        </span>
<span className="font-caption text-caption text-outline">Applied: Sep 28, 2023</span>
</div>
<div className="grid grid-cols-12 gap-4 mb-6 flex-1">

<div className="col-span-8 flex flex-col justify-center">
<div className="flex justify-between mb-2 px-2">
<span className="font-caption text-caption text-[#166534] font-medium">Applied</span>
<span className="font-caption text-caption text-[#166534] font-medium">Screen</span>
<span className="font-caption text-caption text-[#166534] font-medium">Portfolio</span>
<span className="font-caption text-caption text-[#166534] font-bold">Offer</span>
</div>
<div className="relative flex items-center justify-between w-full px-4">
<div className="absolute left-4 right-4 h-1 bg-surface-container-high rounded-full -z-10"></div>
<div className="absolute left-4 w-[100%] h-1 bg-[#166534] rounded-full -z-10"></div>
<div className="w-3 h-3 bg-[#166534] rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-3 h-3 bg-[#166534] rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-3 h-3 bg-[#166534] rounded-full shadow-sm ring-4 ring-surface-container-lowest"></div>
<div className="w-4 h-4 bg-[#DCFCE7] border-2 border-[#166534] rounded-full shadow-sm ring-4 ring-surface-container-lowest flex items-center justify-center"></div>
</div>
</div>

<div className="col-span-4 flex items-center justify-end">
<div className="relative w-14 h-14 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
<path className="text-[#0F766E]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="98, 100" strokeLinecap="round" strokeWidth="3"></path>
</svg>
<div className="absolute flex flex-col items-center justify-center">
<span className="font-h3 text-h3 text-on-surface font-bold leading-none">98</span>
<span className="font-[Inter] text-[8px] text-on-surface-variant font-medium uppercase tracking-wider mt-px">Match</span>
</div>
</div>
</div>
</div>
<div className="mt-auto border-t border-outline-variant/30 pt-4 flex justify-between items-center bg-surface-container-lowest rounded-b-lg">
<div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-[#166534]">mail</span>
<span className="font-medium text-on-surface">Respond by Oct 26</span>
</div>
<button className="bg-primary text-on-primary px-3 py-1.5 rounded-md font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">
                            Review Offer
                        </button>
</div>
</div>
</div>
    </div>
  );
}
