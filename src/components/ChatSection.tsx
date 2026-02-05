import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Message, Subject } from "../types";
import { getTutorResponse } from "../aiService";

const ChatSection: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const subjects: Subject[] = [
    { name: "Алгебра", icon: "➕" },
    { name: "Геометрия", icon: "📐" },
    { name: "Русский", icon: "📖" },
    { name: "Английский", icon: "🇬🇧" },
    { name: "Физика", icon: "⚡" },
    { name: "Химия", icon: "🧪" },
    { name: "Биология", icon: "🧬" },
    { name: "История", icon: "🏛️" },
    { name: "Литература", icon: "📚" },
    { name: "Французский", icon: "🇫🇷" },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { role: "user", text: inputText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await getTutorResponse([...messages, userMsg], selectedSubject || undefined);
      setMessages((prev) => [...prev, { role: "model", text: response, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="try" className="py-24 px-6 lg:px-20 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
            Попробуйте прямо сейчас!
          </h2>
          <p className="text-muted-foreground font-semibold">Задайте вопрос AI-репетитору. Без регистрации.</p>
        </div>

        <div className="bg-card rounded-[2rem] border border-border shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary to-violet-500 p-6 text-primary-foreground">
            <h3 className="font-bold text-lg mb-4">Выберите предмет:</h3>
            <div className="grid grid-cols-3 gap-3">
              {subjects.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedSubject(s.name)}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    selectedSubject === s.name
                      ? "bg-white text-primary shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="h-[350px] overflow-y-auto p-6 space-y-4 custom-scrollbar bg-card">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground font-semibold">Выберите предмет и задайте вопрос! 👆</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary text-foreground rounded-tl-sm"
                  } font-semibold text-sm leading-relaxed whitespace-pre-wrap`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary p-4 rounded-2xl rounded-tl-sm flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border bg-card">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Задайте вопрос..."
                className="flex-1 bg-secondary border border-border rounded-xl py-4 px-5 font-semibold text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isTyping || !inputText.trim()}
                className="px-8 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                Отправить <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
