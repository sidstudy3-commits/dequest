import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
 
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LearningTracker from './pages/LearningTracker';
import Projects from './pages/Projects';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import ResourceVault from './pages/ResourceVault';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
 
// Global Components
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import AchievementToast from './components/AchievementToast';
 
const ProtectedLayout = ({ children, onAchievementUnlock }) => {
  const { user, loading } = useAuth();
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonPurple"></div>
      </div>
    );
  }
 
  if (!user) {
    return <Navigate to="/login" replace />;
  }
 
  // Inject dark class on body if configured on profile
  if (user.darkMode !== false) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
 
  return (
    <AIProvider>
      <div className="flex gap-6 p-4 min-h-screen relative overflow-hidden bg-slate-50 dark:bg-darkBg transition-colors duration-300">
        {/* Decorative Grid Backing */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0"></div>
       
        {/* Sidebar Nav */}
        <Sidebar />
 
        {/* Content Box */}
        <main className="flex-1 overflow-y-auto px-4 py-2 z-10 relative">
          {children}
        </main>
 
        {/* Global AI Helper Drawer */}
        <AIAssistant />
      </div>
    </AIProvider>
  );
};
 
const App = () => {
  const { user } = useAuth();
  const [activeToast, setActiveToast] = useState(null);
 
  const handleAchievementUnlock = (achievement) => {
    setActiveToast(achievement);
  };
 
  const handleCloseToast = () => {
    setActiveToast(null);
  };
 
  return (
    <BrowserRouter>
      {/* Floating Milestone Notification Toast */}
      {activeToast && (
        <AchievementToast
          achievement={activeToast}
          onClose={handleCloseToast}
        />
      )}
 
      <Routes>
        {/* Guest Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />
 
        {/* Secure Workspace Routes */}
        <Route
          path="/"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/learning"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <LearningTracker onAchievementUnlock={handleAchievementUnlock} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <Projects onAchievementUnlock={handleAchievementUnlock} />
            </ProtectedLayout>
          }
        /> 
        <Route
          path="/journal"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <Journal onAchievementUnlock={handleAchievementUnlock} />
            </ProtectedLayout> 
          }
        />
        <Route 
          path="/goals"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <Goals onAchievementUnlock={handleAchievementUnlock} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <ResourceVault />
            </ProtectedLayout>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <Achievements />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout onAchievementUnlock={handleAchievementUnlock}>
              <Settings />
            </ProtectedLayout>
          }
        />
 
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
 
export default App;
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0"></div>
