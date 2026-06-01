import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'club_coordinator' | 'admin';
  roll_number?: string;
  department?: string;
  year?: number;
  semester?: number;
  skills: string; // JSON string
  projects_info: string; // JSON string
  certifications: string; // JSON string
  social_links: string; // JSON string
  resume_url?: string;
  profile_photo_url?: string;
  xp: number;
  level: number;
  registrations?: any[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8000/api/v1';

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Auto-detect JSON vs FormData
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'API request failed');
    }

    // Handle file downloads or text response vs json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await apiFetch('/auth/me');
      setUser(profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Invalid login details');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const registerUser = async (data: any) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }
      // Automate login after signup
      await login(data.email, data.password);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updated = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setUser(updated);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerUser,
        logout,
        updateProfile,
        refreshUser,
        apiFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
