import React from 'react';
import { Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Logo and CTA */}
      <div className="py-16 px-6 lg:px-20 text-center border-b border-border">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl">🖐️📚</span>
          <span className="text-2xl font-extrabold text-primary">Репетитор Под Рукой</span>
        </div>
        <p className="text-muted-foreground font-semibold mb-6">
          Твой личный AI-учитель всегда с тобой
        </p>
        <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:brightness-110 transition-all flex items-center justify-center gap-2 mx-auto">
          <Star className="w-5 h-5 fill-current" />
          Оставить отзыв
        </button>
      </div>

      {/* Links */}
      <div className="py-12 px-6 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-4">Продукт</h4>
            <ul className="space-y-3">
              <li><a href="#try" className="text-muted-foreground hover:text-primary transition-colors text-sm">Попробовать</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">Тарифы</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Предметы</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Компания</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">О нас</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Блог</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Поддержка</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Поддержка 24/7</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Политика конфиденциальности</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                💬 @kontentcod
              </a></li>
              <li><a href="mailto:support@repetitor-pod-rukoy.ru" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                support@repetitor-pod-rukoy.ru
              </a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-6 px-6 lg:px-20 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 Репетитор Под Рукой. Все права защищены.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Разработано <a href="#" className="text-primary hover:underline">@kontentcod</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
