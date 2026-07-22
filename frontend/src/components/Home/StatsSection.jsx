import React from 'react';

const stats = [
  {
    icon: '♔',
    label: 'Live Races',
    value: '12',
    note: 'Up 4 since yesterday',
  },
  {
    icon: '▣',
    label: 'Total Prize Pool',
    value: '$4.2M',
    note: 'Global contributions',
  },
  {
    icon: '□',
    label: 'Active Horses',
    value: '842',
    note: 'From elite stable systems',
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
