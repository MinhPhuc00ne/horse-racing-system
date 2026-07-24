import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getTournamentsAPI } from '../../../services/races';
import {
  getRefereesAPI,
  getTracksAPI,
  createTrackAPI,
  createTournamentAPI,
  updateTournamentAPI,
  updateTournamentStatusAPI,
  deleteTournamentAPI,
  confirmRaceRegistrationsAPI
} from '../../../services/admin';
import axiosClient from '../../../api/axiosClient';
import { FaPlus, FaEdit, FaTrash, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaInfoCircle, FaCheckCircle, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';

export default function TournamentsPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackModal, setFeedbackModal] = useState({ show: false, type: 'success', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [tracks, setTracks] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackShape, setTrackShape] = useState('STRAIGHT');

  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [minPrizeFilter, setMinPrizeFilter] = useState('');
  const [maxPrizeFilter, setMaxPrizeFilter] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  // Breed and Lightbox States
  const [breeds, setBreeds] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const fileInputRef = React.useRef(null);

  // State for dynamic track/region creation
  const [showNewTrackModal, setShowNewTrackModal] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackRegion, setNewTrackRegion] = useState('');
  const [newTrackSurface, setNewTrackSurface] = useState('Grass');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const initialFormState = {
    tournamentName: '',
    location: '',
    description: '',
    registrationDeadline: '',
    maxSlots: '',
    prizeFirst: '',
    prizeSecond: '',
    prizeThird: '',
    minBetAmount: '',
    entryFee: '',
    minSlots: '',
    allowedClasses: '',
    allowedAges: '',
    allowedGenders: '',
    imageUrl: '',
    refereeId: '',
    registrationOpeningTime: '',
    officialRaceTime: '',
    surfaceType: 'Grass',
    distance: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleGenderCheckboxChange = (gender, checked) => {
    let currentGenders = formData.allowedGenders 
      ? formData.allowedGenders.split(',').map(g => g.trim().toUpperCase()).filter(Boolean)
      : [];
    if (checked) {
      if (!currentGenders.includes(gender)) {
        currentGenders.push(gender);
      }
    } else {
      currentGenders = currentGenders.filter(g => g !== gender);
    }
    setFormData(prev => ({
      ...prev,
      allowedGenders: currentGenders.join(',')
    }));
  };

  const isMaleChecked = formData.allowedGenders 
    ? formData.allowedGenders.split(',').map(g => g.trim().toUpperCase()).includes('MALE')
    : false;

  const isFemaleChecked = formData.allowedGenders 
    ? formData.allowedGenders.split(',').map(g => g.trim().toUpperCase()).includes('FEMALE')
    : false;

  const normalizeStatus = (status) => {
    if (!status) return 'Upcoming';
    const s = status.toUpperCase();
    if (s === 'OPEN_FOR_REGISTER' || s === 'ACTIVE') return 'Active';
    if (s === 'FINISHED' || s === 'COMPLETED') return 'Finished';
    if (s === 'UPCOMING') return 'Upcoming';
    if (s === 'CANCELLED') return 'Cancelled';
    return status;
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, rList, trackList, breedListRes] = await Promise.all([
        getTournamentsAPI(),
        getRefereesAPI(),
        getTracksAPI(),
        axiosClient.get('/breeds/official')
      ]);
      setTournaments(tList);
      setReferees(rList);
      setTracks(trackList);
      setBreeds(breedListRes.data || []);
      if (rList.length > 0 && !formData.refereeId) {
        setFormData(prev => ({ ...prev, refereeId: rList[0].id }));
      }
    } catch (err) {
      console.error('Fetch error:', err.response || err);
      const url = err.config?.url || 'unknown url';
      const detail = err.response?.data?.message || err.message;
      setError(`Error loading data (${url}): ${detail}`);
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

  const handleAddNewRegion = (newReg) => {
    setSelectedRegion(newReg);
    setFormData(prev => ({ ...prev, location: '' }));
    setSelectedTrack(null);
  };

  const handleAddNewTrackClick = (newTrackNameVal) => {
    setNewTrackName(newTrackNameVal);
    setNewTrackRegion(selectedRegion || '');
    setNewTrackSurface('Grass');
    setShowNewTrackModal(true);
  };

  const handleConfirmAddTrack = async (e) => {
    if (!newTrackName.trim()) {
      setFeedbackModal({ show: true, type: 'error', message: 'Please enter track name' });
      return;
    }
    if (!newTrackRegion.trim()) {
      setFeedbackModal({ show: true, type: 'error', message: 'Please enter location region' });
      return;
    }
    try {
      setLoading(true);
      const newTrack = await createTrackAPI({
        name: newTrackName.trim(),
        location: newTrackRegion.trim(),
        shape: trackShape,
        surfaceCondition: 'Good'
      });
      // Add new track to local list
      setTracks(prev => [...prev, newTrack]);
      // Update selectedRegion to match the track's location
      setSelectedRegion(newTrack.location);
      // Select the newly created track
      setSelectedTrack(newTrack);
      setFormData(prev => ({ ...prev, location: newTrack.name }));

      // Close the modal
      setShowNewTrackModal(false);
      setFeedbackModal({ show: true, type: 'success', message: 'New track created successfully!' });
    } catch (err) {
      setFeedbackModal({ show: true, type: 'error', message: err.message || 'Error creating new track.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      refereeId: referees.length > 0 ? referees[0].id : ''
    });
    setSelectedRegion('');
    setSelectedTrack(null);
    setTrackShape('STRAIGHT');
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(formData.minSlots) < 3) {
      setError('The minimum number of participating horses must be at least 3.');
      return;
    }
    if (parseInt(formData.maxSlots) < 3) {
      setError('The maximum number of participating horses must be at least 3.');
      return;
    }

    const baseDateString = formData.officialRaceTime || formData.registrationDeadline;
    const computedDate = baseDateString ? baseDateString.substring(0, 10) : new Date().toISOString().substring(0, 10);

    // Format dates to fit backend expectation
    const formattedData = {
      ...formData,
      startDate: computedDate,
      endDate: computedDate,
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
        setFeedbackModal({ show: true, type: 'success', message: 'Tournament updated successfully!' });
      } else {
        await createTournamentAPI(formattedData);
        setFeedbackModal({ show: true, type: 'success', message: 'New tournament created successfully!' });
      }
      fetchData();
      resetForm();
    } catch (err) {
      setError(err.message || 'Error saving tournament.');
    }
  };

  // Edit helper
  const handleEditClick = (t) => {
    setError('');
    // Format dates back for datetime-local (YYYY-MM-DDTHH:mm)
    const formatLocalDateTime = (dtStr) => {
      if (!dtStr) return '';
      return dtStr.substring(0, 16);
    };

    // Find and set the track region/venue selection
    let track = tracks.find(tr => tr.name === t.location);
    if (!track && t.location) {
      track = tracks.find(tr => tr.location === t.location);
    }

    if (track) {
      setSelectedRegion(track.location);
      setSelectedTrack(track);
      setTrackShape(track.shape ?? 'STRAIGHT');
    } else {
      setSelectedRegion(t.location || '');
      setSelectedTrack(null);
      setTrackShape('STRAIGHT');
    }

    setFormData({
      tournamentName: t.tournamentName ?? '',
      location: t.location ?? '',
      description: t.description ?? '',
      registrationDeadline: formatLocalDateTime(t.registrationDeadline),
      maxSlots: t.maxSlots ?? '',
      prizeFirst: t.prizeFirst ?? '',
      prizeSecond: t.prizeSecond ?? '',
      prizeThird: t.prizeThird ?? '',
      minBetAmount: t.minBetAmount ?? '',
      entryFee: t.entryFee ?? '',
      minSlots: t.minSlots ?? '',
      allowedClasses: t.allowedClasses ?? '',
      allowedAges: t.allowedAges ?? '',
      allowedGenders: t.allowedGenders ?? '',
      imageUrl: t.imageUrl ?? '',
      refereeId: t.refereeId ?? (referees.length > 0 ? referees[0].id : ''),
      registrationOpeningTime: formatLocalDateTime(t.registrationOpeningTime),
      officialRaceTime: formatLocalDateTime(t.officialRaceTime),
      surfaceType: t.surfaceType ?? 'Grass',
      distance: t.distance ?? ''
    });
    setEditId(t.id);
    setIsEditing(true);
    setShowForm(true);
  };

  // Delete
  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      title: 'Confirm Delete Tournament',
      message: 'Are you sure you want to delete this tournament? All related race rounds will also be affected, and this action cannot be undone.',
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteTournamentAPI(id);
          setFeedbackModal({
            show: true,
            type: 'success',
            message: 'Tournament deleted successfully!'
          });
          fetchData();
        } catch (err) {
          setFeedbackModal({
            show: true,
            type: 'error',
            message: err.message || 'Error deleting tournament.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Update Status
  const handleStatusChange = (id, status) => {
    setConfirmModal({
      show: true,
      title: 'Confirm Status Change',
      message: `Are you sure you want to update the tournament status to "${status}"?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await updateTournamentStatusAPI(id, status);
          setFeedbackModal({
            show: true,
            type: 'success',
            message: `Successfully updated tournament status to "${status}"!`
          });
          fetchData();
        } catch (err) {
          setFeedbackModal({
            show: true,
            type: 'error',
            message: err.message || 'Error updating status.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Confirm Registration (Lock list)
  const handleConfirmRegistration = (tournamentId) => {
    setConfirmModal({
      show: true,
      title: 'Confirm Lock List',
      message: 'Are you sure you want to lock the participant list for this tournament? This action will close registrations, change the round status to LOCKED_LIST, and refund entry fees for unapproved requests.',
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await confirmRaceRegistrationsAPI(tournamentId);
          setFeedbackModal({
            show: true,
            type: 'success',
            message: res.message || 'Roster locked successfully! The race status has been updated to LOCKED_LIST.'
          });
          fetchData();
        } catch (err) {
          setFeedbackModal({
            show: true,
            type: 'error',
            message: err.message || 'Error locking participant list.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
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
        setFeedbackModal({ show: true, type: 'success', message: 'Image uploaded successfully!' });
        setError('');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error uploading image.';
      setError(errMsg);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    const displayStatus = normalizeStatus(t.tournamentStatus);
    const matchesStatus = statusFilter === '' || displayStatus?.toLowerCase() === statusFilter.toLowerCase();
    const matchesName = searchName === '' || t.tournamentName?.toLowerCase().includes(searchName.toLowerCase());
    const matchesLocation = searchLocation === '' || t.location?.toLowerCase().includes(searchLocation.toLowerCase());

    const matchesStartDate = !startDateFilter || (t.startDate && t.startDate >= startDateFilter);
    const matchesEndDate = !endDateFilter || (t.endDate && t.endDate <= endDateFilter);

    const matchesMinPrize = !minPrizeFilter || (t.prizeFirst !== undefined && t.prizeFirst >= parseFloat(minPrizeFilter));
    const matchesMaxPrize = !maxPrizeFilter || (t.prizeFirst !== undefined && t.prizeFirst <= parseFloat(maxPrizeFilter));

    return matchesStatus && matchesName && matchesLocation && matchesStartDate && matchesEndDate && matchesMinPrize && matchesMaxPrize;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTrophy style={{ color: 'var(--ho-accent-gold-text)' }} /> Horse Racing Tournament Management
        </h2>
        {!showForm && (
          <button
            onClick={() => { setError(''); setShowForm(true); }}
            className="btn btn-success d-flex align-items-center gap-2 fw-bold"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <FaPlus /> Add Tournament
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
          onClick={resetForm}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '850px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
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
              <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '12px' }}>
                <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)' }}>
                  {isEditing ? 'Update Tournament' : 'Create New Tournament'}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* Left Col */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                      <label className="ho-input-label">Tournament Name *</label>
                      <input
                        type="text"
                        name="tournamentName"
                        value={formData.tournamentName}
                        onChange={handleInputChange}
                        required
                        className="ho-form-input text-dark fw-semibold"
                        placeholder="Enter tournament name (e.g., Spring Championship 2026)"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <AutocompleteDropdown
                        label="Host Region"
                        value={selectedRegion}
                        onChange={(val) => {
                          setSelectedRegion(val);
                          setSelectedTrack(null);
                          setFormData(prev => ({ ...prev, location: '' }));
                        }}
                        options={[...new Set(tracks.map(t => t.location).filter(Boolean))]}
                        placeholder="Type or select region..."
                        onAddNew={handleAddNewRegion}
                        addNewText="Add new region"
                        required
                      />

                      <TrackAutocompleteDropdown
                        label="Race Track"
                        value={selectedTrack}
                        onChange={(trackObj) => {
                          setSelectedTrack(trackObj);
                          setFormData(prev => ({ ...prev, location: trackObj ? trackObj.name : '' }));
                          if (trackObj && trackObj.shape) {
                            setTrackShape(trackObj.shape);
                          }
                        }}
                        options={tracks.filter(t => t.location === selectedRegion)}
                        placeholder="Type or select track..."
                        onAddNew={handleAddNewTrackClick}
                        addNewText="Create new track"
                        disabled={!selectedRegion}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label className="ho-input-label">Track Surface *</label>
                        <select
                          name="surfaceType"
                          value={formData.surfaceType}
                          onChange={handleInputChange}
                          required
                          className="ho-form-input text-dark fw-semibold"
                        >
                          <option value="Grass">Grass</option>
                          <option value="Muddy">Muddy</option>
                          <option value="Artificial">Artificial</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="ho-input-label">Track Shape *</label>
                        <select
                          name="trackShape"
                          value={trackShape}
                          onChange={(e) => setTrackShape(e.target.value)}
                          required
                          className="ho-form-input text-dark fw-semibold"
                        >
                          <option value="STRAIGHT">STRAIGHT (Straight line)</option>
                          <option value="OVAL">OVAL (Circular/oval)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="ho-input-label">Track Distance (m) *</label>
                      <input
                        type="number"
                        name="distance"
                        value={formData.distance}
                        onChange={handleInputChange}
                        required
                        min="400"
                        className="ho-form-input text-dark fw-semibold"
                        placeholder="e.g., 1200"
                      />
                    </div>

                    <div className="form-group">
                      <label className="ho-input-label">Tournament Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="ho-form-input text-dark fw-semibold"
                        style={{ resize: 'vertical' }}
                        placeholder="Brief description of rules, format, or tournament info..."
                      />
                    </div>



                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label className="ho-input-label">Registration Opening Time</label>
                        <input
                          type="datetime-local"
                          name="registrationOpeningTime"
                          value={formData.registrationOpeningTime}
                          onChange={handleInputChange}
                          className="ho-form-input text-dark fw-semibold"
                        />
                      </div>
                      <div className="form-group">
                        <label className="ho-input-label">Registration Deadline</label>
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
                      <label className="ho-input-label">Official Race Time</label>
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
                        <label className="ho-input-label">Min Horses *</label>
                        <input
                          type="number"
                          name="minSlots"
                          value={formData.minSlots}
                          onChange={handleInputChange}
                          required
                          min="3"
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div className="form-group">
                        <label className="ho-input-label">Max Horses *</label>
                        <input
                          type="number"
                          name="maxSlots"
                          value={formData.maxSlots}
                          onChange={handleInputChange}
                          required
                          min="3"
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 10"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label className="ho-input-label">Entry Fee (VND) *</label>
                        <input
                          type="number"
                          name="entryFee"
                          value={formData.entryFee}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 500000"
                        />
                      </div>
                      <div className="form-group">
                        <label className="ho-input-label">Min Bet Amount (VND) *</label>
                        <input
                          type="number"
                          name="minBetAmount"
                          value={formData.minBetAmount}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 100000"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="ho-input-label">First Prize *</label>
                        <input
                          type="number"
                          name="prizeFirst"
                          value={formData.prizeFirst}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 10000000"
                        />
                      </div>
                      <div className="form-group">
                        <label className="ho-input-label">Second Prize *</label>
                        <input
                          type="number"
                          name="prizeSecond"
                          value={formData.prizeSecond}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 5000000"
                        />
                      </div>
                      <div className="form-group">
                        <label className="ho-input-label">Third Prize *</label>
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
                      <label className="ho-input-label">Assigned Referee *</label>
                      <select
                        name="refereeId"
                        value={formData.refereeId}
                        onChange={handleInputChange}
                        required
                        className="ho-form-input text-dark fw-semibold"
                      >
                        <option value="">Select referee...</option>
                        {referees.map(r => (
                          <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="ho-input-label">Tournament Avatar Image</label>
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
                          position: 'relative'
                        }}
                      >
                        {formData.imageUrl ? (
                          <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                            <img src={formData.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                            {/* Hover overlay with action buttons */}
                            <div
                              style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '15px', opacity: 0, transition: 'opacity 0.2s', zIndex: 5
                              }}
                              className="upload-overlay"
                              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                              <button
                                type="button"
                                className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                                onClick={() => {
                                  setLightboxImage(formData.imageUrl);
                                  setIsZoomedIn(false);
                                }}
                                title="Zoom image"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>zoom_in</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                                onClick={() => fileInputRef.current.click()}
                                title="Change image"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-center p-3"
                            style={{ cursor: 'pointer', width: '100%', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => fileInputRef.current.click()}
                          >
                            <span className="material-symbols-outlined mb-2" style={{ fontSize: '32px', color: 'var(--ho-accent-gold-text)' }}>
                              cloud_upload
                            </span>
                            <p className="m-0 fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>Click to upload image</p>
                            <p className="m-0 small text-secondary">Supports JPG, PNG, WEBP</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                      <BreedMultiSelectDropdown
                        label="Allowed Horse Breeds"
                        value={formData.allowedClasses}
                        onChange={(val) => {
                          setFormData(prev => ({ ...prev, allowedClasses: val }));
                        }}
                        options={breeds.map(b => b.breedName)}
                        placeholder="Select or type horse breed then press Enter..."
                        onAddNew={async (newBreed) => {
                          try {
                            setLoading(true);
                            await axiosClient.post('/breeds', { breedName: newBreed });
                            const res = await axiosClient.get('/breeds/official');
                            const updatedBreeds = res.data || [];
                            setBreeds(updatedBreeds);
                            setFeedbackModal({ show: true, type: 'success', message: `Added horse breed "${newBreed}" successfully!` });
                          } catch (err) {
                            alert(err.response?.data?.message || 'Could not create new horse breed.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="ho-input-label">Allowed Ages</label>
                        <input
                          type="text"
                          name="allowedAges"
                          value={formData.allowedAges}
                          onChange={handleInputChange}
                          className="ho-form-input text-dark fw-semibold"
                          placeholder="e.g., 3,4,5"
                        />
                      </div>
                      <div className="form-group">
                        <label className="ho-input-label d-block mb-2">Allowed Genders</label>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '38px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--ho-primary-dark)', fontWeight: '600' }}>
                            <input
                              type="checkbox"
                              checked={isMaleChecked}
                              onChange={(e) => handleGenderCheckboxChange('MALE', e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--ho-primary-dark)' }}
                            />
                            Male (MALE)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--ho-primary-dark)', fontWeight: '600' }}>
                            <input
                              type="checkbox"
                              checked={isFemaleChecked}
                              onChange={(e) => handleGenderCheckboxChange('FEMALE', e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--ho-primary-dark)' }}
                            />
                            Female (FEMALE)
                          </label>
                        </div>
                      </div>
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
                  {isEditing ? 'Save Changes' : 'Create Tournament'}
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
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px' }}>
                {confirmModal.title}
              </h3>
              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {confirmModal.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                  className="btn btn-outline-secondary btn-sm"
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
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
          }}
          onClick={() => setFeedbackModal({ show: false, type: 'success', message: '' })}
        >
          <div
            className="glass-card text-center"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '30px 24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${feedbackModal.type === 'success' ? '#10b981' : '#ef4444'}`,
              background: '#ffffff',
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

              <h3 className="m-0 fw-bold" style={{ fontSize: '20px', color: 'var(--ho-primary-dark, #003820)' }}>
                {feedbackModal.type === 'success' ? 'Success!' : 'Failed!'}
              </h3>

              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
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

      {/* Filter & Search Toolbar */}
      <div className="glass-card mb-2 p-3" style={{ border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            paddingBottom: isFilterCollapsed ? '0px' : '12px',
            borderBottom: isFilterCollapsed ? 'none' : '1px solid rgba(212, 175, 55, 0.2)'
          }}
          onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ho-primary-dark)', fontWeight: '600', fontSize: '14px' }}>
            <FaFilter style={{ color: 'var(--ho-accent-gold-text)' }} /> Search Filters
          </div>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--ho-primary-dark)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            {isFilterCollapsed ? <FaChevronDown size="14" /> : <FaChevronUp size="14" />}
          </button>
        </div>

        {!isFilterCollapsed && (
          <div className="row g-3" style={{ marginTop: '10px' }}>
          {/* Search Name */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search by Tournament Name</label>
            <input
              type="text"
              className="ho-form-input text-dark fw-semibold"
              placeholder="Enter tournament name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            />
          </div>

          {/* Search Location */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search by Location</label>
            <input
              type="text"
              className="ho-form-input text-dark fw-semibold"
              placeholder="Enter location, track..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            />
          </div>

          {/* Filter Status */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tournament Status</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px', paddingRight: '24px' }}
            >
              <option value="">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Finished">Finished</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date range from */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</label>
            <input
              type="date"
              className="ho-form-input text-dark fw-semibold"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            />
          </div>

          {/* Date range to */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Date</label>
            <input
              type="date"
              className="ho-form-input text-dark fw-semibold"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            />
          </div>

          {/* Min Prize Filter */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min First Prize (VND)</label>
            <input
              type="number"
              className="ho-form-input text-dark fw-semibold"
              placeholder="e.g., 5000000"
              value={minPrizeFilter}
              onChange={(e) => setMinPrizeFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            />
          </div>

          {/* Max Prize Filter */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max First Prize (VND)</label>
            <input
              type="number"
              className="ho-form-input text-dark fw-semibold"
              placeholder="e.g., 15000000"
              value={maxPrizeFilter}
              onChange={(e) => setMaxPrizeFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            />
          </div>

          {/* Clear Filter Button */}
          <div className="col-12 col-md-3 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                setSearchName('');
                setSearchLocation('');
                setStatusFilter('');
                setStartDateFilter('');
                setEndDateFilter('');
                setMinPrizeFilter('');
                setMaxPrizeFilter('');
              }}
              style={{ height: '38px', fontSize: '13px', borderRadius: '8px' }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Tournaments List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
          Current Tournament List ({filteredTournaments.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ho-text-muted)' }}>Loading tournament list...</div>
        ) : tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
            No tournaments have been created yet.
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
            No tournaments match the search criteria.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {filteredTournaments.map((t) => (
              <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '24px', border: '1px solid var(--ho-border-gold)' }}>

                {/* Thumbnail Image */}
                {t.imageUrl && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--ho-border-gold)' }}>
                    <img src={t.imageUrl} alt={t.tournamentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0, lineHeight: '1.3' }}>{t.tournamentName}</h4>
                  {(() => {
                    const displayStatus = normalizeStatus(t.tournamentStatus);
                    return (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: displayStatus === 'Completed' || displayStatus === 'Finished' ? 'rgba(16, 185, 129, 0.15)' : displayStatus === 'Ongoing' || displayStatus === 'Active' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: displayStatus === 'Completed' || displayStatus === 'Finished' ? '#10b981' : displayStatus === 'Ongoing' || displayStatus === 'Active' ? '#3b82f6' : 'var(--ho-accent-gold-text)',
                        border: '1px solid var(--ho-border-gold)'
                      }}>
                        {displayStatus}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-secondary small m-0" style={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', lineHeight: '1.5' }}>
                  {t.description || 'No detailed description.'}
                </p>

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', borderTop: '1px solid var(--ho-border-muted)', borderBottom: '1px solid var(--ho-border-muted)', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt /> Location:</span>
                    <span className="text-dark fw-semibold">{t.location || 'Undecided'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt /> Deadline:</span>
                    <span className="text-dark fw-semibold">{new Date(t.registrationDeadline).toLocaleString('en-US')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaDollarSign /> Entry Fee:</span>
                    <span style={{ color: 'var(--ho-accent-gold-text)', fontWeight: '700' }}>{t.entryFee?.toLocaleString()} VND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTrophy /> Surface Type:</span>
                    <span className="text-dark fw-semibold">{t.surfaceType || 'Grass'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTrophy /> First Prize:</span>
                    <span className="text-success fw-bold">{t.prizeFirst?.toLocaleString()} VND</span>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '5px' }}>

                  {/* Status Dropdown */}
                  <select
                    value={normalizeStatus(t.tournamentStatus)}
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
                      title="Edit tournament"
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
                      title="Delete tournament"
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

      {/* New Track Modal Dialog */}
      {showNewTrackModal && createPortal(
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
            zIndex: 1150,
          }}
          onClick={() => setShowNewTrackModal(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmAddTrack(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '12px' }}>
                <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)' }}>
                  Add New Track
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewTrackModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#a0aec0', padding: '0 4px', lineHeight: 1 }}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Track name *</label>
                  <input
                    type="text"
                    required
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="Enter track name (e.g., Han River Arena)"
                  />
                </div>

                <div className="form-group">
                  <label className="ho-input-label">Host region *</label>
                  <input
                    type="text"
                    required
                    value={newTrackRegion}
                    onChange={(e) => setNewTrackRegion(e.target.value)}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="Enter region (e.g., Da Nang)"
                  />
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewTrackModal(false)}
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
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Modal */}
      {lightboxImage && createPortal(
        <div
          onClick={() => {
            setLightboxImage(null);
            setIsZoomedIn(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            overflow: 'auto'
          }}
        >
          <img
            src={lightboxImage}
            alt="tournament-lightbox"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '2px solid var(--ho-border-gold, #D4AF37)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              cursor: isZoomedIn ? 'zoom-out' : 'zoom-in',
              transform: isZoomedIn ? 'scale(1.6)' : 'none',
              transition: 'transform 0.2s ease-in-out'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn(!isZoomedIn);
            }}
          />
        </div>,
        document.body
      )}

    </div>
  );
}

// Autocomplete Component for Regions
function AutocompleteDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  onAddNew,
  addNewText,
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const containerRef = React.useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exactMatch = options.some(opt => opt.toLowerCase() === searchTerm.trim().toLowerCase());

  return (
    <div ref={containerRef} style={{ position: 'relative' }} className="form-group">
      <label className="ho-input-label">{label} *</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (!disabled) setIsOpen(true);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="ho-form-input text-dark fw-semibold"
      />
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid var(--ho-border-gold, #D4AF37)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1100,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
          className="no-scrollbar"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setSearchTerm(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333333',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f6f3f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: '#888' }}>
              No locations found
            </div>
          )}

          {searchTerm.trim() && !exactMatch && onAddNew && (
            <div
              onClick={() => {
                onAddNew(searchTerm.trim());
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#10b981',
                fontWeight: '700',
                borderTop: '1px dashed #e2e8f0',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
            >
              + {addNewText} "{searchTerm.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Autocomplete Component for Tracks
function TrackAutocompleteDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  onAddNew,
  addNewText,
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value ? value.name : '');
  const containerRef = React.useRef(null);

  useEffect(() => {
    setSearchTerm(value ? value.name : '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value ? value.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exactMatch = options.some(opt => opt.name.toLowerCase() === searchTerm.trim().toLowerCase());

  return (
    <div ref={containerRef} style={{ position: 'relative' }} className="form-group">
      <label className="ho-input-label">{label} *</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (e.target.value === '') {
            onChange(null);
          }
          setIsOpen(true);
        }}
        onFocus={() => {
          if (!disabled) setIsOpen(true);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="ho-form-input text-dark fw-semibold"
      />
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid var(--ho-border-gold, #D4AF37)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1100,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
          className="no-scrollbar"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt);
                  setSearchTerm(opt.name);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333333',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f6f3f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: '#888' }}>
              No tracks found
            </div>
          )}

          {searchTerm.trim() && !exactMatch && onAddNew && (
            <div
              onClick={() => {
                onAddNew(searchTerm.trim());
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#10b981',
                fontWeight: '700',
                borderTop: '1px dashed #e2e8f0',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
            >
              + {addNewText} "{searchTerm.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Multi-select Tag component for allowed breeds
function BreedMultiSelectDropdown({
  label,
  value,
  onChange,
  options,
  onAddNew,
  placeholder
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = React.useRef(null);

  const selectedTags = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag) => {
    if (!tag.trim()) return;
    const trimmed = tag.trim();
    if (!selectedTags.includes(trimmed)) {
      const newTags = [...selectedTags, trimmed];
      onChange(newTags.join(', '));
    }
    setSearchTerm('');
  };

  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter(t => t !== tagToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = searchTerm.trim();
      if (!val) return;

      const exactMatch = options.some(opt => opt.toLowerCase() === val.toLowerCase());
      if (!exactMatch) {
        await onAddNew(val);
      }

      const match = options.find(opt => opt.toLowerCase() === val.toLowerCase());
      addTag(match || val);
    } else if (e.key === 'Backspace' && !searchTerm && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredOptions = options.filter(opt =>
    !selectedTags.some(sel => sel.toLowerCase() === opt.toLowerCase()) &&
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: 'relative' }} className="form-group">
      <label className="ho-input-label">{label} *</label>

      <div
        className="ho-form-input text-dark fw-semibold d-flex flex-wrap align-items-center gap-2"
        style={{
          minHeight: '38px',
          height: 'auto',
          padding: '4px 10px',
          background: '#ffffff',
          border: '1px solid var(--ho-border-gold, #D4AF37)',
          borderRadius: '8px',
          cursor: 'text'
        }}
        onClick={() => setIsOpen(true)}
      >
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="d-flex align-items-center gap-1 badge bg-light text-dark border fw-bold"
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              border: '1px solid var(--ho-border-gold) !important',
              backgroundColor: 'rgba(212, 175, 55, 0.1)'
            }}
          >
            {tag}
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              style={{
                cursor: 'pointer',
                fontSize: '14px',
                color: '#ef4444',
                fontWeight: 'bold',
                lineHeight: 1
              }}
            >
              &times;
            </span>
          </span>
        ))}

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          style={{
            border: 'none',
            outline: 'none',
            flex: '1',
            minWidth: '120px',
            fontSize: '14px',
            padding: '2px 0',
            fontWeight: '600'
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid var(--ho-border-gold, #D4AF37)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1100,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
          className="no-scrollbar"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  addTag(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333333',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f6f3f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: '#888' }}>
              No more breeds to choose
            </div>
          )}

          {searchTerm.trim() && !options.some(opt => opt.toLowerCase() === searchTerm.trim().toLowerCase()) && (
            <div
              onClick={async (e) => {
                e.stopPropagation();
                const val = searchTerm.trim();
                await onAddNew(val);
                addTag(val);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#10b981',
                fontWeight: '700',
                borderTop: '1px dashed #e2e8f0',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
            >
              + Add new horse breed "{searchTerm.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
