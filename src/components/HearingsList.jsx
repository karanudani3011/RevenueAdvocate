import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function HearingsList() {
  const { hearings, cases, addHearing, deleteHearing, currentUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [judge, setJudge] = useState('');

  // Check roles: Accountant is read-only
  const isReadOnly = currentUser?.role === 'Accountant';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caseId || !date || !time || !room || !judge) {
      alert('Please fill in all fields');
      return;
    }
    addHearing(caseId, date, time, room, judge);
    setShowAddForm(false);
    // Reset fields
    setCaseId('');
    setDate('');
    setTime('');
    setRoom('');
    setJudge('');
  };

  // Group hearings: Today vs Upcoming
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHearings = hearings.filter(h => h.date === todayStr);
  const upcomingHearings = hearings.filter(h => h.date > todayStr).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="panel-card glass-panel animated-slideup">
      <div className="panel-header">
        <h3 className="panel-title">🏛️ Hearings & Briefs Schedule</h3>
        {!isReadOnly && (
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
            onClick={() => setShowAddForm(true)}
            id="add-hearing-btn"
          >
            + Schedule Hearing
          </button>
        )}
      </div>

      {isReadOnly && (
        <div style={{ padding: '8px 12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> <strong>Read-Only Access:</strong> You can view scheduled hearings, but rescheduling or creating them is restricted to Advocates/Office Staff.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Today's hearings */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary)' }}>Today's Briefings</h4>
          {todayHearings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hearings scheduled for today.</p>
          ) : (
            <div className="hearings-list">
              {todayHearings.map(h => (
                <div key={h.id} className="hearing-timeline-item">
                  <div className="hearing-time-badge" style={{ '--timeline-color': 'var(--danger)' }}>
                    📢
                  </div>
                  <div className="hearing-content" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <div className="hearing-title-row">
                      <span className="hearing-case-name">{h.caseName}</span>
                      <span className="hearing-status-tag" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>TODAY</span>
                    </div>
                    <div className="hearing-details-row">
                      <span>🕒 <strong>Time:</strong> {h.time}</span>
                      <span>📍 <strong>Court:</strong> {h.room}</span>
                      <span>⚖️ <strong>Judge:</strong> {h.judge}</span>
                    </div>
                    {!isReadOnly && (
                      <button 
                        className="btn-icon delete" 
                        onClick={() => deleteHearing(h.id)} 
                        style={{ marginTop: '8px' }}
                        title="Cancel Hearing"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming hearings */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--success)' }}>Upcoming Sessions</h4>
          {upcomingHearings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming hearings listed.</p>
          ) : (
            <div className="hearings-list">
              {upcomingHearings.map(h => (
                <div key={h.id} className="hearing-timeline-item">
                  <div className="hearing-time-badge" style={{ '--timeline-color': 'var(--success)' }}>
                    🗓️
                  </div>
                  <div className="hearing-content">
                    <div className="hearing-title-row">
                      <span className="hearing-case-name">{h.caseName}</span>
                      <span className="hearing-status-tag" style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: '9px' }}>{h.date}</span>
                    </div>
                    <div className="hearing-details-row">
                      <span>🕒 <strong>Time:</strong> {h.time}</span>
                      <span>📍 <strong>Court:</strong> {h.room}</span>
                      <span>⚖️ <strong>Judge:</strong> {h.judge}</span>
                    </div>
                    {!isReadOnly && (
                      <button 
                        className="btn-icon delete" 
                        onClick={() => deleteHearing(h.id)} 
                        style={{ marginTop: '8px' }}
                        title="Cancel Hearing"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Hearing Modal Overlay */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 className="modal-title">🗓️ Schedule Court Hearing</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Case</label>
                <div className="input-wrapper">
                  <select 
                    className="form-input" 
                    value={caseId} 
                    onChange={(e) => setCaseId(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-hearing-case"
                  >
                    <option value="">-- Choose Case Portfolio --</option>
                    {cases.filter(c => c.status === 'active').map(c => (
                      <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hearing Date</label>
                <div className="input-wrapper">
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    id="new-hearing-date"
                  />
                  <span className="input-icon">📅</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 10:30 AM" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    id="new-hearing-time"
                  />
                  <span className="input-icon">🕒</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Courtroom / Room</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Courtroom 3, Supreme Court" 
                    value={room} 
                    onChange={(e) => setRoom(e.target.value)}
                    id="new-hearing-room"
                  />
                  <span className="input-icon">📍</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Presiding Judge</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Justice Name" 
                    value={judge} 
                    onChange={(e) => setJudge(e.target.value)}
                    id="new-hearing-judge"
                  />
                  <span className="input-icon">⚖️</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-hearing-submit">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
