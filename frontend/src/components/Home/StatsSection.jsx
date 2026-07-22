import React from 'react';

export default function StatsSection({ tournaments = [] }) {
  const activeCount = tournaments.filter(t => t.tournamentStatus === 'Active' || t.tournamentStatus === 'OPEN_FOR_REGISTER').length;
  const totalPrize = tournaments.reduce((sum, t) => sum + (t.totalPrize || 0), 0);

  // Fallback logic
  const displayActive = tournaments.length > 0 ? activeCount.toString() : '12';
  const displayPrize = tournaments.length > 0 
    ? (totalPrize > 0 ? `${(totalPrize / 1000000).toLocaleString('vi-VN')}M VND` : '0 VND')
    : '$4.2M';

  const statsList = [
    {
      icon: '♔',
      label: 'Giải Đua Trực Tiếp',
      value: displayActive,
      note: tournaments.length > 0 ? 'Cập nhật từ hệ thống' : 'Tăng 4 so với hôm qua',
    },
    {
      icon: '▣',
      label: 'Tổng Giá Trị Giải Thưởng',
      value: displayPrize,
      note: tournaments.length > 0 ? 'Tổng quỹ thưởng thực tế' : 'Đóng góp trên toàn cầu',
    },
    {
      icon: '□',
      label: 'Chiến Mã Đang Hoạt Động',
      value: '842',
      note: 'Thuộc hệ thống trang trại tinh hoa',
    },
  ];

  return (
    <section className="stats-section" aria-label="Race statistics">
      <div className="stats-grid">
        {statsList.map((stat) => (
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
