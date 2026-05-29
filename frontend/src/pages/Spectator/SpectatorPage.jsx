import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import '../Dashboard.css';

export default function SpectatorPage() {
  const { user, accessToken, refreshToken, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();



  // Upgrade Request States
  const [myRequest, setMyRequest] = useState(null);
  const [requestedRole, setRequestedRole] = useState('HORSE_OWNER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Upgrade Form States
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');

  // Jockey specific states
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Horse Owner specific states
  const [stableName, setStableName] = useState('');
  const [stableAddress, setStableAddress] = useState('');

  // Referee specific states
  const [certificationNumber, setCertificationNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  // Upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');

  // Sync upgrade requests from the real backend API
  const syncRequests = async () => {
    if (user?.email) {
      try {
        const response = await axiosClient.get('/upgrade-requests/me');
        const myReqs = response.data;
        if (myReqs && myReqs.length > 0) {
          myReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setMyRequest(myReqs[0]);
        } else {
          setMyRequest(null);
        }
      } catch (err) {
        console.error("Failed to fetch upgrade requests:", err);
      }
    }
  };

  useEffect(() => {
    syncRequests();

    const interval = setInterval(syncRequests, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      alert("Bạn chỉ có thể tải lên tối đa 5 hình ảnh.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      const response = await axiosClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadedImages(prev => [...prev, ...response.data]);
    } catch (err) {
      console.error("Failed to upload files:", err);
      alert("Tải lên hình ảnh thất bại. Vui lòng kiểm tra lại định dạng tệp.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRequestUpgrade = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        requestedRole: requestedRole,
        notes: notes || ("Yêu cầu nâng cấp lên " + requestedRole.replace('_', ' ')),
        fullName,
        dateOfBirth,
        phoneNumber,
        identityNumber,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        licenseNumber,
        stableName,
        stableAddress,
        certificationNumber,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
        documentUrls: uploadedImages
      };

      await axiosClient.post('/upgrade-requests', payload);
      await syncRequests();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to submit request";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateRole = async () => {
    if (myRequest && myRequest.status === 'APPROVED') {
      try {
        // 1. Call refresh token to get a new access token with the updated role claim
        const refreshResponse = await axiosClient.post('/auth/refresh', {
          refreshToken: refreshToken,
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        
        // Temporarily store new tokens
        localStorage.setItem('horse_racing_accessToken', newAccessToken);
        localStorage.setItem('horse_racing_refreshToken', newRefreshToken);
        
        // 2. Fetch updated user profile
        const profileResponse = await axiosClient.get('/auth/me');
        const updatedUser = profileResponse.data;
        
        // 3. Save new session to AuthContext
        login({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: updatedUser,
        });
        

        
        // 4. Hard redirect to the corresponding dashboard
        if (myRequest.requestedRole === 'HORSE_OWNER') {
          window.location.href = '/owner';
        } else if (myRequest.requestedRole === 'JOCKEY') {
          window.location.href = '/jockey';
        } else if (myRequest.requestedRole === 'RACE_REFEREE') {
          window.location.href = '/referee';
        }
      } catch (err) {
        console.error("Failed to activate new role session:", err);
        alert("Failed to refresh session. Please try logging out and logging back in.");
      }
    }
  };



  const triggerTestAPI = async (endpoint) => {
    try {
      const response = await axiosClient.get(`/test/${endpoint}`);
      alert(`API Success (200): ${JSON.stringify(response.data)}`);
    } catch (error) {
      const status = error.response?.status || 'Network Error';
      alert(`API Error (${status}): ${error.message}`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <span className="role-badge">SPECTATOR ROLE</span>
            <h1 className="dashboard-title">Spectator Feed Panel</h1>
          </div>
          <button className="logout-btn" onClick={logout}>
            Log Out
          </button>
        </header>

        {/* Layout Grid */}
        <div className="dashboard-grid">
          
          {/* Left Column: User details and Upgrade requests */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* User Session Info Card */}
            <div className="glass-card">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                User Session Info
              </h2>
              
              <div className="user-profile">
                <div className="profile-item">
                  <span className="profile-label">Username</span>
                  <span className="profile-value">{user?.username || 'N/A'}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Full Name</span>
                  <span className="profile-value">{user?.fullName || 'N/A'}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Email Address</span>
                  <span className="profile-value">{user?.email || 'N/A'}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Assigned Role</span>
                  <span className="profile-value" style={{ color: '#fcd34d', fontWeight: 'bold' }}>
                    {user?.role || 'N/A'}
                  </span>
                </div>
                
              </div>
            </div>

            {/* Upgrade Account Role Card */}
            <div className="glass-card">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                Upgrade Account Role
              </h2>

              {(!myRequest || myRequest.status === 'REJECTED') && (
                <div>
                  {myRequest?.status === 'REJECTED' && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      Yêu cầu trước đó bị từ chối: "{myRequest.rejectionReason || 'Không có lý do cụ thể'}"
                    </div>
                  )}

                  <form onSubmit={handleRequestUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p className="panel-description" style={{ fontSize: '13.5px', marginBottom: '8px' }}>
                      Điền đầy đủ hồ sơ dưới đây để nâng cấp tài khoản của bạn lên vai trò cao hơn:
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label className="profile-label">Chọn vai trò nâng cấp</label>
                      <select 
                        value={requestedRole} 
                        onChange={(e) => setRequestedRole(e.target.value)}
                        style={{
                          padding: '12px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14.5px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="HORSE_OWNER" style={{ background: '#062315' }}>Horse Owner (Chủ ngựa)</option>
                        <option value="JOCKEY" style={{ background: '#062315' }}>Jockey (Nài ngựa)</option>
                        <option value="RACE_REFEREE" style={{ background: '#062315' }}>Race Referee (Trọng tài)</option>
                      </select>
                    </div>

                    {/* Section 1: Thông tin cá nhân */}
                    <div className="upgrade-form-section">
                      <div className="upgrade-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px', color: '#fcd34d' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25zm.75-12h3.75c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125H5.25a1.125 1.125 0 01-1.125-1.125v-3.75C4.125 8.004 4.629 7.5 5.25 7.5z" />
                        </svg>
                        Thông Tin Định Danh
                      </div>
                      
                      <div className="form-row two-cols">
                        <div className="form-group">
                          <label className="profile-label">Họ và Tên</label>
                          <input 
                            type="text" 
                            required 
                            className="form-input" 
                            placeholder="Nguyễn Văn A" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="profile-label">Số Điện Thoại</label>
                          <input 
                            type="tel" 
                            required 
                            className="form-input" 
                            placeholder="09xxxxxxxx" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-row two-cols">
                        <div className="form-group">
                          <label className="profile-label">Ngày Sinh</label>
                          <input 
                            type="date" 
                            required 
                            className="form-input" 
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="profile-label">Số CCCD / Hộ Chiếu</label>
                          <input 
                            type="text" 
                            required 
                            className="form-input" 
                            placeholder="0350xxxxxxxx" 
                            value={identityNumber}
                            onChange={(e) => setIdentityNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Thông tin chuyên môn theo vai trò */}
                    <div className="upgrade-form-section">
                      <div className="upgrade-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px', color: '#fcd34d' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c4.956-1.92 9.499-4.768 13.485-8.381a18.59 18.59 0 01-3.111-3.832v3.743a2.25 2.25 0 01-2.246 2.25H6.507a2.25 2.25 0 01-2.246-2.25v-3.743z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25l-9.155 4.88a2.25 2.25 0 000 3.94l9.155 4.88 9.155-4.88a2.25 2.25 0 000-3.94L12 2.25z" />
                        </svg>
                        Thông Tin Chuyên Môn
                      </div>

                      {requestedRole === 'JOCKEY' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div className="form-row two-cols">
                            <div className="form-group">
                              <label className="profile-label">Cân nặng (kg)</label>
                              <input 
                                type="number" 
                                required 
                                min="40"
                                max="80"
                                step="0.1"
                                className="form-input" 
                                placeholder="55.5" 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label className="profile-label">Chiều cao (cm)</label>
                              <input 
                                type="number" 
                                required 
                                min="100"
                                max="250"
                                className="form-input" 
                                placeholder="165" 
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="profile-label">Số Giấy Phép Nài Ngựa (License No.)</label>
                            <input 
                              type="text" 
                              required 
                              className="form-input" 
                              placeholder="JC-998877" 
                              value={licenseNumber}
                              onChange={(e) => setLicenseNumber(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {requestedRole === 'HORSE_OWNER' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div className="form-group">
                            <label className="profile-label">Tên Trang Trại (Stable Name)</label>
                            <input 
                              type="text" 
                              required 
                              className="form-input" 
                              placeholder="Golden Horse Farm" 
                              value={stableName}
                              onChange={(e) => setStableName(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="profile-label">Địa Chỉ Trang Trại (Stable Address)</label>
                            <input 
                              type="text" 
                              required 
                              className="form-input" 
                              placeholder="123 Đường Đua, Quận 9, TP.HCM" 
                              value={stableAddress}
                              onChange={(e) => setStableAddress(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {requestedRole === 'RACE_REFEREE' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div className="form-row two-cols">
                            <div className="form-group">
                              <label className="profile-label">Số Chứng Chỉ Trọng Tài</label>
                              <input 
                                type="text" 
                                required 
                                className="form-input" 
                                placeholder="REF-665544" 
                                value={certificationNumber}
                                onChange={(e) => setCertificationNumber(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label className="profile-label">Số Năm Kinh Nghiệm</label>
                              <input 
                                type="number" 
                                required 
                                min="0"
                                max="50"
                                className="form-input" 
                                placeholder="5" 
                                value={experienceYears}
                                onChange={(e) => setExperienceYears(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Tải ảnh bằng cấp/minh chứng */}
                    <div className="upgrade-form-section">
                      <div className="upgrade-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px', color: '#fcd34d' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        Bằng Cấp & Ảnh Chứng Minh (Tối đa 5 ảnh)
                      </div>

                      <label className="upload-dropzone" style={{ pointerEvents: isUploading ? 'none' : 'auto' }}>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="upload-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <div className="upload-text">
                          {isUploading ? 'Đang tải tệp lên máy chủ...' : (
                            <>Nhấp để <strong>Tải ảnh lên</strong> hoặc Kéo & thả</>
                          )}
                        </div>
                        <div className="upload-subtext">Hỗ trợ định dạng PNG, JPG, JPEG (tối đa 5MB mỗi ảnh)</div>
                      </label>

                      {uploadedImages.length > 0 && (
                        <div className="preview-grid">
                          {uploadedImages.map((imgUrl, index) => (
                            <div className="preview-item" key={index}>
                              <img src={`http://localhost:8080${imgUrl}`} alt="Preview" className="preview-img" />
                              <button type="button" className="remove-btn" onClick={() => handleRemoveImage(index)}>&times;</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 4: Ghi chú */}
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="profile-label">Ghi Chú Thêm (Tùy chọn)</label>
                      <textarea 
                        className="form-input" 
                        rows="2" 
                        placeholder="Thông tin giới thiệu bản thân hoặc lưu ý khác..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting || isUploading}
                      style={{
                        background: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)',
                        color: '#062315',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: (isSubmitting || isUploading) ? 'not-allowed' : 'pointer',
                        opacity: (isSubmitting || isUploading) ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        marginTop: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting && !isUploading) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(252, 211, 77, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu nâng cấp'}
                    </button>
                  </form>
                </div>
              )}

              {myRequest && myRequest.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    alignSelf: 'center',
                    background: 'rgba(252, 211, 77, 0.1)',
                    color: '#fcd34d',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(252, 211, 77, 0.3)',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    Awaiting Admin Approval
                  </div>
                  <p className="panel-description" style={{ fontSize: '13.5px' }}>
                    You requested an upgrade to <strong>{myRequest.requestedRole.replace('_', ' ')}</strong>.
                  </p>
                  <p style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
                    The system will notify you once an administrator reviews your request.
                  </p>
                </div>
              )}

              {myRequest && myRequest.status === 'APPROVED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    alignSelf: 'center',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                  }}>
                    UPGRADE APPROVED!
                  </div>
                  <p className="panel-description" style={{ fontSize: '13.5px' }}>
                    Your request to upgrade to <strong>{myRequest.requestedRole.replace('_', ' ')}</strong> has been accepted by the Admin.
                  </p>
                  <button 
                    onClick={handleActivateRole}
                    style={{
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Activate New Role
                  </button>
                </div>
              )}
            </div>

          </aside>

          {/* Right Column: API testing */}
          <main className="glass-card">
            <div className="test-panel">
              <div>
                <h2 className="card-title" style={{ borderBottom: 'none', marginBottom: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                  </svg>
                  API Authorization Test Panel
                </h2>
                <p className="panel-description">
                  Trigger endpoint requests to verify Spring Security role restrictions. Under a <strong>SPECTATOR</strong> role, 
                  you should be allowed to access <code>/public</code>, <code>/spectator</code>, and <code>/any-role</code>, but blocked (403) from others.
                </p>
              </div>

              {/* Endpoint buttons */}
              <div className="test-grid">
                <button className="api-test-button" onClick={() => triggerTestAPI('public')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/public</span>
                  <span className="api-desc">Accessible by anyone (PermitAll)</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('spectator')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/spectator</span>
                  <span className="api-desc">Only accessible by SPECTATOR</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('owner')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/owner</span>
                  <span className="api-desc">Only accessible by HORSE_OWNER</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('jockey')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/jockey</span>
                  <span className="api-desc">Only accessible by JOCKEY</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('referee')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/referee</span>
                  <span className="api-desc">Only accessible by RACE_REFEREE</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('admin')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/admin</span>
                  <span className="api-desc">Only accessible by ADMIN</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('any-role')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/any-role</span>
                  <span className="api-desc">Accessible by any authenticated role</span>
                </button>
              </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
