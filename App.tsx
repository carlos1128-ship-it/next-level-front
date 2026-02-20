import React, { useEffect, useState, createContext, useContext, ReactNode, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Integrations from './pages/Integrations';
import Companies from './pages/Companies';
import LoginPage from './pages/LoginPage';
import { ToastProvider } from './components/Toast';
import { useDetailLevel } from './src/hooks/useDetailLevel';
import { useTheme } from './src/hooks/useTheme';
import type { DetailLevel } from './src/types/domain';
import { getCompanies, getUserProfile } from './src/services/endpoints';
import type { Company } from './src/types/domain';

// Lazy load pages with heavy dependencies
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Insights = lazy(() => import('./pages/Insights'));
const FinancialFlow = lazy(() => import('./pages/FinancialFlow'));
const Plans = lazy(() => import('./pages/Plans'));

// Authentication Context
interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  email: string | null;
  selectedCompanyId: string | null;
  detailLevel: DetailLevel;
  theme: 'dark' | 'light';
  setSelectedCompanyId: (value: string | null) => void;
  setDetailLevel: (value: DetailLevel) => void;
  setTheme: (value: 'dark' | 'light') => void;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const COMPANY_ID_STORAGE_KEY = "selectedCompanyId";
const getCompanyId = (company: Partial<Company> | null | undefined) => company?.id || company?._id || null;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')));
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string | null>(
    localStorage.getItem(COMPANY_ID_STORAGE_KEY)
  );
  const { detailLevel, setDetailLevel } = useDetailLevel();
  const { theme, setTheme } = useTheme();

  const setSelectedCompanyId = (value: string | null) => {
    setSelectedCompanyIdState(value);
    if (value) {
      localStorage.setItem(COMPANY_ID_STORAGE_KEY, value);
      return;
    }
    localStorage.removeItem(COMPANY_ID_STORAGE_KEY);
  };

  const login = (name: string) => {
    setIsLoggedIn(true);
    setUsername(name);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setEmail(null);
    setSelectedCompanyId(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    getUserProfile()
      .then((profile) => {
        if (profile?.name) setUsername(profile.name);
        if (profile?.email) setEmail(profile.email);
        if (profile?.detailLevel) setDetailLevel(profile.detailLevel);
        if (profile?.theme) setTheme(profile.theme);
      })
      .catch(() => {
        // ignore profile bootstrap errors to avoid blocking app load
      });
  }, [isLoggedIn, setDetailLevel, setTheme]);

  useEffect(() => {
    if (!isLoggedIn) return;
    getCompanies()
      .then((companies) => {
        const list = Array.isArray(companies) ? companies : [];
        if (!list.length) {
          setSelectedCompanyId(null);
          return;
        }

        const existing = list.find((company) => getCompanyId(company) === selectedCompanyId);
        if (existing) return;
        setSelectedCompanyId(getCompanyId(list[0]));
      })
      .catch(() => {
        // ignore company bootstrap errors to avoid blocking app load
      });
  }, [isLoggedIn]);

  const value = {
    isLoggedIn,
    username,
    email,
    selectedCompanyId,
    detailLevel,
    theme,
    setSelectedCompanyId,
    setDetailLevel,
    setTheme,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const token = localStorage.getItem('token');
  const { isLoggedIn } = useAuth();
  return isLoggedIn && token ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isLoggedIn } = useAuth();

  return (
    <HashRouter>
      <Suspense fallback={
        <div className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#B6FF00] text-neon tracking-widest animate-pulse">
              NEXT LEVEL
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-xs tracking-widest uppercase">Pronto para avançar</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            }
          />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Layout><Integrations /></Layout></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Layout><Companies /></Layout></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Layout><Insights /></Layout></ProtectedRoute>} />
          <Route path="/financial-flow" element={<ProtectedRoute><Layout><FinancialFlow /></Layout></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Layout><Plans /></Layout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;

