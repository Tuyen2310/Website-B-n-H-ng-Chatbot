"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { catalogApi } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Message {
  role: "user" | "bot";
  content: string;
  suggestions?: string[];
}

const MarkdownText = ({ text }: { text: string }) => {
  // Detect images: ![alt](url)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  
  // Split the text by images first
  const sections = text.split(imageRegex);
  // sections will look like: [textBefore, alt, url, textAfter, alt, url, ...]

  const renderContent = (content: string) => {
    const lines = content.split('\n').filter((line, i, arr) => line.trim() !== '' || (i > 0 && arr[i-1].trim() !== ''));
    
    return (
      <div className="flex flex-col gap-3">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2" />;

          const isBullet = /^[*-]\s/.test(line.trim());
          const cleanLine = isBullet ? line.trim().substring(2) : line;
          
          const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
          
          return (
            <div key={idx} className={`relative ${isBullet ? 'pl-6' : ''}`}>
              {isBullet && (
                <span className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-[#0044CC] shadow-[0_0_8px_rgba(0,68,204,0.4)]" />
              )}
              <div className="min-h-[1.5em] leading-relaxed">
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-black text-[#041B3C] border-b-2 border-[#0044CC]/20">{part.slice(2, -2)}</strong>;
                  }
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={i} className="italic text-gray-500 font-medium">{part.slice(1, -1)}</em>;
                  }
                  if (part.startsWith('[') && part.includes('](')) {
                      const linkText = part.match(/\[(.*?)\]/)?.[1] || "";
                      const linkUrl = part.match(/\((.*?)\)/)?.[1] || "#";
                      
                      const isActionLink = linkText.toLowerCase().includes("xem chi tiết") || linkText.toLowerCase().includes("mua") || linkText.toLowerCase().includes("ngay");
                      
                      if (isActionLink) {
                        return (
                          <div key={i} className="mt-3 mb-2">
                            <a href={linkUrl} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#003399] to-[#0066FF] text-white text-sm font-bold rounded-[1rem] shadow-lg shadow-[#0044CC]/20 hover:shadow-xl hover:-translate-y-0.5 hover:from-[#002277] hover:to-[#0044CC] transition-all w-full text-center group/btn">
                              {linkText} <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                            </a>
                          </div>
                        );
                      }
                      
                      return <a key={i} href={linkUrl} className="text-[#0044CC] font-bold underline hover:text-[#041B3C] transition-colors">{linkText}</a>;
                  }
                  return part;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const elements = [];
  for (let i = 0; i < sections.length; i += 3) {
    // Add text section
    if (sections[i]) {
      elements.push(<div key={`text-${i}`}>{renderContent(sections[i])}</div>);
    }
    // Add image section if exists
    if (sections[i + 1] && sections[i + 2]) {
      elements.push(
        <div key={`img-${i}`} className="my-3 rounded-2xl overflow-hidden border-2 border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white p-1.5 group/img">
          <div className="rounded-xl overflow-hidden relative bg-gray-50 aspect-square sm:aspect-video flex items-center justify-center">
            <img src={sections[i + 2]} alt={sections[i + 1]} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041B3C]/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-white text-xs font-bold leading-tight drop-shadow-md line-clamp-2">{sections[i + 1]}</span>
            </div>
          </div>
        </div>
      );
    }
  }

  return <div className="space-y-4">{elements}</div>;
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      content: "Chào bạn! Tôi là trợ lý mua sắm AI của **CommercePro**. Tôi có thể giúp gì cho bạn hôm nay?",
      suggestions: []
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: faqs } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: () => catalogApi.getFaqs(),
  });

  useEffect(() => {
    if (faqs && faqs.length > 0 && messages.length === 1 && (!messages[0].suggestions || messages[0].suggestions.length === 0)) {
      setMessages([{
        ...messages[0],
        suggestions: faqs.slice(0, 6).map((f: any) => f.question)
      }]);
    }
  }, [faqs, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (msg: string) => catalogApi.sendMessage(msg),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: "bot", content: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ." }]);
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    mutation.mutate(userMsg);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {isOpen ? (
        <Card className="w-[90vw] sm:w-[400px] h-[80vh] max-h-[600px] shadow-[0_20px_60px_-15px_rgba(0,68,204,0.4)] flex flex-col border border-white/40 rounded-[2rem] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 bg-[#F9F9FF] backdrop-blur-xl">
          <CardHeader className="bg-[#041B3C] text-white p-6 flex flex-row items-center justify-between relative overflow-hidden shrink-0 border-none">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0044CC]/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <CardTitle className="text-xl font-black flex items-center gap-4 relative z-10 uppercase tracking-tighter">
              <div className="h-12 w-12 bg-[#0044CC] rounded-xl flex items-center justify-center shadow-xl shadow-[#0044CC]/40">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-lg">CommercePro</span>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse"></span>
                    <span className="text-[8px] font-black text-gray-400 tracking-[0.2em]">ASSISTANT ONLINE</span>
                </div>
              </div>
            </CardTitle>
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/10 h-10 w-10 rounded-lg relative z-10 transition-all" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9FF] scrollbar-hide" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'bot' && (
                      <div className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-md mt-auto">
                        <Bot className="h-5 w-5 text-[#0044CC]" />
                      </div>
                    )}
                    <div className={`p-4 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-md transition-all ${
                      msg.role === 'user' 
                      ? 'bg-[#0044CC] text-white rounded-tr-none' 
                      : 'bg-white text-[#041B3C] rounded-tl-none border border-gray-100'
                    }`}>
                      <MarkdownText text={msg.content} />
                    </div>
                  </div>
                </div>
                {/* Suggestions / Quick Replies */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pl-[3.5rem]">
                    {msg.suggestions.map((reply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          // Hide suggestions after clicking to keep chat clean (like FB Messenger)
                          setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[i] = { ...newMsgs[i], suggestions: [] };
                            return [...newMsgs, { role: "user", content: reply }];
                          });
                          mutation.mutate(reply);
                        }}
                        disabled={mutation.isPending}
                        className="px-4 py-2.5 rounded-[1.5rem] bg-white border-2 border-[#0044CC]/10 text-[#0044CC] text-[13px] font-bold hover:bg-[#0044CC] hover:text-white hover:border-[#0044CC] transition-all shadow-sm active:scale-95"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="flex gap-4 max-w-[80%]">
                  <div className="h-11 w-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-md">
                    <Bot className="h-6 w-6 text-[#0044CC] animate-bounce" />
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-[2rem] rounded-tl-none flex gap-2 shadow-md items-center">
                    <span className="w-2 h-2 bg-[#0044CC] rounded-full animate-bounce [animation-duration:0.8s]"></span>
                    <span className="w-2 h-2 bg-[#0044CC] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-[#0044CC] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-4">

            <form 
              onSubmit={handleSend} 
              className="flex w-full gap-3 bg-[#F9F9FF] p-2 rounded-[1.5rem] border border-gray-100 focus-within:border-[#0044CC]/30 focus-within:bg-white transition-all shadow-sm"
            >
              <Input
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none font-semibold text-[#041B3C] placeholder:text-gray-400 h-10 px-4"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 rounded-xl shadow-lg shadow-[#0044CC]/20 shrink-0 bg-[#0044CC] hover:bg-[#041B3C] transition-all hover:scale-105 active:scale-95" 
                disabled={mutation.isPending || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                <Sparkles className="h-4 w-4 text-[#0044CC]" /> COMMERCEPRO AI 2026
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Button 
            size="icon" 
            className="h-24 w-24 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,68,204,0.4)] bg-[#0044CC] hover:bg-[#041B3C] text-white transition-all hover:scale-110 group" 
            onClick={() => setIsOpen(true)}
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-[#0044CC] animate-ping opacity-20 group-hover:hidden"></div>
          <Bot className="h-12 w-12 relative z-10" />
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-600 border-[4px] border-white rounded-full z-20"></div>
        </Button>
      )}

    </div>
  );
}
