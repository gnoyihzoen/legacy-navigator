// src/components/chat/Chatbot.tsx
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryAgent, ChatMessage } from "@/lib/agent";
import { cn } from "@/lib/utils";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [thinkingText, setThinkingText] = useState("Consulting Knowledge Base...");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hello. I am your Post-Life Administration Assistant. I can check CPF policies, funeral regulations, and administrative checklists for Singapore. How can I assist?",
      timestamp: new Date(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);

    try {
      const { response, tool } = await queryAgent(userMsg.content);
      
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: response,
        toolUsed: tool,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold text-sm">Bereavement Assistant</h3>
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Online
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary-foreground/20 text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  {/* Tool Badge (if agent used a tool) */}
                  {msg.toolUsed && (
                    <div className="mb-1 ml-1 flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border">
                      <Wrench className="h-3 w-3" />
                      <span>Used: {msg.toolUsed}</span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-white dark:bg-slate-800 border text-foreground rounded-bl-none"
                    )}
                  >
                    {/* Render newlines properly */}
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={cn(i > 0 && "mt-1", "leading-relaxed")}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
                          part.startsWith('**') && part.endsWith('**') 
                            ? <strong key={j}>{part.slice(2, -2)}</strong> 
                            : part
                        )}
                      </p>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              
              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex flex-col self-start items-start max-w-[85%] animate-pulse">
                    <div className="mb-1 ml-1 flex items-center gap-1 text-[10px] text-primary font-medium">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{thinkingText}</span> {/* Dynamic Text Here */}
                    </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border text-foreground rounded-bl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 bg-background border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about CPF, Funerals..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="focus-visible:ring-primary"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isThinking || !inputValue.trim()}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-transform duration-200"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </Button>
    </div>
  );
}