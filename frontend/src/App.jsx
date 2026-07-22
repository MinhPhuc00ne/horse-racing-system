import { lazy, Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import FloatingAiChat from './components/layout/FloatingAiChat/FloatingAiChat';
import PageTransition from './components/layout/PageTransition/PageTransition';

// Lazy load Page Components
const AuthPage = lazy(() => import('./pages/AuthPage/AuthPage'));
const VerifyAccountPage = lazy(() => import('./pages/AuthPage/VerifyAccountPage'));
const Home = lazy(() => import('./pages/Home/Home'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const HorseOwnerPage = lazy(() => import('./pages/Horse-Owner/HorseOwnerPage'));
const JockeyPage = lazy(() => import('./pages/Jockey/JockeyPage'));
const RefereePage = lazy(() => import('./pages/Race-Referee/RefereePage'));
const SpectatorPage = lazy(() => import('./pages/Spectator/SpectatorPage'));
const SpectatorTournaments = lazy(() => import('./components/Spectator/SpectatorTournaments'));
const SpectatorLiveSimulationPage = lazy(() => import('./components/Spectator/SpectatorLiveSimulationPage'));
const UnauthorizedPage = lazy(() => import('./pages/Unauthorized/UnauthorizedPage'));
const PaymentQRPage = lazy(() => import('./pages/Payment/PaymentQRPage'));
const PaymentCallback = lazy(() => import('./pages/Payment/PaymentCallback'));

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [customAlert, setCustomAlert] = useState(null);

  useEffect(() => {
    window.alert = (message) => {
      setCustomAlert(message);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <PageTransition>
              <Suspense fallback={
                <PageTransition initialLoading={true}>
                  <div className="app-layout" style={{ background: '#02050a' }} />
                </PageTransition>
              }>
                <Routes>
                  {/* Public Authentication Routes */}
                  <Route path="/login" element={<AuthPage view="login" />} />
                  <Route path="/signup" element={<AuthPage view="signup" />} />
                  <Route path="/verify-account" element={<VerifyAccountPage />} />
                  <Route path="/verify-email" element={<VerifyAccountPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Standalone Horse Owner Dashboard Suite */}
                  <Route
                    path="/owner/*"
                    element={
                      <ProtectedRoute allowedRoles={["HORSE_OWNER"]}>
                        <HorseOwnerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/horseowner/dashboard" element={<Navigate to="/owner" replace />} />

                  {/* Jockey Nested Dashboard Layout */}
                  <Route
                    path="/jockey/*"
                    element={
                      <ProtectedRoute allowedRoles={["JOCKEY"]}>
                        <JockeyPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Referee Nested Dashboard Layout */}
                  <Route
                    path="/referee/*"
                    element={
                      <ProtectedRoute allowedRoles={["RACE_REFEREE"]}>
                        <RefereePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Spectator Nested Dashboard Layout */}
                  <Route
                    path="/spectators/*"
                    element={
                      <ProtectedRoute allowedRoles={["SPECTATOR", "HORSE_OWNER", "JOCKEY", "RACE_REFEREE"]}>
                        <SpectatorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Standalone Admin Dashboard Suite */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Payment Route */}
                  <Route
                    path="/payment-qr"
                    element={
                      <ProtectedRoute allowedRoles={["HORSE_OWNER", "JOCKEY"]}>
                        <PaymentQRPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/payment-success" element={<PaymentCallback />} />
                  <Route path="/payment-cancel" element={<PaymentCallback />} />

                  {/* Public and Protected Routes enclosed in MainLayout */}
                  <Route element={<MainLayout />}>
                    {/* Landing Dashboard */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/tournaments" element={<SpectatorTournaments />} />
                    <Route path="/live" element={<SpectatorLiveSimulationPage />} />
                  </Route>

                  {/* Catch-all fallback redirecting to root */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </PageTransition>

            {customAlert && (
              <div className="custom-alert-overlay" onClick={() => setCustomAlert(null)}>
                <div className="custom-alert-box" onClick={(e) => e.stopPropagation()}>
                  <h3 className="custom-alert-title">Notification</h3>
                  <p className="custom-alert-message">{customAlert}</p>
                  <button className="custom-alert-btn" onClick={() => setCustomAlert(null)}>
                    Close
                  </button>
                </div>
              </div>
            )}

            <FloatingAiChat />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
