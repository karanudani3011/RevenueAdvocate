import React from 'react';
import { useApp } from '../context/AppContext';
import StatsCard from './StatsCard';
import Charts from './Charts';

export default function Dashboard({ setCurrentTab }) {
  const { clients, cases, hearings, payments, activities, currentUser } = useApp();

  const isStaff = currentUser?.role === 'Office Staff';
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

      {/* Metrics Row 2: Hearings & Financials */}
      <div className="metrics-grid">
        <StatsCard
          title="Today's Hearings"
          value={todayHearingsCount}
          icon="🏛️"
          trend={{ type: 'up', value: 'Urgent', label: 'listed today' }}
          accentColor="var(--danger)"
          bgGlow="var(--danger-bg)"
          onClick={() => setCurrentTab('hearings')}
        />
        <StatsCard
          title="Upcoming Hearings"
          value={upcomingHearingsCount}
          icon="🗓️"
          trend={{ type: 'neutral', value: 'Future', label: 'calendared' }}
          accentColor="var(--accent)"
          bgGlow="var(--accent-bg)"
          onClick={() => setCurrentTab('hearings')}
        />
        
        {/* Financial cards (blurred for Office Staff) */}
        <StatsCard
          title="Total Credit Amount"
          value={isStaff ? '₹ ••••••' : `₹${totalCredit.toLocaleString()}`}
          icon={isStaff ? '🔒' : '💰'}
          trend={isStaff ? { type: 'neutral', value: 'Restricted', label: '' } : { type: 'up', value: 'Receipts', label: 'earned' }}
          accentColor={isStaff ? 'var(--text-muted)' : 'var(--success)'}
          bgGlow={isStaff ? 'rgba(0,0,0,0.01)' : 'var(--success-bg)'}
          onClick={isStaff ? null : () => setCurrentTab('finance')}
        />
        <StatsCard
          title="Total Debit Amount"
          value={isStaff ? '₹ ••••••' : `₹${totalDebit.toLocaleString()}`}
          icon={isStaff ? '🔒' : '💸'}
          trend={isStaff ? { type: 'neutral', value: 'Restricted', label: '' } : { type: 'down', value: 'Expenses', label: 'paid' }}
          accentColor={isStaff ? 'var(--text-muted)' : 'var(--danger)'}
          bgGlow={isStaff ? 'rgba(0,0,0,0.01)' : 'var(--danger-bg)'}
          onClick={isStaff ? null : () => setCurrentTab('finance')}
        />
      </div>

      {/* Extra Financial Row */}
      <div className="metrics-grid">
        <StatsCard
          title="Pending Payments"
          value={isStaff ? '₹ ••••••' : `₹${pendingPayments.toLocaleString()}`}
          icon={isStaff ? '🔒' : '⏳'}
          trend={isStaff ? { type: 'neutral', value: 'Restricted', label: '' } : { type: 'neutral', value: 'Receivables', label: 'bills' }}
          accentColor={isStaff ? 'var(--text-muted)' : 'var(--warning)'}
          bgGlow={isStaff ? 'rgba(0,0,0,0.01)' : 'var(--warning-bg)'}
          onClick={isStaff ? null : () => setCurrentTab('finance')}
        />
        <StatsCard
          title="Monthly Revenue Balance"
          value={isStaff ? '₹ ••••••' : `₹${netRevenue.toLocaleString()}`}
          icon={isStaff ? '🔒' : '📈'}
          trend={isStaff ? { type: 'neutral', value: 'Restricted', label: '' } : { type: 'up', value: 'Net Profit', label: 'June' }}
          accentColor={isStaff ? 'var(--text-muted)' : 'var(--primary)'}
          bgGlow={isStaff ? 'rgba(0,0,0,0.01)' : 'var(--primary-glow)'}
          onClick={isStaff ? null : () => setCurrentTab('finance')}
        />
      </div>

      {/* Charts Grid */}
      {isStaff ? (
        <div className="chart-card glass-panel" style={{ padding: '60px', textAlign: 'center', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '32px' }}>🔒</span>
          <h3 style={{ marginTop: '12px', fontSize: '16px' }}>Revenue Chart Locked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px', marginTop: '6px' }}>
            Financial visualization analytics are restricted to Accountants and Super Admins.
          </p>
        </div>
      ) : (
        <Charts cases={cases} payments={payments} />
      )}

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

        {/* Next Hearings snapshot */}
        <div className="panel-card glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">🏛️ Next Upcoming Hearings</h3>
          </div>
          <div className="activities-list">
            {sortedHearings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>No upcoming hearings registered.</p>
            ) : (
              sortedHearings.map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)', borderRadius: '8px', background: h.date === todayStr ? 'rgba(239, 68, 68, 0.02)' : 'transparent' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{h.caseName}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      ⚖️ {h.judge} | 📍 {h.room}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{
                      background: h.date === todayStr ? 'var(--danger-bg)' : 'var(--primary-glow)',
                      color: h.date === todayStr ? 'var(--danger)' : 'var(--primary)',
                      fontWeight: '700'
                    }}>
                      {h.date === todayStr ? 'TODAY' : h.date}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{h.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
