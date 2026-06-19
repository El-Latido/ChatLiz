import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { Message } from "../types";
import { Send, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { cn } from "./GlobalChat";

// Basic session storage for demo purposes
const privateSessions: Record<string, Message[]> = {};

export default function PrivateChat({ currentUser, targetUser, onBack, activeUsers }: { currentUser: string; targetUser: string; onBack: () => void; activeUsers: string[] }) {
  const [messages, setMessages] = useState<Message[]>(privateSessions[targetUser] || []);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    privateSessions[targetUser] = messages;
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleReceive = (msg: Message, from: string) => {
      if (from === targetUser || from === currentUser) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on("receive_private", handleReceive);
    return () => {
      socket.off("receive_private", handleReceive);
    };
  }, [targetUser, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), sender: currentUser, text: input };
    
    socket.emit("send_private", newMsg, targetUser, (res: any) => {
      if (res.success) {
        setMessages(prev => [...prev, newMsg]);
        setInput("");
      } else {
        alert(res.error);
      }
    });
  };

  const isOnline = activeUsers.includes(targetUser);

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-sans relative">
      <header className="h-[70px] bg-transparent border-b border-[#222] px-[30px] flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-[#666] hover:text-white transition flex items-center gap-2 uppercase font-bold tracking-widest text-[10px]">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:block">VOLVER</span>
        </button>
        <div className="flex-1 text-center sm:text-left flex items-center gap-3">
          <span className="font-black text-[18px] tracking-[1px] uppercase">{targetUser}</span>
          <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-[#444]")}></span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-[30px] flex flex-col gap-5" style={{ backgroundImage: 'radial-gradient(circle at top right, #1a1a2e 0%, #050505 50%)' }}>
        {messages.map((m, idx) => {
          const isMe = m.sender === currentUser;
          return (
            <div key={m.id || idx} className={cn("flex flex-col max-w-[70%]", isMe ? "ml-auto items-end" : "items-start")}>
              <div className={cn("px-[18px] py-[12px] text-[14px] leading-relaxed", isMe ? "bg-indigo-600 rounded-[18px] rounded-br-[2px]" : "bg-[#1a1a20] rounded-[18px] rounded-bl-[2px]")}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="pb-2" />
      </div>

      <footer className="h-[90px] bg-[#0f0f12] border-t border-[#222] flex items-center px-[30px] gap-5">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={`Escribe un mensaje a ${targetUser}...`}
          className="flex-1 bg-[#1a1a20] border-none rounded-xl px-5 py-[15px] outline-none text-white text-sm"
        />
        <div className="flex items-center gap-[15px]">
          <button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex justify-center items-center hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </footer>
    </div>
  );
}
