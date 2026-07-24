import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAllUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI, toggleUserStatusAPI } from '../../../services/admin';
import DataTable from '../../../components/ui/DataTable';
import { FaSearch, FaFilter, FaToggleOn, FaToggleOff, FaUserCircle, FaPlus, FaEdit, FaTrash, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

export default function UserManagementContent() {
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackModal, setFeedbackModal] = useState({ show: false, type: 'success', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // Form & CRUD States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    username: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'SPECTATOR',
    enabled: true
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await getAllUsersAPI();
      setUsersList(users);
    } catch (err) {
      console.error('Error loading user list:', err);
      setError('Could not load user data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleStatus = (id) => {
    const userToToggle = usersList.find(u => u.id === id);
    const newStatus = !userToToggle.enabled;
    setConfirmModal({
      show: true,
      title: 'Confirm status change',
      message: `Are you sure you want to ${newStatus ? 'UNLOCK' : 'LOCK'} account @${userToToggle.username}?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await toggleUserStatusAPI(id, newStatus);
          setFeedbackModal({
            show: true,
            type: 'success',
            message: `Successfully changed account status of @${userToToggle.username} to ${newStatus ? 'Active' : 'Locked'}.`
          });
          loadUsers(); // Refresh list
        } catch (err) {
          setFeedbackModal({
            show: true,
            type: 'error',
            message: err.message || 'Error changing status.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Check duplicate username or email locally before sending
    const isDuplicate = usersList.some(u =>
      u.id !== editId &&
      (u.username.toLowerCase() === formData.username.trim().toLowerCase() ||
        u.email.toLowerCase() === formData.email.trim().toLowerCase())
    );

    if (isDuplicate) {
      setError('This username or email already exists in the system.');
      return;
    }

    try {
      if (isEditing) {
        await updateUserAPI(editId, formData);
        setFeedbackModal({
          show: true,
          type: 'success',
          message: `Successfully updated account @${formData.username}!`
        });
      } else {
        await createUserAPI(formData);
        setFeedbackModal({
          show: true,
          type: 'success',
          message: `Successfully created account @${formData.username}!`
        });
      }
      resetForm();
      loadUsers(); // Refresh list
    } catch (err) {
      setError(err.message || 'An error occurred while saving user information.');
    }
  };

  const handleEditClick = (user) => {
    setError('');
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
      enabled: user.enabled
    });
    setEditId(user.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    setConfirmModal({
      show: true,
      title: 'Confirm delete account',
      message: `Are you sure you want to delete account @${user.username}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteUserAPI(user.id);
          setFeedbackModal({
            show: true,
            type: 'success',
            message: `Successfully deleted account @${user.username}.`
          });
          loadUsers(); // Refresh list
        } catch (err) {
          setFeedbackModal({
            show: true,
            type: 'error',
            message: err.message || 'Error deleting user.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    const matchesStatus = statusFilter === '' ||
      (statusFilter === 'active' && u.enabled) ||
      (statusFilter === 'locked' && !u.enabled);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      key: 'fullName',
      label: 'User',
      render: (item) => (
        <div className="d-flex align-items-center">
          <FaUserCircle className="me-2 text-warning" style={{ fontSize: '28px' }} />
          <div className="d-flex flex-column">
            <span className="fw-bold text-white">{item.fullName}</span>
            <span className="small" style={{ fontSize: '11px', color: '#cbd5e1' }}>@{item.username}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email / Phone',
      render: (item) => (
        <div className="d-flex flex-column">
          <span className="small" style={{ color: '#cbd5e1' }}>{item.email}</span>
          <span className="small" style={{ fontSize: '11px', color: '#cbd5e1' }}>{item.phone || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (item) => {
        let badgeClass = 'bg-secondary';
        if (item.role === 'ADMIN') badgeClass = 'bg-danger';
        else if (item.role === 'HORSE_OWNER') badgeClass = 'bg-primary';
        else if (item.role === 'JOCKEY') badgeClass = 'bg-info text-dark';
        else if (item.role === 'RACE_REFEREE') badgeClass = 'bg-success';

        return (
          <span className={`badge ${badgeClass} fw-bold text-uppercase`} style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
            {item.role}
          </span>
        );
      }
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (item) => (
        <span className={`badge ${item.enabled ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
          {item.enabled ? 'Active' : 'Locked'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            onClick={() => handleEditClick(item)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Edit User"
          >
            <FaEdit size="12" />
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete User"
          >
            <FaTrash size="12" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>

      {/* Title & Action Buttons */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: '#ffffff' }}>
            User Management
          </h2>
          <p className="text-secondary small m-0" style={{ color: '#cbd5e1' }}>
            View list, search, filter, and perform Add, Edit, Delete, or Lock user functions.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => { setError(''); setShowForm(true); }}
            className="btn btn-success d-flex align-items-center gap-2 fw-bold"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <FaPlus /> Add Member
          </button>
        )}
      </div>

      {/* CRUD Form Modal */}
      {showForm && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
          onClick={resetForm}
        >
          <div
            className="admin-modal-card"
            style={{
              width: '100%',
              maxWidth: '650px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              background: '#0c2214',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaInfoCircle /> {error}
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
                <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: '#ffffff' }}>
                  {isEditing ? 'Update Member Information' : 'Add New Member'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#a0aec0', padding: '0 4px', lineHeight: 1 }}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto', paddingRight: '4px' }} className="no-scrollbar">
                <div className="row g-3">
                  <div className="col-12 col-md-6 form-group">
                    <label className="ho-input-label">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                      placeholder="Enter username (e.g. spectator1)"
                      disabled={isEditing}
                    />
                  </div>

                  <div className="col-12 col-md-6 form-group">
                    <label className="ho-input-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                      placeholder="Enter full name..."
                      disabled={isEditing}
                    />
                  </div>

                  <div className="col-12 col-md-6 form-group">
                    <label className="ho-input-label">Contact Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                      placeholder="Enter email..."
                      disabled={isEditing}
                    />
                  </div>

                  <div className="col-12 col-md-6 form-group">
                    <label className="ho-input-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="ho-form-input text-dark fw-semibold"
                      placeholder="Enter phone number..."
                      disabled={isEditing}
                    />
                  </div>

                  <div className="col-12 col-md-6 form-group">
                    <label className="ho-input-label">System Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                    >
                      <option value="SPECTATOR">SPECTATOR (Spectator)</option>
                      <option value="HORSE_OWNER">HORSE_OWNER (Horse Owner)</option>
                      <option value="JOCKEY">JOCKEY (Jockey)</option>
                      <option value="RACE_REFEREE">RACE_REFEREE (Referee)</option>
                      <option value="ADMIN">ADMIN (Admin)</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6 d-flex align-items-center mt-4 pt-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="userEnabledSwitch"
                        name="enabled"
                        checked={formData.enabled}
                        onChange={handleInputChange}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label text-dark fw-bold ms-2" htmlFor="userEnabledSwitch" style={{ cursor: 'pointer', fontSize: '13px' }}>
                        Account active
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '15px' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', fontSize: '13px', borderRadius: '8px' }}
                >
                  {isEditing ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Modal */}
      {confirmModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
          }}
          onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
        >
          <div
            className="admin-modal-card text-center"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              background: '#0c2214',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
                {confirmModal.title}
              </h3>
              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5', color: '#cbd5e1' }}>
                {confirmModal.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                  className="btn btn-outline-light btn-sm"
                  style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
                  }}
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', fontSize: '13px', borderRadius: '8px' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Feedback Modal */}
      {feedbackModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
          }}
          onClick={() => setFeedbackModal({ show: false, type: 'success', message: '' })}
        >
          <div
            className="admin-modal-card text-center"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '30px 24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              border: `1px solid ${feedbackModal.type === 'success' ? '#10b981' : '#ef4444'}`,
              background: '#0c2214',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: feedbackModal.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: feedbackModal.type === 'success' ? '#10b981' : '#ef4444'
                }}
              >
                {feedbackModal.type === 'success' ? <FaCheckCircle size="36" /> : <FaInfoCircle size="36" />}
              </div>

              <h3 className="m-0 fw-bold" style={{ fontSize: '20px', color: '#ffffff' }}>
                {feedbackModal.type === 'success' ? 'Success!' : 'Failed!'}
              </h3>

              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5', color: '#cbd5e1' }}>
                {feedbackModal.message}
              </p>

              <button
                type="button"
                onClick={() => setFeedbackModal({ show: false, type: 'success', message: '' })}
                className={`btn ${feedbackModal.type === 'success' ? 'btn-success' : 'btn-danger'} fw-bold w-100`}
                style={{ marginTop: '10px', padding: '10px', fontSize: '14px', borderRadius: '8px' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Filter & Search Controls */}
      <div className="glass-card mb-4 p-3 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-stretch align-items-md-center" style={{ border: '1px solid var(--ho-border-gold)' }}>

        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '280px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#d4af37', opacity: 0.8 }} />
          <input
            type="text"
            className="ho-form-input fw-semibold"
            placeholder="Search by name, email, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', fontSize: '14px', height: '42px' }}
          />
        </div>

        {/* Role Filter */}
        <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 auto' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            <FaFilter className="me-1" /> Filter by role:
          </span>
          <select
            className="ho-form-input fw-semibold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ fontSize: '14px', minWidth: '150px', height: '42px', paddingRight: '24px' }}
          >
            <option value="">All Roles</option>
            <option value="HORSE_OWNER">HORSE OWNER</option>
            <option value="JOCKEY">JOCKEY</option>
            <option value="RACE_REFEREE">RACE REFEREE</option>
            <option value="SPECTATOR">SPECTATOR</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 auto' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            <FaFilter className="me-1" /> Status:
          </span>
          <select
            className="ho-form-input fw-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '14px', minWidth: '150px', height: '42px', paddingRight: '24px' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
          </select>
        </div>

      </div>

      {/* User Data Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>Loading user list...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No members found matching the search criteria."
          />
        )}
      </div>

    </div>
  );
}
