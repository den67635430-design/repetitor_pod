import React from 'react';
import { Check } from 'lucide-react';

const HeroSection: React.FC = () => {
  const features = [
    'Доступен в любое время',
    'По всем школьным предметам',
    'Голосовой и текстовый режим'
  ];

  return (
    <section className="pt-40 pb-24 px-6 lg:px-20 hero-gradient">
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
        <div className="space-y-10">
          <h1 className="text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">
            Репетитор <br />
            <span className="text-primary">Под Рукой</span>
          </h1>
          <p className="text-lg text-muted-foreground font-semibold max-w-md leading-relaxed">
            Твой личный AI-учитель всегда с тобой. Помощь с уроками 24/7, дешевле репетитора в 10 раз.
          </p>
          <div className="space-y-4">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-foreground font-semibold">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="text-success w-4 h-4 stroke-[3px]" />
                </div>
                {item}
              </div>
            ))}
          </div>
          <button 
            onClick={() => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-amber-400 hover:bg-amber-500 text-foreground border-0 px-8 py-4 rounded-full font-bold text-base transition-all flex items-center gap-3 shadow-lg"
          >
            <span className="text-xl">🎓</span>
            Попробовать бесплатно
          </button>
          <p className="text-sm text-muted-foreground">
            ✨ Первый месяц бесплатно в тестовом режиме · Без привязки карты
          </p>
        </div>
        
        {/* Chat Preview Card */}
        <div className="hidden lg:block relative">
          <div className="relative bg-card border border-border p-6 rounded-3xl shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl">😺</div>
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
                <div className="p-4 bg-secondary rounded-2xl rounded-tl-none text-sm font-semibold text-foreground">
                  Привет! Я помогу тебе с любым школьным предметом. Задавай вопросы! 😊
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground mb-1 block">Ты:</span>
                <div className="p-4 bg-primary text-primary-foreground rounded-2xl rounded-tr-none text-sm font-semibold">
                  Объясни теорему Пифагора
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground mb-1 block">AI-Репетитор:</span>
                <div className="p-4 bg-secondary rounded-2xl rounded-tl-none text-sm font-semibold text-foreground">
                  Отлично! Теорема Пифагора: a² + b² = c². Хочешь разобрать на примере? ✍️
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
