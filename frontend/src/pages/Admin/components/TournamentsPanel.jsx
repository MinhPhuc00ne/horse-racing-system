import React, { useState, useEffect } from 'react';
import { getTournamentsAPI } from '../../../services/races';
import {
  getRefereesAPI,
  getTracksAPI,
  createTournamentAPI,
  updateTournamentAPI,
  updateTournamentStatusAPI,
  deleteTournamentAPI
} from '../../../services/admin';
import axiosClient from '../../../api/axiosClient';
import { FaPlus, FaEdit, FaTrash, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';

export default function TournamentsPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const initialFormState = {
    tournamentName: '',
    location: '',
    description: '',
    registrationDeadline: '',
    maxSlots: 10,
    prizeFirst: 10000000,
    prizeSecond: 5000000,
    prizeThird: 2000000,
    minBetAmount: 50000,
    entryFee: 100000,
    minSlots: 3,
    allowedClasses: '',
    allowedAges: '3,4,5',
    allowedGenders: 'MALE,FEMALE',
    imageUrl: 'https://images.unsplash.com/photo-1598974357801-cbca100e6563?q=80&w=600',
    refereeId: '',
    registrationOpeningTime: '',
    officialRaceTime: '',
    surfaceType: 'Grass',
    distance: 1200
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, rList, trackList] = await Promise.all([
        getTournamentsAPI(),
        getRefereesAPI(),
        getTracksAPI()
      ]);
      setTournaments(tList);
      setReferees(rList);
      setTracks(trackList);
      if (rList.length > 0 && !formData.refereeId) {
        setFormData(prev => ({ ...prev, refereeId: rList[0].id }));
      }
    } catch (err) {
      console.error('Fetch error:', err.response || err);
      const url = err.config?.url || 'unknown url';
      const detail = err.response?.data?.message || err.message;
      setError(`Lỗi khi tải dữ liệu (${url}): ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedTrack(null);
    setFormData(prev => ({ ...prev, location: '' }));
  };

  const handleTrackChange = (e) => {
    const trackId = e.target.value;
    if (!trackId) {
      setSelectedTrack(null);
      setFormData(prev => ({ ...prev, location: '' }));
      return;
    }
    const track = tracks.find(tr => tr.id === parseInt(trackId));
    if (track) {
      setSelectedTrack(track);
      setFormData(prev => ({ ...prev, location: track.name }));
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      refereeId: referees.length > 0 ? referees[0].id : ''
    });
    setSelectedRegion('');
    setSelectedTrack(null);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Format dates to fit backend expectation
    const formattedData = {
      ...formData,
      maxSlots: parseInt(formData.maxSlots),
      minSlots: parseInt(formData.minSlots),
      refereeId: parseInt(formData.refereeId),
      prizeFirst: parseFloat(formData.prizeFirst),
      prizeSecond: parseFloat(formData.prizeSecond),
      prizeThird: parseFloat(formData.prizeThird),
      minBetAmount: parseFloat(formData.minBetAmount),
      entryFee: parseFloat(formData.entryFee),
      distance: parseFloat(formData.distance),
      raceTrackId: selectedTrack ? selectedTrack.id : null,
      allowedClasses: formData.allowedClasses,
      // Ensure ISO format LocalDateTime (YYYY-MM-DDTHH:MM:SS)
      registrationDeadline: formData.registrationDeadline ? `${formData.registrationDeadline}:00` : null,
      registrationOpeningTime: formData.registrationOpeningTime ? `${formData.registrationOpeningTime}:00` : null,
      officialRaceTime: formData.officialRaceTime ? `${formData.officialRaceTime}:00` : null,
    };

    try {
      if (isEditing) {
        await updateTournamentAPI(editId, formattedData);
        setSuccess('Cập nhật giải đấu thành công!');
      } else {
        await createTournamentAPI(formattedData);
        setSuccess('Tạo giải đấu mới thành công!');
      }
      fetchData();
      resetForm();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu giải đấu.');
    }
  };

  // Edit helper
  const handleEditClick = (t) => {
    // Format dates back for datetime-local (YYYY-MM-DDTHH:mm)
    const formatLocalDateTime = (dtStr) => {
      if (!dtStr) return '';
      return dtStr.substring(0, 16);
    };

    // Find and set the track region/venue selection
    const track = tracks.find(tr => tr.name === t.location);
    if (track) {
      setSelectedRegion(track.location);
      setSelectedTrack(track);
    } else {
      setSelectedRegion('');
      setSelectedTrack(null);
    }

    setFormData({
      tournamentName: t.tournamentName || '',
      location: t.location || '',
      description: t.description || '',
      registrationDeadline: formatLocalDateTime(t.registrationDeadline),
      maxSlots: t.maxSlots || 10,
      prizeFirst: t.prizeFirst || 0,
      prizeSecond: t.prizeSecond || 0,
      prizeThird: t.prizeThird || 0,
      minBetAmount: t.minBetAmount || 0,
      entryFee: t.entryFee || 0,
      minSlots: t.minSlots || 3,
      allowedClasses: t.allowedClasses || '',
      allowedAges: t.allowedAges || '3,4,5',
      allowedGenders: t.allowedGenders || 'MALE,FEMALE',
      imageUrl: t.imageUrl || '',
      refereeId: t.refereeId || (referees.length > 0 ? referees[0].id : ''),
      registrationOpeningTime: formatLocalDateTime(t.registrationOpeningTime),
      officialRaceTime: formatLocalDateTime(t.officialRaceTime),
      surfaceType: t.surfaceType || 'Grass',
      distance: t.distance || 1200
    });
    setEditId(t.id);
    setIsEditing(true);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giải đấu này không? Tất cả vòng đua liên quan cũng sẽ bị ảnh hưởng.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await deleteTournamentAPI(id);
      setSuccess('Xóa giải đấu thành công!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa giải đấu.');
    }
  };

  // Update Status
  const handleStatusChange = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      await updateTournamentStatusAPI(id, status);
      setSuccess(`Cập nhật trạng thái giải đấu thành ${status} thành công!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('files', file);

    try {
      const response = await axiosClient.post('/files/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.length > 0) {
        let uploadedUrl = response.data[0];
        if (uploadedUrl.startsWith('/')) {
            uploadedUrl = 'http://localhost:8080' + uploadedUrl;
        }
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
        setSuccess('Tải ảnh lên thành công!');
        setError('');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi tải ảnh lên.';
      setError(errMsg);
      setSuccess('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTrophy style={{ color: 'var(--ho-accent-gold-text)' }} /> Quản Lý Giải Đấu Đua Ngựa
        </h2>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`btn ${showForm ? 'btn-outline-danger' : 'btn-success'} d-flex align-items-center gap-2 fw-bold`}
          style={{ fontSize: '14px', padding: '10px 18px' }}
        >
          {showForm ? 'Đóng Form' : <><FaPlus /> Thêm Giải Đấu</>}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> {success}
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--ho-border-gold)' }}>
          <h3 className="ho-font-epilogue fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)', borderBottom: '1px solid var(--ho-border-gold)', paddingBottom: '10px' }}>
            {isEditing ? 'Cập Nhật Giải Đấu' : 'Tạo Giải Đấu Mới'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="ho-input-label">Tên giải đấu *</label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleInputChange}
                  required
                  className="ho-form-input text-dark fw-semibold"
                  placeholder="Nhập tên giải đấu (VD: Spring Championship 2026)"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Khu vực tổ chức *</label>
                  <select
                    value={selectedRegion}
                    onChange={handleRegionChange}
                    required
                    className="ho-form-input text-dark fw-semibold"
                  >
                    <option value="">Chọn khu vực...</option>
                    {[...new Set(tracks.map(t => t.location).filter(Boolean))].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Sân thi đấu *</label>
                  <select
                    value={selectedTrack ? selectedTrack.id : ''}
                    onChange={handleTrackChange}
                    required
                    disabled={!selectedRegion}
                    className="ho-form-input text-dark fw-semibold"
                  >
                    <option value="">Chọn sân...</option>
                    {tracks.filter(t => t.location === selectedRegion).map(track => (
                      <option key={track.id} value={track.id}>{track.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Hình dáng sân (Chỉ đọc)</label>
                  <input
                    type="text"
                    value={selectedTrack ? (selectedTrack.shape === 'OVAL' ? 'Vòng tròn (Oval)' : 'Đường thẳng (Straight)') : 'Chưa chọn'}
                    readOnly
                    className="ho-form-input text-secondary fw-semibold bg-light"
                    style={{ cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Loại mặt sân *</label>
                  <select
                    name="surfaceType"
                    value={formData.surfaceType}
                    onChange={handleInputChange}
                    required
                    className="ho-form-input text-dark fw-semibold"
                  >
                    <option value="Grass">Grass (Cỏ)</option>
                    <option value="Muddy">Muddy (Đất bùn)</option>
                    <option value="Artificial">Artificial (Nhân tạo)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="ho-input-label">Khoảng cách đua (m) *</label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  required
                  min="400"
                  className="ho-form-input text-dark fw-semibold"
                />
              </div>

              <div className="form-group">
                <label className="ho-input-label">Mô tả giải đấu</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="ho-form-input text-dark fw-semibold"
                  style={{ resize: 'vertical' }}
                  placeholder="Mô tả tóm tắt thể lệ, cơ cấu hoặc thông tin giải đấu..."
                />
              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Mở đăng ký lúc</label>
                  <input
                    type="datetime-local"
                    name="registrationOpeningTime"
                    value={formData.registrationOpeningTime}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Hạn đăng ký *</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    required
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="ho-input-label">Giờ đua chính thức</label>
                <input
                  type="datetime-local"
                  name="officialRaceTime"
                  value={formData.officialRaceTime}
                  onChange={handleInputChange}
                  className="ho-form-input text-dark fw-semibold"
                />
              </div>
            </div>

            {/* Right Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Số ngựa tối thiểu *</label>
                  <input
                    type="number"
                    name="minSlots"
                    value={formData.minSlots}
                    onChange={handleInputChange}
                    required
                    min="2"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Số ngựa tối đa *</label>
                  <input
                    type="number"
                    name="maxSlots"
                    value={formData.maxSlots}
                    onChange={handleInputChange}
                    required
                    min="3"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Lệ phí tham gia (VND) *</label>
                  <input
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Tiền cược tối thiểu (VND) *</label>
                  <input
                    type="number"
                    name="minBetAmount"
                    value={formData.minBetAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Giải Nhất (VND) *</label>
                  <input
                    type="number"
                    name="prizeFirst"
                    value={formData.prizeFirst}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Giải Nhì (VND) *</label>
                  <input
                    type="number"
                    name="prizeSecond"
                    value={formData.prizeSecond}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Giải Ba (VND) *</label>
                  <input
                    type="number"
                    name="prizeThird"
                    value={formData.prizeThird}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="ho-input-label">Trọng tài chịu trách nhiệm *</label>
                <select
                  name="refereeId"
                  value={formData.refereeId}
                  onChange={handleInputChange}
                  required
                  className="ho-form-input text-dark fw-semibold"
                >
                  <option value="">Chọn trọng tài...</option>
                  {referees.map(r => (
                    <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="ho-input-label">Ảnh Avatar Giải Đấu</label>
                <div 
                  className="position-relative overflow-hidden" 
                  style={{
                    border: '2px dashed var(--ho-border-gold)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '160px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                >
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                  ) : (
                    <div className="text-center p-3" style={{ pointerEvents: 'none' }}>
                      <span className="material-symbols-outlined mb-2" style={{ fontSize: '32px', color: 'var(--ho-accent-gold-text)' }}>
                        cloud_upload
                      </span>
                      <p className="m-0 fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>Nhấn để tải ảnh lên</p>
                      <p className="m-0 small text-secondary">Hỗ trợ JPG, PNG, WEBP</p>
                    </div>
                  )}
                  {/* Overlay text on hover if image exists */}
                  {formData.imageUrl && (
                    <div 
                      className="upload-overlay"
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s', color: 'white', fontWeight: 'bold'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      Đổi ảnh khác
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      opacity: 0, cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Giống ngựa cho phép (Allowed Classes)</label>
                  <input
                    type="text"
                    name="allowedClasses"
                    value={formData.allowedClasses}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="Nhập tên các giống ngựa, cách nhau bằng dấu phẩy (VD: Thoroughbred, Arabian)"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Độ tuổi</label>
                  <input
                    type="text"
                    name="allowedAges"
                    value={formData.allowedAges}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="VD: 3,4,5"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Giới tính</label>
                  <input
                    type="text"
                    name="allowedGenders"
                    value={formData.allowedGenders}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="VD: MALE,FEMALE"
                  />
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--ho-border-gold)', paddingTop: '15px' }}>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline-secondary btn-sm fw-bold"
              style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '13px' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-success btn-sm fw-bold"
              style={{ padding: '8px 24px', borderRadius: '8px', fontSize: '13px' }}
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Giải Đấu'}
            </button>
          </div>
        </form>
      )}

      {/* Tournaments List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
          Danh Sách Giải Đấu Hiện Tại ({tournaments.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ho-text-muted)' }}>Đang tải danh sách giải đấu...</div>
        ) : tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
            Chưa có giải đấu nào được khởi tạo.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {tournaments.map((t) => (
              <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '24px', border: '1px solid var(--ho-border-gold)' }}>
                
                {/* Thumbnail Image */}
                {t.imageUrl && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--ho-border-gold)' }}>
                    <img src={t.imageUrl} alt={t.tournamentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0, lineHeight: '1.3' }}>{t.tournamentName}</h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: t.tournamentStatus === 'Completed' || t.tournamentStatus === 'Finished' ? 'rgba(16, 185, 129, 0.15)' : t.tournamentStatus === 'Ongoing' || t.tournamentStatus === 'Active' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                    color: t.tournamentStatus === 'Completed' || t.tournamentStatus === 'Finished' ? '#10b981' : t.tournamentStatus === 'Ongoing' || t.tournamentStatus === 'Active' ? '#3b82f6' : 'var(--ho-accent-gold-text)',
                    border: '1px solid var(--ho-border-gold)'
                  }}>
                    {t.tournamentStatus}
                  </span>
                </div>

                <p className="text-secondary small m-0" style={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', lineHeight: '1.5' }}>
                  {t.description || 'Không có mô tả chi tiết.'}
                </p>

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', borderTop: '1px solid var(--ho-border-muted)', borderBottom: '1px solid var(--ho-border-muted)', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt /> Địa điểm:</span>
                    <span className="text-dark fw-semibold">{t.location || 'Chưa xác định'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt /> Hạn đăng ký:</span>
                    <span className="text-dark fw-semibold">{new Date(t.registrationDeadline).toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaDollarSign /> Lệ phí đăng ký:</span>
                    <span style={{ color: 'var(--ho-accent-gold-text)', fontWeight: '700' }}>{t.entryFee?.toLocaleString()} VND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTrophy /> Loại mặt sân:</span>
                    <span className="text-dark fw-semibold">{t.surfaceType || 'Grass'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTrophy /> Tổng Giải Nhất:</span>
                    <span className="text-success fw-bold">{t.prizeFirst?.toLocaleString()} VND</span>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  
                  {/* Status Dropdown */}
                  <select
                    value={t.tournamentStatus}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid var(--ho-border-gold)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--ho-primary-dark)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active (Open Registration)</option>
                    <option value="Finished">Finished (Completed)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditClick(t)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      title="Sửa giải đấu"
                    >
                      <FaEdit size="14" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      title="Xóa giải đấu"
                    >
                      <FaTrash size="14" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
