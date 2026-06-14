import { createContext, useContext, useState, useEffect } from 'react';
import { getProfileAPI } from '../../services/auth';
import { getFriendsAPI } from '../../services/connections';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI } from '../../services/races';
import {
  initialJockeyProfile,
  initialJockeyInvitations,
  initialJockeyTransactions,
  initialJockeyRaceHistory,
  initialJockeysLeaderboard
} from './mockData';

const JockeyContext = createContext();

export function JockeyProvider({ children }) {
  const [profile, setProfile] = useState(initialJockeyProfile);
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [raceHistory, setRaceHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState(initialJockeysLeaderboard);
  const [loading, setLoading] = useState(true);

  const fetchJockeyData = async () => {
    try {
      setLoading(true);

      // 1. Load Profile
      let baseUser = null;
      try {
        baseUser = await getProfileAPI();
      } catch (err) {
        console.warn('Standard API profile fetch failed, using fallback authentication session user details.');
      }

      const savedProfile = localStorage.getItem('jockey_profile');
      let mergedProfile = savedProfile ? JSON.parse(savedProfile) : initialJockeyProfile;

      if (baseUser) {
        mergedProfile = {
          ...mergedProfile,
          fullName: baseUser.fullName || mergedProfile.fullName,
          email: baseUser.email || mergedProfile.email,
          phoneNumber: baseUser.phone || mergedProfile.phoneNumber,
        };
      }
      
      const savedBalance = localStorage.getItem('jockey_wallet_balance');
      if (savedBalance) {
        mergedProfile.walletBalance = parseFloat(savedBalance);
      } else {
        localStorage.setItem('jockey_wallet_balance', mergedProfile.walletBalance.toString());
      }

      setProfile(mergedProfile);
      localStorage.setItem('jockey_profile', JSON.stringify(mergedProfile));

      // 2. Load Friends (via existing connections API)
      try {
        const friendsData = await getFriendsAPI();
        setFriends(friendsData);
      } catch (err) {
        console.error('Failed to load friends list:', err);
      }

      // 3. Load Public Tournaments & Races
      try {
        const tournamentsData = await getTournamentsAPI();
        const allRaces = [];
        for (const t of tournamentsData) {
          try {
            const races = await getTournamentRacesAPI(t.id);
            for (const r of races) {
              let participants = [];
              try {
                participants = await getRaceParticipantsAPI(r.id);
              } catch (e) {
                console.warn(`Could not load participants for race ${r.id}`);
              }
              
              allRaces.push({
                id: r.id,
                tournamentId: t.id,
                tournamentName: t.tournamentName,
                raceName: r.raceName,
                location: r.raceTrackName || t.location,
                date: r.raceDate,
                time: r.startTime,
                trackType: `${r.surfaceType || 'Dirt'} • Dist: ${r.distance || 1200}m`,
                prizePool: `${t.totalPrize ? t.totalPrize.toLocaleString() : '1,000,000'} VND`,
                status: r.status || 'Upcoming',
                participants: participants
              });
            }
          } catch (err) {
            console.error(`Failed to load races for tournament ${t.id}:`, err);
          }
        }
        setTournaments(allRaces);
      } catch (err) {
        console.error('Failed to load public tournaments:', err);
      }

      // 4. Load Invitations (Ride offers)
      const savedInvitations = localStorage.getItem('jockey_invitations');
      let loadedInvs = null;
      if (savedInvitations) {
        try {
          const parsed = JSON.parse(savedInvitations);
          if (parsed && parsed.length > 0 && typeof parsed[0].ownerId === 'string') {
            loadedInvs = null; // Stale data format, trigger reload
          } else {
            loadedInvs = parsed;
          }
        } catch (e) {
          loadedInvs = null;
        }
      }

      if (loadedInvs) {
        setInvitations(loadedInvs);
      } else {
        setInvitations(initialJockeyInvitations);
        localStorage.setItem('jockey_invitations', JSON.stringify(initialJockeyInvitations));
      }

      // 5. Load Transactions
      const savedTransactions = localStorage.getItem('jockey_transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        setTransactions(initialJockeyTransactions);
        localStorage.setItem('jockey_transactions', JSON.stringify(initialJockeyTransactions));
      }

      // 6. Load Race History
      const savedHistory = localStorage.getItem('jockey_race_history');
      if (savedHistory) {
        setRaceHistory(JSON.parse(savedHistory));
      } else {
        setRaceHistory(initialJockeyRaceHistory);
        localStorage.setItem('jockey_race_history', JSON.stringify(initialJockeyRaceHistory));
      }

      // 7. Load Leaderboard
      const savedLeaderboard = localStorage.getItem('jockey_leaderboard');
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard));
      } else {
        setLeaderboard(initialJockeysLeaderboard);
        localStorage.setItem('jockey_leaderboard', JSON.stringify(initialJockeysLeaderboard));
      }

    } catch (error) {
      console.error('Error in fetchJockeyData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJockeyData();
  }, []);

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('jockey_profile', JSON.stringify(updatedProfile));
    if (updatedProfile.walletBalance !== undefined) {
      localStorage.setItem('jockey_wallet_balance', updatedProfile.walletBalance.toString());
    }
  };

  const handleRespondToInvitation = (invitationId, response) => {
    // response: 'ACCEPTED' or 'REJECTED'
    const updatedInvs = invitations.map(inv => 
      inv.id === invitationId ? { ...inv, status: response } : inv
    );
    setInvitations(updatedInvs);
    localStorage.setItem('jockey_invitations', JSON.stringify(updatedInvs));
    window.dispatchEvent(new Event('jockey_invitations_updated'));

    // If accepted, we can add it to the schedule locally or simulate it
    if (response === 'ACCEPTED') {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (invitation) {
        // Create an entry in schedule (simulated through local state/storage)
        const savedSchedule = localStorage.getItem('jockey_accepted_races') || '[]';
        const scheduleList = JSON.parse(savedSchedule);
        if (!scheduleList.some(s => s.id === invitation.id)) {
          scheduleList.push({
            ...invitation,
            acceptedAt: new Date().toISOString()
          });
          localStorage.setItem('jockey_accepted_races', JSON.stringify(scheduleList));
        }
      }
    }
  };

  const updateTransactions = (updater) => {
    setTransactions(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('jockey_transactions', JSON.stringify(next));
      return next;
    });
  };

  const updateRaceHistory = (updater) => {
    setRaceHistory(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('jockey_race_history', JSON.stringify(next));
      return next;
    });
  };

  // Get active schedule (races that Jockey accepted, plus potential future race participant lists from API)
  const getJockeySchedule = () => {
    const savedSchedule = localStorage.getItem('jockey_accepted_races') || '[]';
    let acceptedRaces = [];
    try {
      acceptedRaces = JSON.parse(savedSchedule);
      if (acceptedRaces && acceptedRaces.length > 0 && typeof acceptedRaces[0].ownerId === 'string') {
        acceptedRaces = [];
        localStorage.setItem('jockey_accepted_races', '[]');
      }
    } catch (e) {
      acceptedRaces = [];
    }

    // Merge with any real approved races from backend where this jockey is enrolled
    const apiRegistered = tournaments.filter(t => 
      t.participants && t.participants.some(p => p.jockeyName === profile.fullName)
    ).map(t => {
      const part = t.participants.find(p => p.jockeyName === profile.fullName);
      return {
        id: `API_${t.id}`,
        ownerName: part.ownerName || 'N/A',
        stableName: 'Associated Stable',
        horseName: part.horseName,
        horseBreed: part.horseBreed || 'Thoroughbred',
        tournamentName: `${t.tournamentName} - ${t.raceName}`,
        raceDate: t.date,
        raceTime: t.time,
        prizePool: t.prizePool,
        jockeyShare: 30, // Default mock percent
        status: 'ACCEPTED',
        gateNumber: part.gateNumber
      };
    });

    // Remove duplicates
    const combined = [...acceptedRaces];
    apiRegistered.forEach(apiR => {
      if (!combined.some(c => c.tournamentName === apiR.tournamentName)) {
        combined.push(apiR);
      }
    });

    return combined;
  };

  const value = {
    profile,
    setProfile: updateProfile,
    friends,
    invitations,
    tournaments,
    transactions,
    setTransactions: updateTransactions,
    raceHistory,
    setRaceHistory: updateRaceHistory,
    leaderboard,
    loading,
    refreshData: fetchJockeyData,
    respondToInvitation: handleRespondToInvitation,
    schedule: getJockeySchedule()
  };

  return (
    <JockeyContext.Provider value={value}>
      {children}
    </JockeyContext.Provider>
  );
}

export function useJockey() {
  const context = useContext(JockeyContext);
  if (!context) {
    throw new Error('useJockey must be used within a JockeyProvider');
  }
  return context;
}
