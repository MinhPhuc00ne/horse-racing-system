import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Home from '../Home/Home';
import '../Dashboard.css';
import '../Horse-Owner/HorseOwner.css';

// Import Referee Components
import PreRaceCheck from '../../components/RaceReferee/PreRaceCheck';
import LiveSimulation from '../../components/RaceReferee/LiveSimulation';
import Violations from '../../components/RaceReferee/Violations';
import AssignedTournaments from './AssignedTournaments';
import ConfirmResults from '../../components/RaceReferee/ConfirmResults';

const refereeNavLinks = [
  { path: '/referee/home', label: 'Home', icon: 'home' },
  { path: '/referee/assigned-tournaments', label: 'My Tournaments', icon: 'assignment' },
  { path: '/referee/pre-race-check', label: 'Pre-Race Check', icon: 'fact_check' },
  { path: '/referee/live-simulation', label: 'Live Simulation', icon: 'sports_score' },
  { path: '/referee/confirm-results', label: 'Confirm Results', icon: 'verified' },
  { path: '/referee/violations', label: 'Infractions & Violations', icon: 'gavel' }
];

export default function RefereePage() {
  return (
    <DashboardLayout navLinks={refereeNavLinks}>
      <Routes>
        <Route index element={<Navigate to="pre-race-check" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="assigned-tournaments" element={<AssignedTournaments />} />
        <Route path="pre-race-check" element={<PreRaceCheck />} />
        <Route path="live-simulation" element={<LiveSimulation />} />
        <Route path="live simulation" element={<LiveSimulation />} />
        <Route path="confirm-results" element={<ConfirmResults />} />
        <Route path="violations" element={<Violations />} />
      </Routes>
    </DashboardLayout>
  );
}

