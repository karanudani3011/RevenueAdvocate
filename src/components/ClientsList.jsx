import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ClientsList() {
  const { clients, addClient, deleteClient, t } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields matching physical register
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [number, setNumber] = useState('');
  const [caseType, setCaseType] = useState('');
  const [name, setName] = useState('');
  const [courtName, setCourtName] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [advocateName, setAdvocateName] = useState('કે.પી. ઉદાણી');
  const [fee, setFee] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!regDate || !number || !caseType || !name || !courtName || !caseDetails || !advocateName || !fee) {
      alert(t('Please fill in all fields') || 'Please fill in all fields');
      return;
    }
    addClient(regDate, number, caseType, name, courtName, caseDetails, advocateName, fee);
    setShowAddForm(false);
    
    // Reset Form
    setRegDate(new Date().toISOString().split('T')[0]);
    setNumber('');
    setCaseType('');
    setName('');
    setCourtName('');
    setCaseDetails('');
    setAdvocateName('કે.પી. ઉદાણી');
    setFee('');
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courtName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseDetails?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.advocateName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>
      <div className="panel-header">
        <h3 className="panel-title">👥 {t('Client Management Directory')}</h3>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setShowAddForm(true)}
          id="add-client-btn"
        >
          {t('+ Add New Client')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder={t('Search by client name, email or mobile...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', paddingLeft: '16px' }}
          id="search-clients-input"
        />
      </div>

      {/* Clients Register Table */}
      <div className="table-container">
        {filteredClients.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('No matching client records found.')}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>{t('S.No.')}</th>
                <th>{t('Registration Date')}</th>
                <th>{t('Register Number')}</th>
                <th>{t('Case Type')}</th>
                <th>{t('Client Name')}</th>
                <th>{t('Court Name')}</th>
                <th>{t('Case Details')}</th>
                <th>{t('Advocate Name')}</th>
                <th>{t('Fee')}</th>
                <th style={{ width: '80px', textAlign: 'center' }}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c, index) => (
                <tr key={c.id}>
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                  <td>{c.regDate ? new Date(c.regDate).toLocaleDateString('en-GB') : ''}</td>
                  <td style={{ fontWeight: '600' }}>{c.number}</td>
                  <td><span className="badge pending" style={{ fontSize: '12px' }}>{c.caseType}</span></td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{c.name}</td>
                  <td>{c.courtName}</td>
                  <td style={{ fontSize: '13px', maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{c.caseDetails}</td>
                  <td>{c.advocateName}</td>
                  <td style={{ fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(c.fee)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
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
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)', maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">👥 {t('Register Client Profile')}</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="responsive-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">{t('Registration Date')}</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      className="form-input"
                      value={regDate}
                      onChange={(e) => setRegDate(e.target.value)}
                      id="new-client-regdate"
                      required
                    />
                    <span className="input-icon">📅</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Register Number')}</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 246"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      id="new-client-number"
                      required
                    />
                    <span className="input-icon">🔢</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Case Type')}</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ડી.એ. દાખલ / હક્કપત્રક"
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                      id="new-client-casetype"
                      required
                    />
                    <span className="input-icon">⚖️</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Client Name')}</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. લાલુ આસુરામ હરીજન"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="new-client-name"
                      required
                    />
                    <span className="input-icon">👤</span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">{t('Court Name')}</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. એડિ. કલે. સા. પૂર્વ / મામલતદાર સાહેબ ભુજ"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    id="new-client-courtname"
                    required
                  />
                  <span className="input-icon">🏛️</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Case Details')}</label>
                <div className="input-wrapper">
                  <textarea
                    className="form-input"
                    placeholder="e.g. ૧૨૨ના હુકમ સામે અપીલ / ખાતા નંબર 419"
                    value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    style={{ minHeight: '60px', resize: 'vertical', paddingLeft: '44px', paddingTop: '10px' }}
                    id="new-client-casedetails"
                    required
                  />
                  <span className="input-icon" style={{ top: '14px' }}>📝</span>
                </div>
              </div>

              <div className="responsive-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">{t('Advocate Name')}</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      value={advocateName}
                      onChange={(e) => setAdvocateName(e.target.value)}
                      id="new-client-advocatename"
                      required
                    />
                    <span className="input-icon">👨‍💼</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Fee')}</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 25000"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      id="new-client-fee"
                      required
                    />
                    <span className="input-icon">₹</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-client-submit">
                  {t('Save Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

