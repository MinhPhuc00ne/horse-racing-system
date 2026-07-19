import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  getAdminBlacklistsAPI, 
  addAdminBlacklistAPI, 
  unbanAdminBlacklistAPI, 
  getAllUsersAPI 
} from '../../../services/admin';
import { getHorsesToInspectAPI } from '../../../services/referee';
import { 
  FaSearch, 
  FaFilter, 
  FaBan, 
  FaUserSlash, 
  FaHorseHead, 
  FaPlus, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaUndo,
  FaShieldAlt
} from 'react-icons/fa';

export default function BlacklistPanel() {
  const [blacklists, setBlacklists] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [horsesList, setHorsesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addFormData, setAddFormData] = useState({
    targetType: 'USER',
    targetId: '',
    reason: '',
    isPermanent: true,
    endDate: ''
  });

  // Unban Modal State
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [selectedItemForUnban, setSelectedItemForUnban] = useState(null);
  const [unbanReason, setUnbanReason] = useState('');
  const [submittingUnban, setSubmittingUnban] = useState(false);

  const fetchBlacklists = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminBlacklistsAPI(statusFilter, targetTypeFilter);
      setBlacklists(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách Blacklist:', err);
      setError(err.message || 'Không thể tải danh sách Blacklist.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetLists = async () => {
    try {
      const [usersData, horsesData] = await Promise.all([
        getAllUsersAPI().catch(() => []),
        getHorsesToInspectAPI().catch(() => [])
      ]);
      setUsersList(usersData || []);
      setHorsesList(horsesData || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng/ngựa:', err);
    }
  };

  useEffect(() => {
    fetchBlacklists();
  }, [statusFilter, targetTypeFilter]);

  useEffect(() => {
    fetchTargetLists();
  }, []);

  // Filtered List based on Search
  const filteredBlacklists = blacklists.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = item.targetName?.toLowerCase().includes(q);
    const detailMatch = item.targetDetail?.toLowerCase().includes(q);
    const reasonMatch = item.reason?.toLowerCase().includes(q);
    const actionByMatch = item.actionByName?.toLowerCase().includes(q) || item.actionByEmail?.toLowerCase().includes(q);
    return nameMatch || detailMatch || reasonMatch || actionByMatch;
  });

  // Calculate statistics
  const totalCount = blacklists.length;
  const activeCount = blacklists.filter(b => b.status === 'ACTIVE').length;
  const userBanCount = blacklists.filter(b => b.targetType === 'USER' && b.status === 'ACTIVE').length;
  const horseBanCount = blacklists.filter(b => b.targetType === 'HORSE' && b.status === 'ACTIVE').length;

  // Handlers for Add Modal
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.targetId) {
      alert('Vui lòng chọn hoặc nhập đối tượng bị xử phạt.');
      return;
    }
    if (!addFormData.reason.trim()) {
      alert('Vui lòng nhập lý do phạt.');
      return;
    }
    if (!addFormData.isPermanent && !addFormData.endDate) {
      alert('Vui lòng chọn ngày kết thúc cấm nếu không cấm vĩnh viễn.');
      return;
    }

    try {
      setSubmittingAdd(true);
      await addAdminBlacklistAPI({
        targetType: addFormData.targetType,
        targetId: parseInt(addFormData.targetId),
        reason: addFormData.reason.trim(),
        isPermanent: addFormData.isPermanent,
        endDate: addFormData.isPermanent ? null : addFormData.endDate
      });

      setSuccessMsg('Đã thêm đối tượng vào Blacklist thành công!');
      setShowAddModal(false);
      setAddFormData({
        targetType: 'USER',
        targetId: '',
        reason: '',
        isPermanent: true,
        endDate: ''
      });
      fetchBlacklists();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Handlers for Unban Modal
  const handleOpenUnbanModal = (item) => {
    setSelectedItemForUnban(item);
    setUnbanReason('');
    setShowUnbanModal(true);
  };

  const handleConfirmUnban = async (e) => {
    e.preventDefault();
    if (!selectedItemForUnban) return;

    try {
      setSubmittingUnban(true);
      await unbanAdminBlacklistAPI(selectedItemForUnban.id, unbanReason.trim());
      setSuccessMsg(`Đã gỡ cấm (Unban) thành công cho "${selectedItemForUnban.targetName}"!`);
      setShowUnbanModal(false);
      setSelectedItemForUnban(null);
      setUnbanReason('');
      fetchBlacklists();
    } catch (err) {
      alert('Lỗi khi gỡ cấm: ' + err.message);
    } finally {
      setSubmittingUnban(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark">
            <FaShieldAlt className="text-danger" /> Quản Lý Blacklist & Cấm Thi Đấu
          </h3>
          <p className="text-muted small mb-0">
            Theo dõi, phân quyền khóa tài khoản vi phạm hoặc chiến mã bị cấm thi đấu trên toàn hệ thống.
          </p>
        </div>
        <button 
          className="btn btn-danger fw-semibold d-flex align-items-center gap-2 shadow-sm px-3 py-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Thêm Vào Blacklist
        </button>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <FaCheckCircle className="fs-5" />
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <FaExclamationTriangle className="fs-5" />
          <div>{error}</div>
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-bold">Tổng bản ghi</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{totalCount}</h3>
              </div>
              <div className="bg-light p-3 rounded-circle text-secondary fs-4">
                <FaBan />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 h-100 border-start border-danger border-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-bold">Đang bị cấm (Active)</span>
                <h3 className="fw-bold text-danger mt-1 mb-0">{activeCount}</h3>
              </div>
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger fs-4">
                <FaBan />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-bold">Tài khoản bị cấm</span>
                <h3 className="fw-bold text-warning mt-1 mb-0">{userBanCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning fs-4">
                <FaUserSlash />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-bold">Ngựa bị cấm</span>
                <h3 className="fw-bold text-info mt-1 mb-0">{horseBanCount}</h3>
              </div>
              <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info fs-4">
                <FaHorseHead />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FaSearch />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Tìm theo tên, email, lý do..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Target Type Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className="d-flex align-items-center gap-2">
                <FaFilter className="text-muted small" />
                <select 
                  className="form-select"
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả đối tượng</option>
                  <option value="USER">Tài khoản Người dùng</option>
                  <option value="HORSE">Chiến mã (Ngựa)</option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-4">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-semibold text-nowrap">Trạng thái:</span>
                <select 
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang bị Cấm (Active)</option>
                  <option value="INACTIVE">Đã Gỡ cấm (Inactive)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
              <p className="text-muted mt-2 mb-0">Đang tải danh sách Blacklist...</p>
            </div>
          ) : filteredBlacklists.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaInfoCircle className="fs-3 mb-2 opacity-50" />
              <p className="mb-0">Không tìm thấy bản ghi Blacklist nào khớp với bộ lọc.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3" style={{ width: '60px' }}>STT</th>
                    <th>Đối tượng</th>
                    <th>Chi tiết / Thông tin</th>
                    <th>Lý do cấm</th>
                    <th>Thời hạn cấm</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Người xử lý</th>
                    <th className="text-end pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlacklists.map((item, index) => (
                    <tr key={item.id}>
                      <td className="ps-3 fw-bold text-muted small">#{index + 1}</td>

                      {/* Target Type & Icon */}
                      <td>
                        {item.targetType === 'USER' ? (
                          <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-2 py-1 d-inline-flex align-items-center gap-1">
                            <FaUserSlash className="text-warning" /> USER
                          </span>
                        ) : (
                          <span className="badge bg-info bg-opacity-10 text-info border border-info px-2 py-1 d-inline-flex align-items-center gap-1">
                            <FaHorseHead className="text-info" /> HORSE
                          </span>
                        )}
                      </td>

                      {/* Target Name & Detail */}
                      <td>
                        <div className="fw-bold text-dark">{item.targetName || 'N/A'}</div>
                        <div className="small text-muted">{item.targetDetail || `ID: ${item.targetId}`}</div>
                      </td>

                      {/* Reason */}
                      <td style={{ maxWidth: '250px' }}>
                        <span className="text-secondary small d-inline-block text-truncate" style={{ maxWidth: '240px' }} title={item.reason}>
                          {item.reason}
                        </span>
                      </td>

                      {/* Ban Duration */}
                      <td>
                        {item.isPermanent ? (
                          <span className="badge bg-danger text-white">Vĩnh viễn</span>
                        ) : (
                          <div className="small">
                            <div>Từ: <span className="fw-semibold">{item.startDate || 'N/A'}</span></div>
                            <div>Đến: <span className="fw-semibold text-danger">{item.endDate || 'Chưa định ngày'}</span></div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        {item.status === 'ACTIVE' ? (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2 rounded-pill fw-semibold">
                            <FaBan className="me-1" /> ACTIVE
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-3 py-2 rounded-pill fw-semibold">
                            INACTIVE (Đã gỡ)
                          </span>
                        )}
                      </td>

                      {/* Action By */}
                      <td>
                        <div className="small fw-semibold">{item.actionByName || 'System'}</div>
                        <div className="small text-muted">{item.actionByEmail || ''}</div>
                      </td>

                      {/* Actions */}
                      <td className="text-end pe-3">
                        {item.status === 'ACTIVE' ? (
                          <button
                            className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1 fw-semibold shadow-sm"
                            onClick={() => handleOpenUnbanModal(item)}
                            title="Gỡ khỏi danh sách đen"
                          >
                            <FaUndo /> Gỡ cấm
                          </button>
                        ) : (
                          <span className="text-muted small italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Thêm vào Blacklist */}
      {showAddModal && createPortal(
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaBan /> Đưa Đối Tượng Vào Blacklist
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  {/* Select Target Type */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">1. Loại đối tượng bị xử phạt</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="targetType" 
                          id="targetTypeUser"
                          value="USER"
                          checked={addFormData.targetType === 'USER'}
                          onChange={(e) => setAddFormData({ ...addFormData, targetType: e.target.value, targetId: '' })}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="targetTypeUser">
                          Tài khoản Người dùng (User)
                        </label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="targetType" 
                          id="targetTypeHorse"
                          value="HORSE"
                          checked={addFormData.targetType === 'HORSE'}
                          onChange={(e) => setAddFormData({ ...addFormData, targetType: e.target.value, targetId: '' })}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="targetTypeHorse">
                          Chiến mã (Horse)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Target Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">2. Chọn đối tượng cụ thể</label>
                    {addFormData.targetType === 'USER' ? (
                      <select 
                        className="form-select"
                        value={addFormData.targetId}
                        onChange={(e) => setAddFormData({ ...addFormData, targetId: e.target.value })}
                        required
                      >
                        <option value="">-- Chọn tài khoản cần cấm --</option>
                        {usersList.map(u => (
                          <option key={u.id} value={u.id}>
                            #{u.id} - {u.fullName} ({u.email}) [{u.role}]
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select 
                        className="form-select"
                        value={addFormData.targetId}
                        onChange={(e) => setAddFormData({ ...addFormData, targetId: e.target.value })}
                        required
                      >
                        <option value="">-- Chọn chiến mã cần cấm --</option>
                        {horsesList.map(h => (
                          <option key={h.id} value={h.id}>
                            #{h.id} - Ngựa: {h.name} ({h.breed?.name || 'Không rõ giống'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">3. Lý do vi phạm / Cấm</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Nhập lý do chi tiết (ví dụ: Gian lận trong thi đấu, vi phạm điều khoản dịch vụ...)"
                      value={addFormData.reason}
                      onChange={(e) => setAddFormData({ ...addFormData, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  {/* Ban Duration */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">4. Thời hạn cấm</label>
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="isPermanentCheck"
                        checked={addFormData.isPermanent}
                        onChange={(e) => setAddFormData({ ...addFormData, isPermanent: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-danger" htmlFor="isPermanentCheck">
                        Cấm Vĩnh Viễn (Permanent Ban)
                      </label>
                    </div>

                    {!addFormData.isPermanent && (
                      <div className="mt-2">
                        <label className="form-label small text-muted">Ngày kết thúc cấm (End Date):</label>
                        <input 
                          type="date" 
                          className="form-control"
                          min={new Date().toISOString().split('T')[0]}
                          value={addFormData.endDate}
                          onChange={(e) => setAddFormData({ ...addFormData, endDate: e.target.value })}
                          required={!addFormData.isPermanent}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddModal(false)}
                    disabled={submittingAdd}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger fw-semibold px-4"
                    disabled={submittingAdd}
                  >
                    {submittingAdd ? 'Đang xử lý...' : 'Xác Nhận Cấm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Xác nhận Unban / Gỡ cấm */}
      {showUnbanModal && selectedItemForUnban && createPortal(
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaUndo /> Xác Nhận Gỡ Cấm (Unban)
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowUnbanModal(false)}
                ></button>
              </div>
              <form onSubmit={handleConfirmUnban}>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 px-3 mb-3 small">
                    Bạn đang chuẩn bị mở khóa/gỡ cấm cho đối tượng:
                    <div className="fw-bold fs-6 mt-1 text-dark">
                      {selectedItemForUnban.targetName} ({selectedItemForUnban.targetType})
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Ghi chú / Lý do gỡ cấm</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      placeholder="Nhập ghi chú lý do gỡ cấm (ví dụ: Hết hạn xử phạt, đã giải trình thành công...)"
                      value={unbanReason}
                      onChange={(e) => setUnbanReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowUnbanModal(false)}
                    disabled={submittingUnban}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success fw-semibold px-4"
                    disabled={submittingUnban}
                  >
                    {submittingUnban ? 'Đang gỡ...' : 'Xác Nhận Mở Khóa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
