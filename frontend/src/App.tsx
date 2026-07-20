import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Navigation } from './components/Navigation';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ResourceHub } from './pages/ResourceHub';
import { AIAssistant } from './pages/AIAssistant';
import { PlacementPortal } from './pages/PlacementPortal';
import { MockInterview } from './pages/MockInterview';
import { Events } from './pages/Events';
import { StudyGroups } from './pages/StudyGroups';
import { SocialFeed } from './pages/SocialFeed';
import { NoticeBoard } from './pages/NoticeBoard';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { FinanceTypographyDemo } from './pages/FinanceTypographyDemo';

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b10]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b10]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/finance-typography-demo" element={<FinanceTypographyDemo />} />
        
        {/* Protected Dashboard Layout routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Navigation>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/resources" element={<ResourceHub />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="/placements" element={<PlacementPortal />} />
                  <Route path="/mock-interview" element={<MockInterview />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/study-groups" element={<StudyGroups />} />
                  <Route path="/feed" element={<SocialFeed />} />
                  <Route path="/notices" element={<NoticeBoard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Navigation>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
