
import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Send, 
  Star, 
  ChevronRight, 
  MessageCircle,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { Message, Subject } from './types';
import { getTutorResponse } from './geminiService';

const App: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Привет! Я твой личный ИИ-репетитор. Выбери предмет и задавай любой вопрос по школьной программе! 😊", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const subjects: Subject[] = [
    { name: 'Математика', icon: '📐' },
    { name: 'Алгебра', icon: '🔢' },
    { name: 'Геометрия', icon: '📏' },
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-md z-50 border-b border-border px-6 lg:px-20 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖐️📚</span>
          <span className="text-xl font-extrabold text-primary tracking-tight">Репетитор Под Рукой</span>
        </div>
        <div className="hidden md:flex items-center gap-10 font-bold text-muted-foreground text-sm">
          <a href="#try" className="hover:text-primary transition-colors">Попробовать</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Тарифы</a>
        </div>
        <button className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
          Начать бесплатно
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 lg:px-20 hero-gradient">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <div className="space-y-10">
            <h1 className="text-6xl lg:text-7xl font-black text-foreground leading-[1.05] tracking-tight">
              Репетитор <br />
              <span className="text-primary">Под Рукой</span>
            </h1>
            <p className="text-xl text-muted-foreground font-semibold max-w-md leading-relaxed">
              Твой личный AI-учитель всегда с тобой. Помощь с уроками 24/7, дешевле репетитора в 10 раз.
            </p>
            <div className="space-y-5">
              {['Доступен в любое время', 'По всем школьным предметам', 'Голосовой и текстовый режим'].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-foreground font-bold">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="text-success w-4 h-4 stroke-[4px]" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
            <button 
              onClick={() => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-card text-primary border-2 border-primary px-10 py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-3"
            >
              <span className="text-xl">🎓</span>
              Попробовать бесплатно
            </button>
            <p className="text-sm text-muted-foreground">
              ✨ Первый месяц бесплатно в тестовом режиме · Без привязки карты
            </p>
          </div>
          <div className="hidden lg:block relative">
            <div className="relative bg-card border border-border p-6 rounded-3xl shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🎓</div>
                <div>
                  <h3 className="font-black text-foreground">AI-Репетитор</h3>
                  <span className="text-xs font-bold text-success flex items-center gap-1">
                    <span className="w-2 h-2 bg-success rounded-full"></span>
                    Онлайн
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground mb-1 block">AI-Репетитор:</span>
                  <div className="p-4 bg-secondary rounded-2xl rounded-tl-none text-sm font-bold text-foreground">
                    Привет! Я помогу тебе с любым школьным предметом. Задавай вопросы! 😊
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground mb-1 block">Ты:</span>
                  <div className="p-4 bg-primary text-primary-foreground rounded-2xl rounded-tr-none text-sm font-bold">
                    Объясни теорему Пифагора
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground mb-1 block">AI-Репетитор:</span>
                  <div className="p-4 bg-secondary rounded-2xl rounded-tl-none text-sm font-bold text-foreground">
                    Отлично! Теорема Пифагора: a² + b² = c². Хочешь разобрать на примере? ✍️
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Trial Section */}
      <section id="try" className="py-24 bg-secondary/50 px-6 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tight">Попробуй прямо сейчас</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {subjects.map(s => (
                <button 
                  key={s.name}
                  onClick={() => setSelectedSubject(s.name)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    selectedSubject === s.name 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-[2rem] border border-border shadow-2xl shadow-primary/10 h-[600px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">🎓</div>
                <div>
                  <h3 className="font-black text-foreground leading-none">Твой Репетитор</h3>
                  <span className="text-[10px] font-black text-success uppercase tracking-wider">Онлайн</span>
                </div>
              </div>
              {selectedSubject && <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{selectedSubject}</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-3xl ${
                    m.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-secondary text-foreground rounded-tl-none'
                  } font-bold text-sm leading-relaxed whitespace-pre-wrap`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary p-4 rounded-3xl rounded-tl-none flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-border">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Задай любой вопрос..."
                  className="w-full bg-secondary border-none rounded-2xl py-5 px-6 font-bold text-foreground focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputText.trim()}
                  className="absolute right-3 top-3 bottom-3 px-6 bg-primary text-primary-foreground rounded-xl font-black text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Export the App component as the default export.
export default App;
