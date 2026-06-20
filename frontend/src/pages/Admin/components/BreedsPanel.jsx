import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

export default function BreedsPanel() {
  const [breeds, setBreeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBreedName, setNewBreedName] = useState('');

  const fetchBreeds = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get('/breeds/official');
      setBreeds(response.data);
    } catch (err) {
      alert('Failed to load official breeds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, []);

  const handleAddBreed = async (e) => {
    e.preventDefault();
    if (!newBreedName.trim()) {
      alert('Breed name is required');
      return;
    }

    try {
      await axiosClient.post(
        '/breeds',
        { breedName: newBreedName }
      );
      alert('Breed added successfully');
      setNewBreedName('');
      setShowAddModal(false);
      fetchBreeds();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add breed');
    }
  };

  const handleDeleteBreed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this breed?')) return;
    try {
      await axiosClient.delete(`/breeds/${id}`);
      alert('Breed deleted successfully');
      fetchBreeds();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete breed');
    }
  };

  return (
    <div className="horses-section premium-panel glass-panel">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="section-title text-gradient">Breed Management</h2>
          <p className="text-muted">Manage official horse breeds for tournaments</p>
        </div>
        <button className="btn btn-primary premium-btn" onClick={() => setShowAddModal(true)}>
          <span className="material-icons me-2">add</span> Add Breed
        </button>
      </div>

      <div className="table-responsive">
        <table className="table premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Breed Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : breeds.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">No official breeds found</td>
              </tr>
            ) : (
              breeds.map(breed => (
                <tr key={breed.id}>
                  <td>#{breed.id}</td>
                  <td className="fw-bold">{breed.breedName}</td>
                  <td><span className="badge bg-success">Official</span></td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDeleteBreed(breed.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-panel">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Add Official Breed</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddBreed}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="form-label">Breed Name</label>
                    <input
                      type="text"
                      className="form-control premium-input"
                      value={newBreedName}
                      onChange={(e) => setNewBreedName(e.target.value)}
                      placeholder="e.g. Arabian"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary premium-btn">Save Breed</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
