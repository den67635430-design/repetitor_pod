import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
  name: string;
  subtitle: string;
  price: number;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly');

  const plans: PricingPlan[] = [
    {
      name: 'Дошкольники',
      subtitle: 'Для малышей 5-7 лет',
      price: billingPeriod === 'monthly' ? 1490 : 999,
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
      price: billingPeriod === 'monthly' ? 1990 : 1330,
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
      price: billingPeriod === 'monthly' ? 2990 : 2000,
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
        <h2 className="text-4xl lg:text-5xl font-black text-foreground text-center mb-4 tracking-tight">
          Выберите свой тариф
        </h2>
        <p className="text-muted-foreground text-center mb-12 font-semibold">
          Сэкономьте до 60% при оплате за 3 месяца
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-secondary rounded-full p-1.5 flex gap-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Помесячно
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                billingPeriod === 'quarterly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              От 3 месяцев
              <span className="bg-amber-400 text-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                -33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-transform hover:scale-105 ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary to-violet-500 text-primary-foreground'
                  : 'bg-card border border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-foreground text-xs px-4 py-2 rounded-full font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Популярный
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-black mb-1 ${plan.popular ? '' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {plan.subtitle}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-black ${plan.popular ? '' : 'text-foreground'}`}>
                  {plan.price}₽
                </span>
                <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                  /месяц
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-success'}`} />
                    <span className={`font-semibold text-sm ${plan.popular ? '' : 'text-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                  plan.popular
                    ? 'bg-white text-primary hover:bg-white/90'
                    : 'bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-success">✅</span>
            Первый месяц бесплатно в тестовом режиме
          </div>
          <div className="flex items-center gap-2">
            <span className="text-success">✅</span>
            Отмена в любой момент
          </div>
          <div className="flex items-center gap-2">
            <span className="text-success">✅</span>
            Возврат денег в течение 14 дней
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
