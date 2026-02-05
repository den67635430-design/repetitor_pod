import React from 'react';

interface Problem {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

const ProblemsSection: React.FC = () => {
  const problems: Problem[] = [
    {
      icon: '😰',
      title: 'Не понимает в школе',
      description: 'Ребёнок приходит домой и не знает как делать домашку',
      bgColor: 'bg-orange-50'
    },
    {
      icon: '✂️',
      title: 'Репетиторы дорогие',
      description: '2000₽/час × 8 часов = 16,000₽ в месяц',
      bgColor: 'bg-purple-50'
    },
    {
      icon: '🚀',
      title: 'Нет времени',
      description: 'Работа, дела — не успеваете помогать с уроками',
      bgColor: 'bg-pink-50'
    },
    {
      icon: '📱',
      title: 'Отвлекается',
      description: 'Телефон, игры — учёба на последнем месте',
      bgColor: 'bg-cyan-50'
    }
  ];

  return (
    <section className="py-24 px-6 lg:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-black text-center text-foreground mb-16">
          Знакомые проблемы?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <div 
              key={i} 
              className={`${problem.bgColor} p-6 rounded-2xl card-hover border border-transparent`}
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="font-black text-foreground text-lg mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-2xl font-black text-primary">
            У нас есть решение! 👇
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
