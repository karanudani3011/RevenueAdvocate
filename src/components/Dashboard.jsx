import React from 'react';
import { useApp } from '../context/AppContext';
import StatsCard from './StatsCard';
import Charts from './Charts';

export default function Dashboard({ setCurrentTab }) {
  const { clients, cases, hearings, payments, activities, currentUser } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const totalClients = clients.length;
  const activeCases = cases.filter(c => c.status === 'active').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;

  const todayHearingsCount = hearings.filter(h => h.date === todayStr).length;
  const upcomingHearingsCount = hearings.filter(h => h.date > todayStr).length;

  // Financial calculations
  const totalCredit = payments
    .filter(p => p.type === 'credit' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDebit = payments
    .filter(p => p.type === 'debit' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments
    .filter(p => p.type === 'credit' && p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const netRevenue = totalCredit - totalDebit;

  // Recent hearings (first 4 today or future)
  const sortedHearings = [...hearings]
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Metrics Row 1: Clients & Cases */}
      <div className="metrics-grid">
        <StatsCard
          title="Total Clients"
          value={totalClients}
          icon="👥"
          trend={{ type: 'up', value: '4.8%', label: 'vs last month' }}
          accentColor="var(--primary)"
          bgGlow="var(--primary-glow)"
          onClick={() => setCurrentTab('clients')}
        />
        <StatsCard
          title="Active Cases"
          value={activeCases}
          icon="📁"
          trend={{ type: 'neutral', value: 'Active', label: 'litigations' }}
          accentColor="var(--success)"
          bgGlow="var(--success-bg)"
          onClick={() => setCurrentTab('cases')}
        />
        <StatsCard
          title="Closed Cases"
          value={closedCases}
          icon="✅"
          trend={{ type: 'neutral', value: 'Settled', label: 'verdicts' }}
          accentColor="var(--text-muted)"
          bgGlow="rgba(0,0,0,0.02)"
          onClick={() => setCurrentTab('cases')}
        />
        <StatsCard
          title="Pending Cases"
          value={pendingCases}
          icon="⏳"
          trend={{ type: 'neutral', value: 'Awaiting', label: 'hearing' }}
          accentColor="var(--warning)"
          bgGlow="var(--warning-bg)"
          onClick={() => setCurrentTab('cases')}
        />
      </div>

      {/* Metrics Row 2: Financials */}
      <div className="metrics-grid">
        <StatsCard
          title="Total Credit Amount"
          value={`₹${totalCredit.toLocaleString()}`}
          icon="💰"
          trend={{ type: 'up', value: 'Receipts', label: 'earned' }}
          accentColor="var(--success)"
          bgGlow="var(--success-bg)"
          onClick={() => setCurrentTab('finance')}
        />
        <StatsCard
          title="Total Debit Amount"
          value={`₹${totalDebit.toLocaleString()}`}
          icon="💸"
          trend={{ type: 'down', value: 'Expenses', label: 'paid' }}
          accentColor="var(--danger)"
          bgGlow="var(--danger-bg)"
          onClick={() => setCurrentTab('finance')}
        />
        <StatsCard
          title="Pending Payments"
          value={`₹${pendingPayments.toLocaleString()}`}
          icon="⏳"
          trend={{ type: 'neutral', value: 'Receivables', label: 'bills' }}
          accentColor="var(--warning)"
          bgGlow="var(--warning-bg)"
          onClick={() => setCurrentTab('finance')}
        />
        <StatsCard
          title="Monthly Revenue Balance"
          value={`₹${netRevenue.toLocaleString()}`}
          icon="📈"
          trend={{ type: 'up', value: 'Net Profit', label: 'June' }}
          accentColor="var(--primary)"
          bgGlow="var(--primary-glow)"
          onClick={() => setCurrentTab('finance')}
        />
      </div>

      {/* Charts Grid */}
      <Charts cases={cases} payments={payments} />

      {/* Activities & Hearings Row */}
      <div className="panel-grid">
        {/* Recent Activities */}
        <div className="panel-card glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">🔔 Recent Activities Log</h3>
          </div>
          <div className="activities-list">
            {activities.slice(0, 8).map(act => (
              <div key={act.id} className="activity-item">
                <div className="activity-icon">
                  {act.type === 'auth' && '👤'}
                  {act.type === 'case' && '📁'}
                  {act.type === 'hearing' && '🏛️'}
                  {act.type === 'payment' && '💰'}
                  {act.type === 'client' && '👥'}
                  {act.type === 'general' && '📢'}
                </div>
                <div className="activity-details">
                  <span className="activity-text">{act.text}</span>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
