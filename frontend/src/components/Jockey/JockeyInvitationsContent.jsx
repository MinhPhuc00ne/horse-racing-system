import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import DataCard from '../ui/DataCard';
import StatusBadge from '../ui/StatusBadge';
import { useJockey } from '../../contexts/JockeyContext';
import {
  getConnectionsDirectoryAPI,
  getFriendsAPI,
  sendConnectionRequestAPI,
  respondToConnectionRequestAPI,
  deleteConnectionAPI
} from '../../services/connections';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';

export default function JockeyInvitationsContent() {
  const [activeTab, setActiveTab] = useState('race-invitations'); // 'race-invitations' | 'connections'
  const [activeSubTab, setActiveSubTab] = useState('my-friends'); // 'my-friends' | 'find'
  
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
      if (location.state.activeSubTab) {
        setActiveSubTab(location.state.activeSubTab);
      }
    }
  }, [location]);
  
  // Connections state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [friendsList, setFriendsList] = useState([]);
  const [directoryList, setDirectoryList] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriendModal, setShowFriendModal] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const { invitations, respondToInvitation, refreshData } = useJockey();

  // Load friends on mount / tab change
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friends = await getFriendsAPI();
        setFriendsList(friends);
      } catch (err) {
        console.error('Error loading friends list:', err);
      }
    };
    loadFriends();
  }, [activeTab]);

  // Load connections directory
  useEffect(() => {
    if (activeTab === 'connections') {
      const loadDirectory = async () => {
        try {
          setLoading(true);
          const directory = await getConnectionsDirectoryAPI(searchQuery, roleFilter);
          setDirectoryList(directory);
        } catch (err) {
          console.error('Error loading directory:', err);
        } finally {
          setLoading(false);
        }
      };
      loadDirectory();
    }
  }, [searchQuery, roleFilter, activeSubTab, activeTab]);

  const refreshAll = async () => {
    try {
      const friends = await getFriendsAPI();
      setFriendsList(friends);
      const directory = await getConnectionsDirectoryAPI(searchQuery, roleFilter);
      setDirectoryList(directory);
    } catch (err) {
      console.error('Error refreshing connections:', err);
    }
  };

  const handleAddFriend = async (recipientId) => {
    try {
      setLoading(true);
      await sendConnectionRequestAPI(recipientId);
      await refreshData();
      await refreshAll();
    } catch (err) {
      alert('Failed to send friend request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondRequest = async (connectionId, action) => {
    try {
      setLoading(true);
      await respondToConnectionRequestAPI(connectionId, action);
      await refreshData();
      await refreshAll();
    } catch (err) {
      alert('Failed to respond to friend request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    try {
      setLoading(true);
      await deleteConnectionAPI(connectionId);
      await refreshData();
      await refreshAll();
    } catch (err) {
      alert('Failed to delete connection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pending ride invitations
  const pendingInvitations = invitations.filter(inv => 
    inv.status === 'PENDING'
  );
  // Processed ride invitations
  const processedInvitations = invitations.filter(inv => 
    inv.status !== 'PENDING'
  );

  const incomingRequests = directoryList.filter(user => user.friendStatus === 'PENDING_RECEIVED');

  const handleAcceptRide = (id) => {
    respondToInvitation(id, 'ACCEPTED');
    alert('Successfully accepted race invitation! The race has been added to your personal schedule.');
  };

  const handleRejectRide = (id) => {
    respondToInvitation(id, 'REJECTED');
    alert('Successfully rejected race invitation.');
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'rgba(212, 175, 55, 0.25)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1 text-white">
            Invitations & Connections Inbox
          </h2>
          <p className="small m-0" style={{ color: '#cbd5e1' }}>
            Browse race cooperation requests and connect with Horse Owners.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={() => setActiveTab('race-invitations')}
          className={`ho-tab-btn ${activeTab === 'race-invitations' ? 'ho-tab-btn-active' : ''}`}
        >
          Race Invitations ({pendingInvitations.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('connections');
            setActiveSubTab('my-friends');
          }}
          className={`ho-tab-btn ${activeTab === 'connections' ? 'ho-tab-btn-active' : ''}`}
        >
          Friends Network
        </button>
      </div>

      {/* TAB 1: RACE INVITATIONS */}
      {activeTab === 'race-invitations' && (
        <div className="d-flex flex-column gap-4">
          <div className="row g-4">
            {pendingInvitations.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card italic" style={{ color: '#cbd5e1' }}>
                You currently have no new race invitations.
              </div>
            ) : (
              pendingInvitations.map((inv) => (
                <div key={inv.id} className="col-12 col-md-6">
                  <DataCard 
                    title={inv.tournamentName} 
                    subtitle={`${inv.raceDate} at ${inv.raceTime}`}
                    interactive={false}
                  >
                    <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>
                          stable
                        </span>
                        <span className="fw-bold text-white fs-7">
                          {inv.ownerName} ({inv.stableName})
                        </span>
                      </div>
                      <p className="small m-0" style={{ fontStyle: 'italic', lineHeight: '1.4', color: '#cbd5e1' }}>
                        "{inv.notes}"
                      </p>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-4">
                      <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                        <span className="fw-semibold small" style={{ color: '#cbd5e1' }}>Horse:</span>
                        <span className="fw-bold text-white small">{inv.horseName} ({inv.horseBreed})</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                        <span className="fw-semibold small" style={{ color: '#cbd5e1' }}>Track Location:</span>
                        <span className="small text-truncate ms-2" style={{ maxWidth: '200px', color: '#cbd5e1' }}>{inv.location}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                        <span className="fw-semibold small" style={{ color: '#cbd5e1' }}>Prize Split (Jockey / Owner):</span>
                        <span className="fw-bold text-success small">{inv.jockeyShare}% / {inv.ownerShare}%</span>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="fw-semibold small" style={{ color: '#cbd5e1' }}>Prize Pool:</span>
                        <span className="fw-bold text-white small">{inv.prizePool}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-3">
                      <button
                        onClick={() => handleRejectRide(inv.id)}
                        className="ho-btn ho-btn-outline-danger flex-grow-1 py-2 fw-bold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAcceptRide(inv.id)}
                        className="ho-btn ho-btn-gold-solid flex-grow-1 py-2 fw-bold"
                      >
                        Accept
                      </button>
                    </div>
                  </DataCard>
                </div>
              ))
            )}
          </div>

          {/* Processed invitations list */}
          {processedInvitations.length > 0 && (
            <div className="mt-4">
              <h3 className="ho-font-epilogue fs-5 fw-bold mb-3 text-white">
                Previously Processed Invitations
              </h3>
              <div className="glass-card p-0 overflow-hidden">
                <table className="table table-hover align-middle mb-0 text-white ho-table">
                  <thead>
                    <tr>
                      <th className="ps-3 py-3 small text-uppercase" style={{ color: '#d4af37' }}>Race Tournament</th>
                      <th className="py-3 small text-uppercase" style={{ color: '#d4af37' }}>Horse Owner</th>
                      <th className="py-3 small text-uppercase" style={{ color: '#d4af37' }}>Horse</th>
                      <th className="py-3 small text-uppercase text-center" style={{ color: '#d4af37' }}>Share (%)</th>
                      <th className="pe-3 py-3 small text-uppercase text-end" style={{ color: '#d4af37' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedInvitations.map((inv) => (
                      <tr key={inv.id}>
                        <td className="ps-3 py-3">
                          <span className="fw-bold d-block text-white">{inv.tournamentName}</span>
                          <span className="small" style={{ color: '#cbd5e1' }}>{inv.raceDate}</span>
                        </td>
                        <td className="py-3">
                          <span className="fw-medium text-white">{inv.ownerName}</span>
                          <span className="small d-block" style={{ color: '#cbd5e1' }}>{inv.stableName}</span>
                        </td>
                        <td className="py-3 fw-semibold" style={{ color: '#cbd5e1' }}>{inv.horseName}</td>
                        <td className="py-3 text-center text-success fw-bold">{inv.jockeyShare}%</td>
                        <td className="pe-3 py-3 text-end">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONNECTIONS NETWORK */}
      {activeTab === 'connections' && (
        <div className="d-flex flex-column gap-3">
          {/* Sub-tabs */}
          <div className="d-flex gap-3 mb-3">
            <button
              onClick={() => setActiveSubTab('my-friends')}
              className={`ho-tab-btn ${activeSubTab === 'my-friends' ? 'ho-tab-btn-active' : ''}`}
              style={{ fontSize: '11px', padding: '0.4rem 1.2rem' }}
            >
              My Friends ({friendsList.length})
            </button>
            <button
              onClick={() => setActiveSubTab('friend-requests')}
              className={`ho-tab-btn ${activeSubTab === 'friend-requests' ? 'ho-tab-btn-active' : ''}`}
              style={{ fontSize: '11px', padding: '0.4rem 1.2rem' }}
            >
              Friend Requests ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('find')}
              className={`ho-tab-btn ${activeSubTab === 'find' ? 'ho-tab-btn-active' : ''}`}
              style={{ fontSize: '11px', padding: '0.4rem 1.2rem' }}
            >
              Search Stable Owners
            </button>
          </div>

          {loading && (
            <div className="text-center py-4 text-success fw-bold">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Loading connections...
            </div>
          )}

          {/* Sub-Tab 1: Friends */}
          {activeSubTab === 'my-friends' && !loading && (
            <div className="row g-4">
              {friendsList.length === 0 ? (
                <div className="col-12 text-center py-5 glass-card text-secondary italic">
                  No friends yet. Switch to "Search Stable Owners" to send requests.
                </div>
              ) : (
                friendsList.map((friend) => (
                  <div 
                    key={friend.userId || friend.id} 
                    className="col-12 col-md-6 col-lg-4 cursor-pointer hover-scale transition-all"
                    onClick={() => {
                      setSelectedFriend(friend);
                      setShowFriendModal(true);
                    }}
                  >
                    <DataCard interactive={false}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '55px', height: '55px', borderColor: '#c0c9c0' }}>
                          <img
                            src={friend.avatar || DEFAULT_AVATAR}
                            alt={friend.fullName}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h4 className="fw-bold fs-6 m-0 text-white">
                            {friend.fullName}
                          </h4>
                          <p className="ho-font-grotesk fw-bold text-uppercase m-0 mt-1" style={{ fontSize: '9px', letterSpacing: '0.05em', color: '#cbd5e1' }}>
                            {friend.role ? friend.role.replace('_', ' ') : 'HORSE OWNER'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-end" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleDeleteConnection(friend.connectionId)}
                          className="ho-btn ho-btn-outline-danger btn-sm w-100 fw-bold"
                        >
                          Unfriend
                        </button>
                      </div>
                    </DataCard>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub-Tab: Friend Requests */}
          {activeSubTab === 'friend-requests' && !loading && (
            <div className="row g-4">
              {incomingRequests.length === 0 ? (
                <div className="col-12 text-center py-5 glass-card italic" style={{ color: '#cbd5e1' }}>
                  No pending friend requests.
                </div>
              ) : (
                incomingRequests.map((user) => (
                  <div 
                    key={user.userId || user.id} 
                    className="col-12 col-md-6 col-lg-4 cursor-pointer hover-scale transition-all"
                    onClick={() => {
                      setSelectedFriend(user);
                      setShowFriendModal(true);
                    }}
                  >
                    <DataCard interactive={false}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '55px', height: '55px', borderColor: 'rgba(212, 175, 55, 0.4)' }}>
                          <img
                            src={user.avatar || DEFAULT_AVATAR}
                            alt={user.fullName}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h4 className="fw-bold fs-6 m-0 text-white">
                            {user.fullName}
                          </h4>
                          <p className="ho-font-grotesk fw-bold text-uppercase m-0 mt-1" style={{ fontSize: '9px', letterSpacing: '0.05em', color: '#cbd5e1' }}>
                            {user.role ? user.role.replace('_', ' ') : 'HORSE OWNER'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleRespondRequest(user.connectionId, 'ACCEPT')}
                            className="ho-btn ho-btn-gold-solid flex-grow-1 fw-bold"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRespondRequest(user.connectionId, 'REJECT')}
                            className="ho-btn ho-btn-outline-danger px-3 fw-bold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </DataCard>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub-Tab 2: Find Directory */}
          {activeSubTab === 'find' && (
            <div className="d-flex flex-column gap-3">
              {/* Directory Filter Bar */}
              <div className="d-flex flex-column flex-sm-row gap-3 p-3 glass-card mb-4">
                <div className="position-relative flex-grow-1">
                  <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ps-3" style={{ color: '#cbd5e1' }}>
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by Name or ID of Horse Owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ho-form-input ps-5"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="ho-form-input fw-bold text-white"
                  style={{ width: 'auto', backgroundColor: '#0c2214' }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="HORSE_OWNER">Horse Owner</option>
                  <option value="JOCKEY">Other Jockeys</option>
                </select>
              </div>

              {/* Grid of Results */}
              <div className="row g-4">
                {directoryList.length === 0 ? (
                  <div className="col-12 text-center py-5 glass-card italic" style={{ color: '#cbd5e1' }}>
                    No matching users found.
                  </div>
                ) : (
                  directoryList.map((user) => (
                    <div 
                      key={user.userId || user.id} 
                      className="col-12 col-md-6 col-lg-4 cursor-pointer hover-scale transition-all"
                      onClick={() => {
                        setSelectedFriend(user);
                        setShowFriendModal(true);
                      }}
                    >
                      <DataCard interactive={false}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '50px', height: '50px', borderColor: 'rgba(212, 175, 55, 0.4)' }}>
                            <img
                              src={user.avatar || DEFAULT_AVATAR}
                              alt={user.fullName}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                          <div className="flex-grow-1">
                            <h4 className="fw-bold fs-6 m-0 text-white">
                              {user.fullName}
                            </h4>
                            <p className="ho-font-grotesk fw-bold text-uppercase m-0 mt-1" style={{ fontSize: '9px', letterSpacing: '0.05em', color: '#cbd5e1' }}>
                              {user.role ? user.role.replace('_', ' ') : 'USER'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          {user.friendStatus === 'FRIEND' && (
                            <StatusBadge status="Friend" customClass="w-100 justify-content-center" />
                          )}

                          {user.friendStatus === 'PENDING_SENT' && (
                            <button 
                              onClick={() => handleDeleteConnection(user.connectionId)}
                              className="ho-btn ho-btn-outline-secondary w-100 fw-bold"
                            >
                              Request Sent
                            </button>
                          )}

                          {user.friendStatus === 'PENDING_RECEIVED' && (
                            <div className="d-flex gap-2">
                              <button 
                                onClick={() => handleRespondRequest(user.connectionId, 'ACCEPT')}
                                className="ho-btn ho-btn-gold-solid flex-grow-1 fw-bold"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleRespondRequest(user.connectionId, 'REJECT')}
                                className="ho-btn ho-btn-outline-danger px-3 fw-bold"
                              >
                                &times;
                              </button>
                            </div>
                          )}

                          {user.friendStatus === 'NONE' && (
                            <button 
                              onClick={() => handleAddFriend(user.userId || user.id)}
                              className="ho-btn ho-btn-gold-solid w-100 fw-bold"
                            >
                              Add Friend
                            </button>
                          )}
                        </div>
                      </DataCard>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Friend Detail Modal */}
      {showFriendModal && selectedFriend && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={() => setShowFriendModal(false)}>
          <div className="modal-content-custom animate-scale-up" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 className="ho-font-epilogue fs-4 fw-bold m-0 text-white">
                User Details
              </h3>
              <button 
                onClick={() => setShowFriendModal(false)}
                className="btn-close btn-close-white"
                aria-label="Close"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>

            <div className="d-flex flex-column align-items-center gap-3 mb-4">
              <div className="rounded-circle overflow-hidden border shadow-sm" style={{ width: '80px', height: '80px', borderColor: 'var(--ho-accent-gold)' }}>
                <img 
                  src={selectedFriend.avatar || DEFAULT_AVATAR} 
                  alt={selectedFriend.fullName} 
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="fw-bold fs-5 m-0 text-white">
                  {selectedFriend.fullName}
                </h4>
                <p className="ho-font-grotesk fw-bold text-uppercase small m-0 mt-1" style={{ letterSpacing: '0.05em', color: '#cbd5e1' }}>
                  {selectedFriend.role ? selectedFriend.role.replace('_', ' ') : 'HORSE OWNER'}
                </p>
                {selectedFriend.description && (
                  <p className="small m-0 mt-2 px-3" style={{ fontStyle: 'italic', fontSize: '13px', lineHeight: '1.4', color: '#cbd5e1' }}>
                    "{selectedFriend.description}"
                  </p>
                )}
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mb-0 p-3 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <span className="fw-bold text-white">Email:</span>
                <span style={{ color: '#cbd5e1' }}>{selectedFriend.email || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <span className="fw-bold text-white">Phone Number:</span>
                <span style={{ color: '#cbd5e1' }}>{selectedFriend.phoneNumber || selectedFriend.phone || 'N/A'}</span>
              </div>
              {selectedFriend.role === 'HORSE_OWNER' && (
                <>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <span className="fw-bold text-white">Stable:</span>
                    <span className="fw-bold text-warning">{selectedFriend.stableName || 'Lucky Stable'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="fw-bold text-white">Address:</span>
                    <span className="text-end small" style={{ maxWidth: '240px', color: '#cbd5e1' }}>{selectedFriend.stableAddress || 'N/A'}</span>
                  </div>
                </>
              )}
              {selectedFriend.role === 'JOCKEY' && (
                <>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <span className="fw-bold text-white">Experience:</span>
                    <span className="fw-bold" style={{ color: '#cbd5e1' }}>{selectedFriend.experienceYears || 0} years</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <span className="fw-bold text-white">Matches Played:</span>
                    <span className="fw-bold" style={{ color: '#cbd5e1' }}>{selectedFriend.matchesPlayed || 0} matches</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="fw-bold text-white">Ranking Score:</span>
                    <span className="fw-bold text-warning">{selectedFriend.rankingScore || 800} pts</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
