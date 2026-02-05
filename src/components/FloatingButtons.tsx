import React from 'react';
import { MessageCircle, Pencil } from 'lucide-react';

const FloatingButtons: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button className="bg-primary text-primary-foreground px-5 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-110 transition-all flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        Поддержка
      </button>
      <button className="bg-card border border-border text-foreground px-5 py-3 rounded-full font-bold text-sm shadow-lg hover:border-primary transition-all flex items-center gap-2">
        <Pencil className="w-4 h-4" />
        Админ
      </button>
    </div>
  );
};

export default FloatingButtons;
