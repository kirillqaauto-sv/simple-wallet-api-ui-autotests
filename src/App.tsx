import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LogOut, Wallet, ArrowRightLeft, LayoutDashboard, PiggyBank, User as UserIcon, Settings } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransferPage from './pages/TransferPage';
import SavingsPage from './pages/SavingsPage';
import ProfilePage from './pages/ProfilePage';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Загрузка...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginPage onLogin={fetchUser} />} 
            />
            
            <Route 
              path="/" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <DashboardPage user={user} onUpdate={fetchUser} />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            <Route 
              path="/transfer" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <TransferPage user={user} onUpdate={fetchUser} />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            <Route 
              path="/savings" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <SavingsPage user={user} onUpdate={fetchUser} />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            <Route 
              path="/profile" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <ProfilePage user={user} onUpdate={fetchUser} />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

function Layout({ children, user, onLogout }: { children: React.ReactNode, user: User, onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="main-layout flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 p-6">
        <div className="brand flex items-center gap-3 mb-10">
          <div className="logo-icon bg-blue-600 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="brand-name text-xl font-bold tracking-tight">Simple Wallet</h1>
        </div>

        <nav className="navigation space-y-2">
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Обзор" id="nav-dashboard" />
          <NavLink to="/transfer" icon={<ArrowRightLeft size={20} />} label="Перевод" id="nav-transfer" />
          <NavLink to="/savings" icon={<PiggyBank size={20} />} label="Копилка" id="nav-savings" />
          <NavLink to="/profile" icon={<UserIcon size={20} />} label="Профиль" id="nav-profile" />
        </nav>

        <div className="user-section mt-auto pt-10">
          <div className="user-card p-4 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
            <p className="label text-xs text-zinc-500 mb-1">Пользователь</p>
            <p className="username font-medium truncate">{user.username}</p>
          </div>
          <button
            onClick={() => { onLogout(); navigate('/login'); }}
            className="logout-button flex items-center gap-3 w-full p-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-area flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ to, icon, label, id }: { to: string, icon: React.ReactNode, label: string, id: string }) {
  return (
    <Link
      to={to}
      id={id}
      className={`nav-link-${id} flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
