import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ClientsList from './components/ClientsList';
import CasesList from './components/CasesList';
import HearingsList from './components/HearingsList';
import PaymentsList from './components/PaymentsList';

function AppContent() {
  const { currentUser } = useApp();
  const [authView, setAuthView] = useState('login'); // 'login' | 'forgot'
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'clients' | 'cases' | 'hearings' | 'finance'

  // Auth Guard
  if (!currentUser) {
    if (authView === 'forgot') {
      return <ForgotPassword onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateToForgot={() => setAuthView('forgot')} />;
  }

  return (
    <div className="dashboard-layout">
      {/* Responsive Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Panel Content Area */}
      <main className="main-content">
        {/* Sticky top bar action menu */}
        <Header currentTab={currentTab} />

        {/* Tab pages routing switcher */}
        <div className="tab-pane-content" style={{ marginTop: '16px' }}>
          {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
          {currentTab === 'clients' && <ClientsList />}
          {currentTab === 'cases' && <CasesList />}
          {currentTab === 'hearings' && <HearingsList />}
          {currentTab === 'finance' && <PaymentsList />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
