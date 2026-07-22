import { useState, useEffect } from 'react';
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
  FaBan, 
  FaUserSlash, 
  FaHorseHead, 
  FaPlus, 
  FaCheckCircle, 
  FaExclamationTriangle, 
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
      console.error('Error fetching Blacklist:', err);
      setError(err.message || 'Could not load Blacklist list.');
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
      console.error('Error fetching users/horses list:', err);
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
      alert('Please select or specify the target to penalize.');
      return;
    }
    if (!addFormData.reason.trim()) {
      alert('Please enter a reason for the ban.');
      return;
    }
    if (!addFormData.isPermanent && !addFormData.endDate) {
      alert('Please select a ban end date if not a permanent ban.');
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

      setSuccessMsg('Successfully added target to the blacklist!');
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
      alert('Error: ' + err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleConfirmUnban = async (e) => {
    e.preventDefault();
    if (!selectedItemForUnban) return;

    try {
      setSubmittingUnban(true);
      await unbanAdminBlacklistAPI(selectedItemForUnban.id, unbanReason.trim());
      setSuccessMsg(`Successfully unbanned "${selectedItemForUnban.targetName}"!`);
      setShowUnbanModal(false);
      setSelectedItemForUnban(null);
      setUnbanReason('');
      fetchBlacklists();
    } catch (err) {
      alert('Error unbanning: ' + err.message);
    } finally {
      setSubmittingUnban(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark">
            <FaShieldAlt className="text-danger" /> Blacklist & Ban Management
          </h3>
          <p className="text-muted small mb-0">
            Monitor and manage account suspensions and horse bans across the system.
          </p>
        </div>
        <button 
          className="btn btn-danger fw-semibold d-flex align-items-center gap-2 shadow-sm px-3 py-2"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Add to Blacklist
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
          <FaCheckCircle className="fs-5" />
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
          <FaExclamationTriangle className="fs-5" />
          <div>{error}</div>
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="bg-light p-3 rounded-circle text-secondary fs-4"><FaBan /></div>
              <div>
                <span className="text-muted small text-uppercase fw-bold">Total Records</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{totalCount}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-danger bg-opacity-75 text-white">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="bg-white bg-opacity-25 p-3 rounded-circle text-white fs-4"><FaBan /></div>
              <div>
                <span className="text-white small text-uppercase fw-bold">Active Bans</span>
                <h3 className="fw-bold text-white mt-1 mb-0">{activeCount}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning fs-4"><FaUserSlash /></div>
              <div>
                <span className="text-muted small text-uppercase fw-bold">Banned Accounts</span>
                <h3 className="fw-bold text-warning mt-1 mb-0">{userBanCount}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info fs-4"><FaHorseHead /></div>
              <div>
                <span className="text-muted small text-uppercase fw-bold">Banned Horses</span>
                <h3 className="fw-bold text-info mt-1 mb-0">{horseBanCount}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Search by name, email, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <select className="form-select" value={targetTypeFilter} onChange={(e) => setTargetTypeFilter(e.target.value)}>
                <option value="ALL">All Targets</option>
                <option value="USER">User Accounts</option>
                <option value="HORSE">Horses</option>
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Suspended (Active)</option>
                <option value="INACTIVE">Unbanned (Inactive)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Target</th>
                    <th>Details</th>
                    <th>Reason</th>
                    <th>Duration</th>
                    <th className="text-center">Status</th>
                    <th>Handled By</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlacklists.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={`badge ${item.targetType === 'USER' ? 'bg-warning' : 'bg-info'} bg-opacity-10 text-dark`}>
                          {item.targetType}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold">{item.targetName}</div>
                        <small className="text-muted">{item.targetDetail}</small>
                      </td>
                      <td>{item.reason}</td>
                      <td>
                        {item.isPermanent ? 'Permanent' : <div>To: {item.endDate}</div>}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${item.status === 'ACTIVE' ? 'bg-danger' : 'bg-secondary'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.actionByName}</td>
                      <td className="text-end pe-3">
                        {item.status === 'ACTIVE' && (
                          <button className="btn btn-outline-success btn-sm" onClick={() => { setSelectedItemForUnban(item); setShowUnbanModal(true); }}>
                            <FaUndo /> Unban
                          </button>
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

      {showAddModal && createPortal(
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5>Add to Blacklist</h5></div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  {/* Target Type Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">1. Ban Target Type</label>
                    <div className="d-flex gap-4 mt-2">
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
                          User Account
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
                          Horse
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Target Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">2. Select Target *</label>
                    {addFormData.targetType === 'USER' ? (
                      <select 
                        className="form-select"
                        value={addFormData.targetId}
                        onChange={(e) => setAddFormData({ ...addFormData, targetId: e.target.value })}
                        required
                      >
                        <option value="">-- Select User Account --</option>
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
                        <option value="">-- Select Horse --</option>
                        {horsesList.map(h => (
                          <option key={h.id} value={h.id}>
                            #{h.id} - {h.name} ({h.breed?.name || 'Unknown Breed'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Ban Reason */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">3. Ban Reason *</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Enter detailed reason (e.g., cheating, violating terms of service...)"
                      value={addFormData.reason}
                      onChange={(e) => setAddFormData({ ...addFormData, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  {/* Ban Duration */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">4. Ban Duration</label>
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="isPermanentCheck"
                        checked={addFormData.isPermanent}
                        onChange={(e) => setAddFormData({ ...addFormData, isPermanent: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-danger" htmlFor="isPermanentCheck">
                        Permanent Ban
                      </label>
                    </div>

                    {!addFormData.isPermanent && (
                      <div className="mt-2">
                        <label className="form-label small text-muted">End Date:</label>
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
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger fw-semibold px-4"
                    disabled={submittingAdd}
                  >
                    {submittingAdd ? 'Processing...' : 'Confirm Ban'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Confirm Unban / Lift restriction */}
      {showUnbanModal && selectedItemForUnban && createPortal(
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaUndo /> Confirm Unban
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
                    You are about to unban the target:
                    <div className="fw-bold fs-6 mt-1 text-dark">
                      {selectedItemForUnban.targetName} ({selectedItemForUnban.targetType})
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Notes / Reason for Unban</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      placeholder="Enter reason for unban (e.g. Penalty expired, successful appeal...)"
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
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success fw-semibold px-4"
                    disabled={submittingUnban}
                  >
                    {submittingUnban ? 'Unbanning...' : 'Confirm Unban'}
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
