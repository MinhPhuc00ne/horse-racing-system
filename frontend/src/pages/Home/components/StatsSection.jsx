import React from 'react';

const stats = [
  {
    icon: '♔',
    label: 'Live Races',
    value: '12',
    note: '+4 from yesterday',
  },
  {
    icon: '▣',
    label: 'Total Prize Pool',
    value: '$4.2M',
    note: 'Worldwide contributions',
  },
  {
    icon: '□',
    label: 'Active Horses',
    value: '842',
    note: 'Elite verified stables',
  },
];

export default function StatsSection() {
  return (
    <section className="stats-section" aria-label="Race statistics">
      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
            <p className="stat-label">{stat.label}</p>
            <h3 className="stat-number">{stat.value}</h3>
            <p className="stat-trend">{stat.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
