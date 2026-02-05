import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';

const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly');

  const plans = [
    {
      name: 'Дошкольники',
      description: 'Для малышей 5-7 лет',
      priceMonthly: 1490,
      priceQuarterly: 999,
      features: [
        'Игровое обучение',
        'Буквы, цифры, цвета',
        'Голосовой режим',
        'Родительский контроль'
      ],
      isPopular: false,
      buttonText: 'Выбрать'
    },
    {
      name: 'Стандарт',
      description: '1-11 класс',
      priceMonthly: 1990,
      priceQuarterly: 1333,
      features: [
        '3 предмета на выбор',
        'Безлимитное время',
        'Голос + текст',
        'Родительский контроль',
        'Проверка домашки'
      ],
      isPopular: true,
      buttonText: 'Начать бесплатно'
    },
    {
      name: 'Премиум',
      description: 'Всё включено',
      priceMonthly: 2990,
      priceQuarterly: 1999,
      features: [
        'ВСЕ предметы',
        'Безлимит',
        'Все функции',
        'Приоритетная поддержка',
        'Подготовка к ЕГЭ/ОГЭ'
      ],
      isPopular: false,
      buttonText: 'Выбрать'
    }
  ];

  const currentPrice = (plan: typeof plans[0]) => 
    billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceQuarterly;

  return (
    <section id="pricing" className="py-20 px-6 lg:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-foreground text-center mb-4 tracking-tight">
          Тарифы
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Сэкономьте до 50% при оплате от 3 месяцев
        </p>
        
        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-secondary p-1.5 rounded-full inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                billingPeriod === 'monthly' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Помесячно
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                billingPeriod === 'quarterly' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              От 3 месяцев
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                -33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <div 
              key={i}
              className={`relative rounded-3xl p-8 ${
                plan.isPopular 
                ? 'bg-gradient-to-br from-primary to-purple-600 text-primary-foreground scale-105 shadow-2xl shadow-primary/30' 
                : 'bg-card border border-border'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  Популярный
                </div>
              )}
              
              <h3 className={`text-2xl font-bold mb-1 ${plan.isPopular ? '' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.isPopular ? 'text-white/80' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-black">{currentPrice(plan)}₽</span>
                <span className={`text-sm ${plan.isPopular ? 'text-white/80' : 'text-muted-foreground'}`}>/месяц</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check className={`w-5 h-5 ${plan.isPopular ? 'text-green-300' : 'text-success'}`} />
                    <span className={`font-medium ${plan.isPopular ? '' : 'text-foreground'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.isPopular 
                  ? 'bg-white text-primary hover:bg-gray-100' 
                  : 'bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantees */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <span>Первый месяц бесплатно в тестовом режиме</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <span>Отмена в любой момент</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <span>Возврат денег в течение 14 дней</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
