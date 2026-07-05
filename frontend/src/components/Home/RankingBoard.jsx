import React from 'react';

export default function RankingBoard({ title, icon, items, initials = false }) {
  return (
    <article className="leaderboard-block">
      <div className="leaderboard-title-row">
        <span className="leaderboard-icon" aria-hidden="true">{icon}</span>
        <h3 className="leaderboard-heading">{title}</h3>
      </div>
      <div className="leaderboard-list">
        {items.map((item) => (
          <div className={`leaderboard-item${item.featured ? ' highlighted' : ''}`} key={item.name}>
            <div className="item-left">
              <span className="rank-num">{item.rank}</span>
              <span className={`avatar-mini-circle${initials ? ' initials-avatar' : ''}`}>{item.avatar}</span>
              <span>
                <span className="item-main-name">{item.name}</span>
                <span className="item-sub-name">{item.detail}</span>
              </span>
            </div>
            <div className="item-right">
              <span className="rating-value">{item.metric}</span>
              <span className="badge-status-sub">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
