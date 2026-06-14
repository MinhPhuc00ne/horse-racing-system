import { useState } from 'react';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import { useJockey } from './JockeyContext';

export default function JockeyRacesContent() {
  const [activeTab, setActiveTab] = useState('my-schedule'); // 'my-schedule' | 'all-races'
  const [searchQuery, setSearchQuery] = useState('');
  
  const { schedule, tournaments } = useJockey();

  // Search filter for all races
  const filteredRaces = tournaments.filter(race => 
    race.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.raceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Lịch trình & Giải đấu
          </h2>
          <p className="text-secondary small m-0">
            Theo dõi các cuộc đua bạn chuẩn bị tham gia và xem toàn bộ thông tin các giải đấu.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          onClick={() => setActiveTab('my-schedule')}
          className={`ho-tab-btn ${activeTab === 'my-schedule' ? 'ho-tab-btn-active' : ''}`}
          style={{ borderRadius: '30px' }}
        >
          Lịch thi đấu của tôi ({schedule.length})
        </button>
        <button
          onClick={() => setActiveTab('all-races')}
          className={`ho-tab-btn ${activeTab === 'all-races' ? 'ho-tab-btn-active' : ''}`}
          style={{ borderRadius: '30px' }}
        >
          Giải đấu hệ thống ({tournaments.length})
        </button>
      </div>

      {/* TAB 1: MY SCHEDULE */}
      {activeTab === 'my-schedule' && (
        <div className="row g-4">
          {schedule.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card text-secondary italic">
              Bạn chưa đăng ký hoặc chưa đồng ý tham gia cuộc đua nào sắp tới.
              Vui lòng duyệt các lời mời ở tab "Lời mời" để bắt đầu.
            </div>
          ) : (
            schedule.map((race, index) => (
              <div key={race.id || index} className="col-12 col-md-6 col-lg-4">
                <DataCard 
                  title={race.tournamentName} 
                  subtitle={`${race.raceDate} lúc ${race.raceTime}`}
                  interactive={true}
                >
                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex justify-content-between py-1 border-bottom border-light">
                      <span className="fw-bold text-dark">Chủ ngựa:</span>
                      <span className="text-secondary small">{race.ownerName} ({race.stableName})</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom border-light">
                      <span className="fw-bold text-dark">Ngựa chiến:</span>
                      <span className="text-secondary small">{race.horseName} ({race.horseBreed})</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom border-light">
                      <span className="fw-bold text-dark">Trường đua:</span>
                      <span className="text-dark small text-truncate ms-2" style={{ maxWidth: '150px' }}>{race.location}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom border-light">
                      <span className="fw-bold text-dark">Cổng xuất phát:</span>
                      <span className="fw-bold text-warning">Cổng #{race.gateNumber || index + 1}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom border-light">
                      <span className="fw-bold text-dark">Phần chia giải:</span>
                      <span className="fw-bold text-success">{race.jockeyShare}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 align-items-center">
                      <span className="fw-bold text-dark">Trạng thái:</span>
                      <StatusBadge status="READY" />
                    </div>
                  </div>

                  <div className="mt-3 p-2 text-center rounded fw-semibold text-success small" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    Đã được xác nhận tham gia
                  </div>
                </DataCard>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL SYSTEM TOURNAMENTS */}
      {activeTab === 'all-races' && (
        <div className="d-flex flex-column gap-4">
          {/* Search Filter Bar */}
          <div className="p-3 glass-card mb-2">
            <div className="position-relative">
              <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ps-3 text-secondary">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm giải đấu, vòng đua hoặc địa điểm trường đua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ho-form-input ps-5 text-dark"
              />
            </div>
          </div>

          {/* List of Races */}
          <div className="row g-4">
            {filteredRaces.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card text-secondary italic">
                Không tìm thấy vòng đua nào phù hợp với từ khóa tìm kiếm.
              </div>
            ) : (
              filteredRaces.map((race, index) => {
                const totalParticipants = race.participants ? race.participants.length : 0;
                return (
                  <div key={race.id || index} className="col-12 col-md-6 col-lg-4">
                    <DataCard 
                      title={`${race.tournamentName}`} 
                      subtitle={`${race.date} lúc ${race.time}`}
                      interactive={true}
                    >
                      <div className="d-flex flex-column gap-2 mb-3">
                        <div className="d-flex justify-content-between py-1 border-bottom border-light">
                          <span className="fw-bold text-dark">Trường đua:</span>
                          <span className="text-dark small text-truncate ms-2" style={{ maxWidth: '160px' }}>{race.location}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom border-light">
                          <span className="fw-bold text-dark">Đường chạy:</span>
                          <span className="text-secondary small">{race.trackType}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom border-light">
                          <span className="fw-bold text-dark">Tổng tiền thưởng:</span>
                          <span className="fw-bold text-success small">{race.prizePool}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom border-light">
                          <span className="fw-bold text-dark">Số ngựa tham gia:</span>
                          <span className="text-secondary small">{totalParticipants} ngựa</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 align-items-center">
                          <span className="fw-bold text-dark">Trạng thái:</span>
                          <StatusBadge status={race.status === 'OPEN_FOR_REGISTER' ? 'Đang mở đăng ký' : race.status} />
                        </div>
                      </div>

                      <div className="mt-3 p-2 rounded text-center small text-secondary fw-medium" style={{ backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}>
                        {race.status === 'OPEN_FOR_REGISTER' ? 'Chờ chủ ngựa gửi yêu cầu đăng ký' : 'Giải đấu sắp khởi tranh'}
                      </div>
                    </DataCard>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
