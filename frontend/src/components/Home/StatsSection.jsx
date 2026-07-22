import React, { useEffect, useState } from 'react';
import { getPublicStatsAPI } from '../../services/publicApi';

export default function StatsSection() {
  const [statsData, setStatsData] = useState({
    activeTournaments: 0,
    totalPrizePoolVND: 0,
    activeHorses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPublicStatsAPI()
      .then((data) => {
        if (isMounted && data) {
          setStatsData({
            activeTournaments: data.activeTournaments ?? 0,
            totalPrizePoolVND: data.totalPrizePoolVND ?? 0,
            activeHorses: data.activeHorses ?? 0,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load stats:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val) => {
    if (!val || val === 0) return '0 VNĐ';
    return Number(val).toLocaleString('vi-VN') + ' VNĐ';
  };

  const statsList = [
    {
      icon: '♔',
      label: 'Giải Đua Trực Tiếp',
      value: loading ? '...' : statsData.activeTournaments,
      note: 'Giải đấu đang mở & diễn ra',
    },
    {
      icon: '▣',
      label: 'Tổng Giá Trị Giải Thưởng',
      value: loading ? '...' : formatCurrency(statsData.totalPrizePoolVND),
      note: 'Tổng quỹ giải thưởng hệ thống',
    },
    {
      icon: '□',
      label: 'Chiến Mã Đang Hoạt Động',
      value: loading ? '...' : statsData.activeHorses,
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
