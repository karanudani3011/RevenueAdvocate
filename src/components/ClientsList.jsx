import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ClientsList() {
  const { clients, addClient, deleteClient } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      alert('Please fill in all fields');
      return;
    }
    addClient(name, email, phone, address);
    setShowAddForm(false);
    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>
      <div className="panel-header">
        <h3 className="panel-title">👥 Client Management Directory</h3>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setShowAddForm(true)}
          id="add-client-btn"
        >
          + Add New Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by client name, email or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', paddingLeft: '16px' }}
          id="search-clients-input"
        />
      </div>

      {/* Clients Table */}
      <div className="table-container">
        {filteredClients.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching client records found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Residential / Office Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon delete" 
                        onClick={() => deleteClient(c.id)}
                        title="Remove Client"
                        id={`delete-client-${c.id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Client Modal Form */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 className="modal-title">👥 Register Client Profile</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="new-client-name"
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. client@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="new-client-email"
                  />
                  <span className="input-icon">📧</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +91 99999 88888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="new-client-phone"
                  />
                  <span className="input-icon">📞</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Office / Residential Address</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Residential address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    id="new-client-address"
                  />
                  <span className="input-icon">🏠</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-client-submit">
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
