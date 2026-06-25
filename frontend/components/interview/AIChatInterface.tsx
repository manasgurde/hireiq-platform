"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { applicationsApi } from "@/lib/api";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
}

const INTERVIEW_QUESTIONS = [
  "Could you describe a time when you optimized a slow database query? What was your approach?",
  "Tell me about a time you had to deal with a difficult stakeholder who disagreed with your technical design.",
  "How do you ensure your code is maintainable and testable in a fast-paced environment?",
];

interface AIChatInterfaceProps {
  applicationId: string;
  onScoreUpdated: (score: number) => void;
  onComplete: () => void;
}

export default function AIChatInterface({ applicationId, onScoreUpdated, onComplete }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg-0", sender: "ai", text: `Welcome to the mock interview! I'll be asking you 3 behavioral and technical questions based on your resume. Let's get started. \n\n**Question 1:** ${INTERVIEW_QUESTIONS[0]}` }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || currentQuestionIdx >= INTERVIEW_QUESTIONS.length) return;

    const userText = inputValue;
    setInputValue("");
    
    // Add user message
    setMessages(prev => [...prev, { id: `msg-u-${Date.now()}`, sender: "user", text: userText }]);
    setIsTyping(true);

    try {
      // Evaluate answer via Core API -> AI Microservice
      const res = await applicationsApi.evaluateAnswer(
        applicationId,
        userText,
        "I analyze the execution plan, add missing indexes, rewrite the query to avoid N+1 problems, and cache the results."
      );

      if (res.data) {
        onScoreUpdated(res.data.semantic_score); // Update parent UI with live score
      }
    } catch (err) {
      console.error("Evaluation failed", err);
    }

    // Simulate AI thinking delay
    setTimeout(() => {
      setIsTyping(false);
      
      if (currentQuestionIdx + 1 < INTERVIEW_QUESTIONS.length) {
        // Next question
        setMessages(prev => [...prev, { 
          id: `msg-a-${Date.now()}`, 
          sender: "ai", 
          text: `Great response. Now for **Question ${currentQuestionIdx + 2}:**\n\n${INTERVIEW_QUESTIONS[currentQuestionIdx + 1]}` 
        }]);
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        // Finished
        setMessages(prev => [...prev, { 
          id: `msg-a-${Date.now()}`, 
          sender: "ai", 
          text: `Thank you! That concludes our mock interview. The recruiter will be notified of your completion and semantic scores.` 
        }]);
        setCurrentQuestionIdx(currentQuestionIdx + 1);
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.sender === "user" ? "bg-indigo-500" : "bg-slate-700 border border-cyan-500/50"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-cyan-300" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm ${
                msg.sender === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
              }`}>
                {/* Simple markdown bold renderer for the questions */}
                {msg.text.split("**").map((chunk, i) => (
                  i % 2 === 1 ? <strong key={i} className={msg.sender === "ai" ? "text-cyan-300" : ""}>{chunk}</strong> : chunk
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 border border-cyan-500/50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping || currentQuestionIdx >= INTERVIEW_QUESTIONS.length}
            placeholder="Type your answer here..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping || currentQuestionIdx >= INTERVIEW_QUESTIONS.length}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 h-auto"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
