import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const TYPE_COLORS = {
  Civil:      { bg: 'rgba(37,99,235,0.12)',   color: '#2563eb' },
  Criminal:   { bg: 'rgba(239,68,68,0.12)',    color: '#ef4444' },
  Commercial: { bg: 'rgba(139,92,246,0.12)',   color: '#8b5cf6' },
  Property:   { bg: 'rgba(245,158,11,0.12)',   color: '#f59e0b' },
  Family:     { bg: 'rgba(236,72,153,0.12)',   color: '#ec4899' },
  Taxation:   { bg: 'rgba(16,185,129,0.12)',   color: '#10b981' },
  Labor:      { bg: 'rgba(249,115,22,0.12)',   color: '#f97316' },
};

const STATUS_COLORS = {
  active:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  pending: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  closed:  { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Generates a stable pseudo-random date from a case id string
const fallbackDate = (seed) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const day   = (hash % 28) + 1;
  const month = months[(hash >> 4) % 12];
  const year  = 2024 + ((hash >> 8) % 3);
  return `${String(day).padStart(2,'0')} ${month} ${year}`;
};

const getDate = (c) =>
  c.date ? formatDate(c.date) : fallbackDate(c.id);

export default function CasesList() {
  const { cases, clients, addCase, updateCaseStatus, deleteCase, currentUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle]           = useState('');
  const [clientId, setClientId]     = useState('');
  const [court, setCourt]           = useState('');
  const [type, setType]             = useState('Civil');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);

  const isReadOnly = currentUser?.role === 'Accountant';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caseNumber || !title || !clientId || !type || !date) {
      alert('Please fill in all required fields');
      return;
    }
    addCase(caseNumber, title, clientId, court, type, date);
    setShowAddForm(false);
    setCaseNumber(''); setTitle(''); setClientId('');
    setCourt(''); setType('Civil');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="panel-header">
        <h3 className="panel-title">📁 Lawsuits &amp; Case Portfolios</h3>
        {!isReadOnly && (
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '6px 16px', fontSize: '13px' }}
            onClick={() => setShowAddForm(true)}
            id="add-case-btn"
          >
            + Register New Case
          </button>
        )}
      </div>

      {isReadOnly && (
        <div style={{ padding: '8px 12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> <strong>Read-Only Access:</strong> Case registrations and status changes are managed by Advocates.
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by case ID, title, type or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '220px', paddingLeft: '16px' }}
          id="search-cases-input"
        />
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '160px', paddingLeft: '16px' }}
          id="filter-cases-status"
        >
          <option value="all">All Cases</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredCases.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching case records found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Case Date</th>
                <th>Case Title</th>
                <th>Type</th>
                <th>Client Name</th>
                <th>Filing Date</th>
                <th>Status</th>
                {!isReadOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, index) => {
                const typeStyle   = TYPE_COLORS[c.type]    || { bg: 'var(--primary-glow)', color: 'var(--primary)' };
                const statusStyle = STATUS_COLORS[c.status] || { bg: 'var(--primary-glow)', color: 'var(--primary)' };
                return (
                  <tr key={c.id}>

                    {/* Case ID — sequential number */}
                    <td>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--primary)' }}>
                        {index + 1}
                      </div>
                    </td>

                    {/* Case Date */}
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {getDate(c)}
                    </td>

                    {/* Case Title */}
                    <td style={{ fontWeight: '500', maxWidth: '220px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title}
                      </span>
                    </td>

                    {/* Type */}
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: typeStyle.bg,
                        color: typeStyle.color,
                        whiteSpace: 'nowrap'
                      }}>
                        {c.type}
                      </span>
                    </td>

                    {/* Client Name */}
                    <td style={{ fontWeight: '500' }}>{c.clientName}</td>

                    {/* Filing Date */}
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {getDate(c)}
                    </td>

                    {/* Status */}
                    <td>
                      {isReadOnly ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: 'capitalize'
                        }}>
                          {c.status}
                        </span>
                      ) : (
                        <select
                          value={c.status}
                          onChange={(e) => updateCaseStatus(c.id, e.target.value)}
                          style={{
                            background: statusStyle.bg,
                            border: `1px solid ${statusStyle.color}50`,
                            color: statusStyle.color,
                            borderRadius: '20px',
                            padding: '3px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          id={`status-select-${c.id}`}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="closed">Closed</option>
                        </select>
                      )}
                    </td>

                    {/* Actions */}
                    {!isReadOnly && (
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon delete"
                            onClick={() => deleteCase(c.id)}
                            title="Delete Case"
                            id={`delete-case-${c.id}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Case Modal */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)', maxWidth: '560px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">📁 Register New Case</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Case ID / CNR Number *</label>
                  <div className="input-wrapper">
                    <input type="text" className="form-input" placeholder="e.g. SC/2026/1024"
                      value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} id="new-case-number" />
                    <span className="input-icon">🆔</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Case Date / Filing Date *</label>
                  <div className="input-wrapper">
                    <input type="date" className="form-input" value={date}
                      onChange={(e) => setDate(e.target.value)} id="new-case-date"
                      style={{ paddingLeft: '16px' }} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Case Title *</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input" placeholder="e.g. Mehta vs. Tech Solutions"
                    value={title} onChange={(e) => setTitle(e.target.value)} id="new-case-title" />
                  <span className="input-icon">💼</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Client *</label>
                  <div className="input-wrapper">
                    <select className="form-input" value={clientId}
                      onChange={(e) => setClientId(e.target.value)} style={{ paddingLeft: '16px' }} id="new-case-client">
                      <option value="">-- Select Client --</option>
                      {clients.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Case Type *</label>
                  <div className="input-wrapper">
                    <select className="form-input" value={type}
                      onChange={(e) => setType(e.target.value)} style={{ paddingLeft: '16px' }} id="new-case-type">
                      <option value="Civil">Civil Lawsuit</option>
                      <option value="Criminal">Criminal Brief</option>
                      <option value="Commercial">Commercial Dispute</option>
                      <option value="Property">Property Settlement</option>
                      <option value="Family">Family / Divorce Appeal</option>
                      <option value="Taxation">Taxation Tribunal</option>
                      <option value="Labor">Labour Dispute</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Presiding Court / Jurisdiction</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input" placeholder="e.g. Delhi High Court"
                    value={court} onChange={(e) => setCourt(e.target.value)} id="new-case-court" />
                  <span className="input-icon">🏛️</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-case-submit">
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
