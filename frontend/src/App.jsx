import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';

// Protected pages
import Dashboard from './pages/dashboard/Dashboard';
import Teams from './pages/teams/Teams';
import Tasks from './pages/tasks/Tasks';
import Messages from './pages/messages/Messages';
import Resources from './pages/resources/Resources';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="teams" element={<Teams />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="messages" element={<Messages />} />
              <Route path="resources" element={<Resources />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
