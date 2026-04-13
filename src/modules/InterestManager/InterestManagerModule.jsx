import React, { useState } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Wallet,
  Calculator,
  History, 
  Settings, 
  ChevronLeft,
  Search,
  Bell,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import './styles/InterestManager.css';

import Dashboard from './Dashboard';
import ContactList from './pages/Contacts/ContactList';
import LoanList from './pages/Loans/LoanList';
import PaymentList from './pages/Payments/PaymentList';
import TransactionHistory from './pages/Transactions/TransactionHistory';
import LoanCalculator from './pages/Calculator/LoanCalculator';
import TrashBin from './pages/TrashBin/TrashBin';
import SettingsView from './pages/Settings/SettingsView';

const NavigationSidebar = ({ onBack, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/contacts', label: 'Contacts', icon: <Users size={20} /> },
    { path: '/loans', label: 'Loans', icon: <Wallet size={20} /> },
    { path: '/payments', label: 'Payments', icon: <History size={20} /> },
    { path: '/transactions', label: 'Transactions History', icon: <History size={20} /> },
    { path: '/calculator', label: 'Calculator', icon: <Calculator size={20} /> },
    { path: '/trash', label: 'Trash Bin', icon: <Trash2 size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`im-sidebar glass-card transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div className="p-6 border-b border-white/10" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 className="im-title text-xl text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Interest Manager
          </h1>
          <button onClick={onBack} className="im-btn-ghost p-2 rounded-full hidden md:block hover:bg-white/10 transition-colors" title="Exit Module">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="im-btn-ghost p-2 rounded-full md:hidden">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 scrollbar-hide" style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          <nav className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`im-btn flex items-center gap-3 w-full justify-start transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
              OP
            </div>
            <div>
              <p className="text-sm font-medium text-white">Guest User</p>
              <p className="text-xs text-white/50 cursor-pointer hover:text-white transition">Offline Mode</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsMobileMenuOpen }) => {
  return (
    <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="im-title text-2xl md:text-3xl text-white">Overview</h2>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts, loans..." 
            className="im-input pl-10 w-48 lg:w-64 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>
        
        <button className="relative p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};

const AnimatedRoute = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const AppLayout = ({ onBack }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="im-suite" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <NavigationSidebar 
        onBack={onBack} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', width: '100%' }}>
        <div style={{ padding: '32px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
          
          <Routes>
            <Route path="/" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
            <Route path="/contacts/*" element={<AnimatedRoute><ContactList /></AnimatedRoute>} />
            <Route path="/loans/*" element={<AnimatedRoute><LoanList /></AnimatedRoute>} />
            <Route path="/payments/*" element={<AnimatedRoute><PaymentList /></AnimatedRoute>} />
            <Route path="/transactions/*" element={<AnimatedRoute><TransactionHistory /></AnimatedRoute>} />
            <Route path="/calculator" element={<AnimatedRoute><LoanCalculator /></AnimatedRoute>} />
            <Route path="/settings" element={<AnimatedRoute><SettingsView /></AnimatedRoute>} />
            <Route path="/trash" element={<AnimatedRoute><TrashBin /></AnimatedRoute>} />
            <Route path="*" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const InterestManagerModule = ({ onBack }) => {
  return (
    <MemoryRouter>
      <AppLayout onBack={onBack} />
    </MemoryRouter>
  );
};

export default InterestManagerModule;
