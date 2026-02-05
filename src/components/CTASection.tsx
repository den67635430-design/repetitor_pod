import React from 'react';
import { MessageCircle } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-24 px-6 lg:px-20 bg-gradient-to-r from-primary to-violet-500">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
          Готовы начать?
        </h2>
        <p className="text-xl text-white/80 mb-10 font-semibold">
          Присоединяйтесь к 2,450+ ученикам
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-primary px-8 py-4 rounded-full font-bold text-base hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg">
            🚀 Начать бесплатно
          </button>
          <button className="bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold text-base hover:bg-white/30 transition-all flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Открыть в Telegram
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
