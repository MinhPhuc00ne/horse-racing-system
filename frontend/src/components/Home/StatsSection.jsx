import React from 'react';

export default function StatsSection({ liveRaces, totalPrizePool, activeHorses }) {
  const prizePoolStr = totalPrizePool && totalPrizePool > 0
    ? (totalPrizePool >= 1000000000
        ? `${(totalPrizePool / 1000000000).toFixed(1)}B VND`
        : totalPrizePool >= 1000000
        ? `${(totalPrizePool / 1000000).toFixed(1)}M VND`
        : `${totalPrizePool.toLocaleString()} VND`)
    : '$4.2M';

  const stats = [
    {
      icon: '♔',
      label: 'Live Races',
      value: liveRaces !== null && liveRaces !== undefined ? String(liveRaces) : '12',
      note: 'Up 4 since yesterday',
    },
    {
      icon: '▣',
      label: 'Total Prize Pool',
      value: prizePoolStr,
      note: 'Global contributions',
    },
    {
      icon: '□',
      label: 'Active Horses',
      value: activeHorses && activeHorses > 0 ? activeHorses.toLocaleString() : '842',
      note: 'From elite stable systems',
    },
  ];

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
