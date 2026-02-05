import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Message, Subject } from '../types';
import { getTutorResponse } from '../geminiService';

const ChatSection: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const subjects: Subject[] = [
    { name: 'Математика', icon: '📐' },
    { name: 'Русский', icon: '📖' },
    { name: 'Английский', icon: '🇬🇧' },
    { name: 'Физика', icon: '⚡' },
    { name: 'Химия', icon: '🧪' },
    { name: 'Биология', icon: '🧬' },
    { name: 'История', icon: '🏛️' },
    { name: 'Литература', icon: '📚' },
    { name: 'Французский', icon: '🇫🇷' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { role: 'user', text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await getTutorResponse([...messages, userMsg], selectedSubject || undefined);
      setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="try" className="py-20 px-6 lg:px-20 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-foreground tracking-tight mb-2">
            Попробуйте прямо сейчас!
          </h2>
          <p className="text-muted-foreground">
            Задайте вопрос AI-репетитору. Без регистрации.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
          {/* Subject selector header with gradient */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-primary-foreground">
            <p className="font-bold mb-4">Выберите предмет:</p>
            <div className="grid grid-cols-3 gap-3">
              {subjects.map(s => (
                <button 
                  key={s.name}
                  onClick={() => setSelectedSubject(s.name)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    selectedSubject === s.name 
                    ? 'bg-card text-primary shadow-md' 
                    : 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                  }`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="h-[350px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-16">
                Выберите предмет и задайте вопрос! 👆
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  m.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-secondary text-foreground rounded-tl-none'
                } font-medium text-sm leading-relaxed whitespace-pre-wrap`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="p-6 border-t border-border flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Задайте вопрос..."
              className="flex-1 bg-secondary border-none rounded-xl py-4 px-5 font-medium text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              className="px-8 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              Отправить <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
