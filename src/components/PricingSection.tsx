import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
  name: string;
  subtitle: string;
  price: number;
  discountPrice?: number;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: 'Дошкольники',
      subtitle: 'Для малышей 5-7 лет',
      price: 1490,
      discountPrice: 999,
      features: [
        'Игровое обучение',
        'Буквы, цифры, цвета',
        'Голосовой режим',
        'Родительский контроль'
      ],
      buttonText: 'Выбрать'
    },
    {
      name: 'Стандарт',
      subtitle: '1-11 класс',
      price: 1990,
      discountPrice: 1333,
      features: [
        '3 предмета на выбор',
        'Безлимитное время',
        'Голос + текст',
        'Родительский контроль',
        'Проверка домашки'
      ],
      popular: true,
      buttonText: 'Начать бесплатно'
    },
    {
      name: 'Премиум',
      subtitle: 'Всё включено',
      price: 2990,
      discountPrice: 2003,
      features: [
        'ВСЕ предметы',
        'Безлимит',
        'Все функции',
        'Приоритетная поддержка',
        'Подготовка к ЕГЭ/ОГЭ'
      ],
      buttonText: 'Выбрать'
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6 lg:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
            Сколько это стоит?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Дешевле репетитора от 3 месяцев
          </p>
          
          {/* Toggle */}
          <div className="inline-flex items-center bg-secondary rounded-full p-1 gap-1">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                !isAnnual ? 'btn-shimmer text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Помесячно
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                isAnnual ? 'btn-shimmer text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              От 3 месяцев
              <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full font-black">
                -33%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div 
              key={i}
              className={`relative rounded-3xl p-8 card-hover ${
                plan.popular 
                  ? 'pricing-popular text-primary-foreground' 
                  : 'bg-card border border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Популярный
                </div>
              )}
              
              <h3 className={`text-2xl font-black mb-1 ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {plan.subtitle}
              </p>
              
              <div className="mb-6">
                <span className={`text-4xl font-black ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {isAnnual ? plan.discountPrice : plan.price}₽
                </span>
                <span className={`text-sm ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>/месяц</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check className={`w-5 h-5 ${plan.popular ? 'text-primary-foreground' : 'text-success'}`} />
                    <span className={`text-sm font-medium ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.popular 
                  ? 'btn-white-shimmer text-primary' 
                  : 'btn-outline-shimmer border-2 border-primary text-primary'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-success">✓</span>
            Первый месяц бесплатно в тестовом режиме
          </div>
          <div className="flex items-center gap-2">
            <span className="text-success">✓</span>
            Отмена в любой момент
          </div>
          <div className="flex items-center gap-2">
            <span className="text-success">✓</span>
            Возврат денег в течение 14 дней
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
