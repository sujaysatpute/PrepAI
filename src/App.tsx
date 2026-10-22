import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

// Components
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import RoleSelection from './pages/RoleSelection';
import InterviewSetup from './pages/InterviewSetup';
import InterviewScreen from './pages/InterviewScreen';
import ResultScreen from './pages/ResultScreen';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Context & Utils
import { AuthProvider, useAuth } from './context/AuthContext';
import { Role } from './utils/types';
import { getStoredRole, setStoredRole } from './utils/storage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <motion.div 
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -8 }} 
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const location = useLocation();
  const [selectedRole, setSelectedRoleState] = useState<Role | null>(() => getStoredRole());

  const setSelectedRole = (role: Role | null) => {
    setSelectedRoleState(role);
    setStoredRole(role);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            
            <Route path="/practice" element={
              <ProtectedRoute>
                <PageWrapper><RoleSelection setSelectedRole={setSelectedRole} /></PageWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/setup" element={
              <ProtectedRoute>
                <PageWrapper><InterviewSetup selectedRole={selectedRole} /></PageWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/interview" element={
              <ProtectedRoute>
                <PageWrapper><InterviewScreen selectedRole={selectedRole} /></PageWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/results" element={
              <ProtectedRoute>
                <PageWrapper><ResultScreen /></PageWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageWrapper><Dashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/progress" element={
              <ProtectedRoute>
                <PageWrapper><Progress /></PageWrapper>
              </ProtectedRoute>
            } />

            {/* 404 Catch-All */}
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
