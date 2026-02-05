import React from 'react';
import { MessageCircle } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-24 px-6 lg:px-20 purple-gradient-bg">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-primary-foreground mb-4 italic">
          Готовы начать?
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-10">
          Присоединяйтесь к 2,450+ ученикам
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="btn-white-shimmer text-primary px-10 py-5 rounded-full font-black text-lg flex items-center justify-center gap-3">
            <span>🚀</span>
            Начать бесплатно
          </button>
          <button className="btn-dark-shimmer text-primary-foreground px-10 py-5 rounded-full font-black text-lg flex items-center justify-center gap-3">
            <MessageCircle className="w-5 h-5" />
            Открыть в Telegram
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
