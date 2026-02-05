import React from 'react';
import { Star, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-6 lg:px-20 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Logo and review button */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🖐️📚</span>
            <span className="text-xl font-extrabold text-primary">Репетитор Под Рукой</span>
          </div>
          <p className="text-muted-foreground mb-6">Твой личный AI-учитель всегда с тобой</p>
          <button className="btn-shimmer text-primary-foreground px-8 py-3 rounded-full font-bold inline-flex items-center gap-2">
            <Star className="w-4 h-4" />
            Оставить отзыв
          </button>
        </div>
        
        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-black text-foreground mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#try" className="hover:text-primary transition-colors">Попробовать</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Тарифы</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Предметы</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-foreground mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">О нас</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Блог</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-foreground mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Поддержка 24/7</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-foreground mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                @kontentcod
              </li>
              <li>support@repetitor-pod-rukoy.ru</li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
          <p>© 2026 Репетитор Под Рукой. Все права защищены.</p>
          <p className="mt-2">Разработано <a href="#" className="text-primary hover:underline">@kontentcod</a></p>
        </div>
      </div>
      
      {/* Support button */}
      <button className="fixed bottom-6 right-6 btn-shimmer text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg">
        <MessageCircle className="w-4 h-4" />
        Поддержка
      </button>
    </footer>
  );
};

export default Footer;
