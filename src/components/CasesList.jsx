import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CasesList() {
  const { cases, clients, addCase, updateCaseStatus, deleteCase, currentUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form Fields
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [court, setCourt] = useState('');
  const [type, setType] = useState('Civil');

  // Permission Checks: Accountant is read-only
  const isReadOnly = currentUser?.role === 'Accountant';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caseNumber || !title || !clientId || !court || !type) {
      alert('Please fill in all fields');
      return;
    }
    addCase(caseNumber, title, clientId, court, type);
    setShowAddForm(false);
    // Reset Form
    setCaseNumber('');
    setTitle('');
    setClientId('');
    setCourt('');
    setType('Civil');
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>
      <div className="panel-header">
        <h3 className="panel-title">📁 Lawsuits & Case Portfolios</h3>
        {!isReadOnly && (
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
            onClick={() => setShowAddForm(true)}
            id="add-case-btn"
          >
            + Register New Case
          </button>
        )}
      </div>

      {isReadOnly && (
        <div style={{ padding: '8px 12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> <strong>Read-Only Access:</strong> Case registrations and status changes are managed by Advocates and Staff.
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by case #, title or client name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '240px', paddingLeft: '16px' }}
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

      {/* Cases Table */}
      <div className="table-container">
        {filteredCases.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching case records found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>CNR / Case ID</th>
                <th>Case Title</th>
                <th>Client Name</th>
                <th>Subject Type</th>
                <th>Jurisdiction Court</th>
                <th>Current Status</th>
                {!isReadOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600' }}>{c.caseNumber}</td>
                  <td>{c.title}</td>
                  <td>{c.clientName}</td>
                  <td><span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>{c.type}</span></td>
                  <td>{c.court}</td>
                  <td>
                    {isReadOnly ? (
                      <span className={`badge ${c.status}`}>{c.status}</span>
                    ) : (
                      <select
                        value={c.status}
                        onChange={(e) => updateCaseStatus(c.id, e.target.value)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        id={`status-select-${c.id}`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon delete" 
                          onClick={() => deleteCase(c.id)}
                          title="Remove Case Portfolio"
                          id={`delete-case-${c.id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Case Modal Form */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 className="modal-title">📁 Register New Case Portfolio</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">CNR / Case Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SC/2026/1024"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    id="new-case-number"
                  />
                  <span className="input-icon">🆔</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Case Title</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mehta vs. Tech Solutions"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    id="new-case-title"
                  />
                  <span className="input-icon">💼</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Client</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-case-client"
                  >
                    <option value="">-- Choose Client Profile --</option>
                    {clients.map(cl => (
                      <option key={cl.id} value={cl.id}>{cl.name} ({cl.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Presiding Court / Jurisdiction</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Delhi High Court"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    id="new-case-court"
                  />
                  <span className="input-icon">🏛️</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Case Category</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-case-type"
                  >
                    <option value="Civil">Civil Lawsuit</option>
                    <option value="Criminal">Criminal Brief</option>
                    <option value="Commercial">Commercial Dispute</option>
                    <option value="Property">Property Settlement</option>
                    <option value="Family">Family / Divorce Appeal</option>
                    <option value="Taxation">Taxation Tribunal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
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
