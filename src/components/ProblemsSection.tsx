import React from 'react';

interface ProblemCard {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

const ProblemsSection: React.FC = () => {
  const problems: ProblemCard[] = [
    {
      icon: '😰',
      title: 'Не понимает в школе',
      description: 'Ребёнок приходит домой и не знает как делать домашку',
      bgColor: 'bg-rose-50'
    },
    {
      icon: '✂️',
      title: 'Репетиторы дорогие',
      description: '2000₽/час × 8 часов = 16,000₽ в месяц',
      bgColor: 'bg-amber-50'
    },
    {
      icon: '⏰',
      title: 'Нет времени',
      description: 'Работа, дела — не успеваете помогать с уроками',
      bgColor: 'bg-sky-50'
    },
    {
      icon: '📱',
      title: 'Отвлекается',
      description: 'Телефон, игры — учёба на последнем месте',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <section className="py-24 px-6 lg:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-black text-foreground text-center mb-16 tracking-tight">
          Знакомые проблемы?
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className={`${problem.bgColor} p-6 rounded-2xl transition-transform hover:scale-105`}
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="font-bold text-foreground text-lg mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-xl font-bold text-primary">
            У нас есть решение! 👇
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
