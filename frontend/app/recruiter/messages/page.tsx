"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Search, Plus, Send, Phone, Video, MoreVertical, Paperclip, Sparkles } from "lucide-react";

export default function RecruiterMessagesPage() {
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
      sender: "recruiter",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden bg-[#f9f9ff]">
      {/* Left Sidebar: Conversations */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" 
              placeholder="Search candidates..." 
              type="text"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 bg-blue-50 cursor-pointer transition-colors relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  SJ
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">Sarah Jenkins</h4>
                  <p className="text-xs text-slate-500 font-medium">94% AI Match</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">2m</span>
            </div>
            <p className="text-sm text-slate-600 truncate pr-4 mt-2">I'm available next Tuesday at 10 AM EST for the technical screen.</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white relative">
        <header className="h-16 px-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
              SJ
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 leading-tight">Sarah Jenkins</h2>
              <p className="text-xs text-slate-500">Senior Frontend Engineer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-50">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-50">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-50">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* AI Summary Banner */}
        <div className="p-4 border-b border-slate-200 bg-teal-50 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">AI Conversation Summary</h4>
              <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                <li>Candidate is highly interested in the hybrid work policy.</li>
                <li>Has confirmed availability for technical screen next Tuesday at 10 AM EST.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex justify-center my-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Today</span>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "recruiter" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end gap-2 max-w-[70%] ${msg.sender === "recruiter" ? "flex-row-reverse" : ""}`}>
                {msg.sender === "candidate" && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mb-1">
                    SJ
                  </div>
                )}
                <div className={
                  msg.sender === "recruiter" 
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm"
                    : "bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"
                }>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block mt-1 text-[10px] ${msg.sender === "recruiter" ? "text-blue-100 text-right" : "text-slate-500 text-right"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-semibold bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              Draft Reply with AI
            </button>
          </div>
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
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
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm p-2 outline-none" 
              placeholder="Type a message..." 
              rows={2}
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 mb-1 mr-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
