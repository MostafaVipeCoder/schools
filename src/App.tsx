import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import LoadingSpinner from './components/ui/loading-spinner';
import ErrorBoundary from './components/ui/error-boundary';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Lazy load components
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgetPassword = lazy(() => import('./components/auth/ForgetPassword'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));

// Eager load dashboard components for smoother navigation
import DashboardLayout from './components/dashboard/DashboardLayout';
import Students from './components/dashboard/Students';
import Classes from './components/dashboard/Classes';
import Grades from './components/dashboard/Grades';
import Payments from './components/dashboard/Payments';
import Reports from './components/dashboard/Reports';
import QRScanner from './components/dashboard/QRScanner';
import ClassDetails from './components/dashboard/ClassDetails';
import StudentProfile from './components/dashboard/StudentProfile';
import Settings from './components/dashboard/Settings';
import { Toaster } from './components/ui/sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        // Basic check for verification - in production check email_confirmed_at
        setIsVerified(!!session.user.email_confirmed_at);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setIsVerified(!!session.user.email_confirmed_at);
      } else {
        setUserEmail('');
        setIsVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handlers now largely handled by onAuthStateChange, but keeping for compatibility if needed
  // or simple wrappers. 

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // State updates handled by onAuthStateChange
      localStorage.clear(); // Clear local storage leftovers
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleVerify = () => {
    // This might be manual override or refresh
    setIsVerified(true);
  };

  const handleLogin = (email: string) => {
    // Deprecated: handled by supabase auth state listener
    console.log('Login callback triggered for:', email);
  };

  // Note: handleLogin is no longer needed as Login component calls supabase directly
  // But we keep it empty or remove if routes don't validly need it. 
  // The Login component prop onLogin can be optional or ignored.

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            <Route
              path="/login"
              element={
                isAuthenticated ?
                  <Navigate to="/dashboard" /> :
                  <Login onLogin={handleLogin} />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ?
                  <Navigate to="/dashboard" /> :
                  <Register onRegister={handleLogin} />
              }
            />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route
              path="/verify-email"
              element={
                <VerifyEmail
                  email={userEmail}
                  onVerify={handleVerify}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Students />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/students"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Students />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/classes"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Classes />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/grades"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Grades />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/payments"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Payments />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/reports"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Reports />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/qr-scanner"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <QRScanner />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/students/:id"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <StudentProfile />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/classes/:id"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <ClassDetails />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                isAuthenticated ?
                  <DashboardLayout
                    onLogout={handleLogout}
                    isVerified={isVerified}
                    userEmail={userEmail}
                    onVerify={handleVerify}
                  >
                    <Settings />
                  </DashboardLayout> :
                  <Navigate to="/login" />
              }
            />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}

export default App;
