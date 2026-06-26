"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function Page() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "recruiter",
      text: "Hi Sarah, great connecting with you earlier! I wanted to follow up on our discussion about the Senior Frontend Engineer role. Are you still available next week for a technical screen with our engineering manager?",
      time: "9:45 AM"
    },
    {
      id: 2,
      sender: "candidate",
      text: "Hi! Yes, I'm definitely still interested. The hybrid policy sounds perfect for what I'm looking for.",
      time: "9:46 AM"
    },
    {
      id: 3,
      sender: "candidate",
      text: "I'm available next Tuesday at 10 AM EST for the technical screen.",
      time: "9:47 AM"
    }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: "recruiter", // We pretend to be the recruiter replying in this UI demo
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col md:flex-row">
      <nav className="w-full bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-12 h-16 max-w-full shrink-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-display-xl text-h3 font-extrabold text-primary">HireIQ</span>
          <div className="hidden md:flex gap-6 h-full items-center">
            <Link href="/candidate/dashboard" className="text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer active:opacity-80 transition-opacity">Dashboard</Link>
            <Link href="/jobs" className="text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer active:opacity-80 transition-opacity">Jobs</Link>
            <Link href="/candidate/applications" className="text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer active:opacity-80 transition-opacity">Candidates</Link>
            <span className="text-primary border-b-2 border-primary font-bold pb-1 cursor-pointer active:opacity-80 transition-opacity">Messages</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block">
            <input className="bg-surface-container-low border border-outline-variant rounded-full py-1 pl-10 pr-4 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary w-64" placeholder="Search..." type="text"/>
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "18px" }}>search</span>
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center overflow-hidden border border-outline-variant">
            {user?.full_name?.charAt(0) || "U"}
          </div>
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="h-full w-64 flex flex-col border-r border-outline-variant bg-surface-container-low py-6 px-4 gap-2 shrink-0">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-on-primary font-bold text-caption">H</div>
              <span className="font-h3 text-body-base font-bold text-primary">Recruitment Chat</span>
            </div>
            <span className="font-body-sm text-caption text-on-surface-variant">AI-Powered Messaging</span>
          </div>
          <button className="bg-primary text-on-primary hover:bg-surface-tint rounded-lg py-2 px-4 flex items-center justify-center gap-2 font-semibold transition-colors mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit_square</span>
            New Message
          </button>
          <nav className="flex flex-col gap-1 flex-1">
            <a className="flex items-center gap-4 px-4 py-2 bg-primary-container text-on-primary-container font-semibold rounded-lg active:scale-95 duration-150" href="#">
              <span className="material-symbols-outlined">inbox</span>
              <span>Inbox</span>
            </a>
          </nav>
        </aside>

        <main className="flex-1 flex overflow-hidden bg-background">
          <div className="w-80 border-r border-outline-variant flex flex-col bg-surface-bright shrink-0">
            <div className="p-6 border-b border-outline-variant">
              <div className="relative">
                <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search candidates..." type="text"/>
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "18px" }}>search</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-outline-variant bg-surface-container-highest cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center border border-outline-variant shrink-0">
                      SJ
                    </div>
                    <div>
                      <h4 className="font-h3 text-body-base font-semibold text-on-surface leading-tight">Sarah Jenkins</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-tertiary-container" data-weight="fill" style={{ fontSize: "14px" }}>verified</span>
                        <span className="font-body-sm text-caption text-tertiary-container font-medium">94% AI Match</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-body-sm text-caption text-on-surface-variant">2m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate pr-4">I'm available next Tuesday at 10 AM EST for the technical screen.</p>
                <div className="mt-2 flex">
                  <span className="inline-block px-2 py-1 bg-primary-fixed text-on-primary-fixed font-body-sm text-caption rounded-full">Interview Scheduled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-surface relative">
            <div className="h-16 px-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center border border-outline-variant shrink-0">
                  SJ
                </div>
                <div>
                  <h2 className="font-h3 text-h3 font-semibold text-on-surface leading-tight">Sarah Jenkins</h2>
                  <p className="font-body-sm text-caption text-on-surface-variant">Senior Frontend Engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
                  <span className="material-symbols-outlined">call</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#1E40AF 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-h3 text-body-sm font-semibold text-on-surface mb-1">AI Conversation Summary</h4>
                  <ul className="font-body-sm text-body-sm text-on-surface-variant list-disc list-inside space-y-1">
                    <li>Candidate is highly interested in the hybrid work policy.</li>
                    <li>Salary expectations align with the provided range ($130k-$150k).</li>
                    <li>Has confirmed availability for technical screen next Tuesday at 10 AM EST.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-4">
              <div className="flex justify-center my-2">
                <span className="font-body-sm text-caption text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">Today</span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "recruiter" ? "justify-end" : "justify-start"} mb-2`}>
                  <div className={`flex items-end gap-2 max-w-[70%] ${msg.sender === "recruiter" ? "flex-row-reverse" : ""}`}>
                    {msg.sender === "candidate" && (
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center shrink-0 mb-1">
                        SJ
                      </div>
                    )}
                    <div className={
                      msg.sender === "recruiter" 
                        ? "bg-primary text-on-primary rounded-2xl rounded-tr-sm px-6 py-4 shadow-sm"
                        : "bg-surface-container-high text-on-surface rounded-2xl rounded-tl-sm px-6 py-4 border border-outline-variant shadow-sm"
                    }>
                      <p className="font-body-base text-body-base whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block mt-1 font-body-sm text-[10px] ${msg.sender === "recruiter" ? "text-on-primary/70 text-right" : "text-on-surface-variant text-right"}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-surface-bright border-t border-outline-variant shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <button className="flex items-center gap-1 text-primary hover:text-surface-tint font-body-sm text-caption font-medium transition-colors bg-primary-fixed px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>auto_awesome</span>
                  Draft Reply with AI
                </button>
              </div>
              <div className="flex items-end gap-2 bg-surface-container-low border border-outline-variant rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors shrink-0">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none font-body-base text-body-base p-2 custom-scrollbar" 
                  placeholder="Type a message..." 
                  rows={2}
                />
                <button 
                  onClick={handleSend}
                  className="p-2 bg-primary text-on-primary rounded-lg hover:bg-surface-tint transition-colors shrink-0 mb-1 mr-1"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
