import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full bg-card/95 backdrop-blur-md z-50 border-b border-border px-6 lg:px-20 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">👋📚</span>
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
  );
};

export default Navigation;
