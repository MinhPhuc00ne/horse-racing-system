import { useNavigate } from 'react-router-dom';
import { useJockey } from './JockeyContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function JockeyDashboardContent() {
  const navigate = useNavigate();
  const { profile, raceHistory, leaderboard } = useJockey();

  // Format currency to VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Columns for Recent Runs DataTable
  const historyColumns = [
    {
      key: 'date',
      label: 'Ngày đua',
      render: (item) => <span className="text-secondary small">{item.date}</span>
    },
    {
      key: 'tournament',
      label: 'Giải đấu / Vòng đua',
      render: (item) => (
        <div>
          <span className="fw-bold d-block" style={{ color: 'var(--ho-primary-dark)', fontSize: '13px' }}>
            {item.tournament}
          </span>
          <span className="text-muted small" style={{ fontSize: '11px' }}>
            {item.raceRound}
          </span>
        </div>
      )
    },
    {
      key: 'horseName',
      label: 'Ngựa cưỡi',
      render: (item) => (
        <span className="fw-semibold text-secondary small">
          {item.horseName} ({item.ownerName})
        </span>
      )
    },
    {
      key: 'placement',
      label: 'Hạng',
      align: 'center',
      render: (item) => {
        let badgeColor = 'secondary';
        if (item.placement === 1) badgeColor = 'SUCCESS';
        else if (item.placement === 2) badgeColor = 'RECOVERY';
        else if (item.placement === 3) badgeColor = 'TRAINING';
        return <StatusBadge status={item.placement === 1 ? 'Top 1' : `Hạng ${item.placement}`} iconOnly={false} />;
      }
    },
    {
      key: 'payout',
      label: 'Thưởng nhận (VND)',
      align: 'right',
      render: (item) => (
        <span className="fw-bold text-success" style={{ fontSize: '13px' }}>
          +{formatVND(item.payout)}
        </span>
      )
    }
  ];

  // Columns for Jockey Leaderboard
  const leaderboardColumns = [
    {
      key: 'rank',
      label: 'Hạng',
      align: 'center',
      render: (item) => (
        <span className={`fw-bold ${item.isCurrentUser ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '14px' }}>
          #{item.rank}
        </span>
      )
    },
    {
      key: 'fullName',
      label: 'Nài ngựa',
      render: (item) => (
        <div className="d-flex align-items-center">
          <div className="rounded-circle overflow-hidden me-2 border" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            <img src={item.avatar} alt={item.fullName} className="w-100 h-100 object-fit-cover" />
          </div>
          <span className={`fw-semibold ${item.isCurrentUser ? 'text-success fw-bold' : 'text-dark'}`} style={{ fontSize: '13px' }}>
            {item.fullName} {item.isCurrentUser && '(Bạn)'}
          </span>
        </div>
      )
    },
    {
      key: 'winRate',
      label: 'Tỷ lệ thắng',
      align: 'center',
      render: (item) => <span className="small text-secondary fw-semibold">{item.winRate}%</span>
    },
    {
      key: 'rankingScore',
      label: 'Điểm số',
      align: 'right',
      render: (item) => (
        <span className="fw-bold" style={{ color: 'var(--ho-primary-medium)', fontSize: '13px' }}>
          {item.rankingScore} pts
        </span>
      )
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title & Actions */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-4">
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Bảng điều khiển Jockey
          </h2>
          <p className="text-secondary small m-0">
            Tổng quan kết quả thi đấu, số dư phần thưởng, thành tích cá nhân của bạn.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-4 mb-4">
        {/* Wallet Balance Card */}
        <div className="col-12 col-md-3">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100">
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '50px', color: 'var(--ho-accent-gold-text)' }}>payments</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Số dư ví thưởng
            </h3>
            <p className="ho-font-epilogue fs-3 fw-extrabold m-0 text-truncate" style={{ color: 'var(--ho-primary-dark)' }}>
              {formatVND(profile.walletBalance)}
            </p>
            <div className="mt-3 small text-success fw-semibold">
              Có thể rút về ngân hàng liên kết
            </div>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="col-12 col-md-3">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100">
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '50px', color: 'var(--ho-accent-gold-text)' }}>military_tech</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Tỷ lệ thắng (Win Rate)
            </h3>
            <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {profile.winRate}%
            </p>
            <div className="mt-3 small text-secondary">
              Dựa trên {profile.matchesPlayed} trận đã đấu
            </div>
          </div>
        </div>

        {/* Ranking Score Card */}
        <div className="col-12 col-md-3">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100">
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '50px', color: 'var(--ho-accent-gold-text)' }}>leaderboard</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Điểm xếp hạng
            </h3>
            <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {profile.rankingScore} pts
            </p>
            <div className="mt-3 small text-warning fw-semibold">
              Hạng #1 trong danh sách kỵ sĩ
            </div>
          </div>
        </div>

        {/* Invitations redirect card */}
        <div className="col-12 col-md-3">
          <div className="glass-card glass-card-interactive h-100 d-flex flex-column justify-content-between position-relative overflow-hidden"
               style={{ cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.4)' }}
               onClick={() => navigate('/jockey/invitations')}>
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '50px', color: 'var(--ho-accent-gold-text)' }}>mail</span>
            </div>
            <div>
              <h3 className="ho-font-grotesk text-uppercase fw-bold mb-2 d-flex align-items-center" style={{ fontSize: '10px', color: 'var(--ho-accent-gold-text)', letterSpacing: '0.05em' }}>
                Lời mời đua ngựa
              </h3>
              <p className="text-secondary small m-0 mb-3" style={{ lineHeight: '1.4' }}>
                Xem và trả lời các lời mời kết bạn hoặc đề xuất tham gia đua của các Horse Owner.
              </p>
            </div>
            <button className="ho-btn ho-btn-gold-solid w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '11px' }}>
              Kiểm tra Lời mời
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard & Race History */}
      <div className="row g-4">
        {/* Jockey Leaderboard */}
        <div className="col-12 col-lg-5">
          <div className="glass-card h-100">
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Bảng xếp hạng Kỵ sĩ hệ thống
            </h3>
            <DataTable columns={leaderboardColumns} data={leaderboard} emptyMessage="Không có dữ liệu bảng xếp hạng." />
          </div>
        </div>

        {/* Recent Performance History */}
        <div className="col-12 col-lg-7">
          <div className="glass-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="ho-font-epilogue fs-5 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                Thành tích thi đấu gần đây
              </h3>
              <button
                onClick={() => navigate('/jockey/races')}
                className="ho-btn-link text-uppercase tracking-wider small d-flex align-items-center"
                style={{ fontSize: '12px' }}
              >
                Lịch thi đấu
                <span className="material-symbols-outlined ms-1" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
            <DataTable columns={historyColumns} data={raceHistory} emptyMessage="Chưa có dữ liệu thi đấu lịch sử." />
          </div>
        </div>
      </div>
    </div>
  );
}
