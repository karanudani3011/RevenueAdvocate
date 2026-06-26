import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotoSansGujaratiBase64 } from '../utils/gujaratiFont';

const STATUS_STYLES = {
  active:  { bg: 'rgba(22,163,74,0.10)',   color: '#16a34a' },
  pending: { bg: 'rgba(217,119,6,0.10)',   color: '#d97706' },
  closed:  { bg: 'rgba(148,163,184,0.12)', color: '#64748b' },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function CasesList() {
  const { cases, addCase, updateCase, updateCaseStatus, deleteCase, currentUser, t } = useApp();
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');

  // Form state
  const [filingDate,      setFilingDate]      = useState(new Date().toISOString().split('T')[0]);
  const [respondent,      setRespondent]      = useState('');
  const [petitioner,      setPetitioner]      = useState('');
  const [propertyDetails, setPropertyDetails] = useState('');
  const [village,         setVillage]         = useState('');
  const [status,          setStatus]          = useState('active');
  const [remarks,         setRemarks]         = useState('દાખલ');
  const [extraDetail,     setExtraDetail]     = useState('');
  const [pdfFileName,     setPdfFileName]     = useState('');

  const isReadOnly = currentUser?.role === 'Accountant';

  const handleEditClick = (c) => {
    setEditingId(c.id);
    setFilingDate(c.filingDate || '');
    setRespondent(c.respondent || '');
    setPetitioner(c.petitioner || '');
    setPropertyDetails(c.propertyDetails || '');
    setVillage(c.village || '');
    setStatus(c.status || 'active');
    setRemarks(c.remarks || '');
    setExtraDetail(c.extraDetail || '');
    setPdfFileName(c.pdfFileName || '');
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFilingDate(new Date().toISOString().split('T')[0]);
    setRespondent(''); setPetitioner('');
    setPropertyDetails(''); setVillage('');
    setStatus('active'); setRemarks('દાખલ');
    setExtraDetail('');
    setPdfFileName('');
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateCase(editingId, { filingDate, respondent, petitioner, propertyDetails, village, status, remarks, extraDetail, pdfFileName });
    } else {
      addCase(filingDate, respondent, petitioner, propertyDetails, village, status, remarks, extraDetail, pdfFileName);
    }
    setShowAddForm(false);
    resetForm();
  };

  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.respondent?.toLowerCase().includes(q) ||
      c.petitioner?.toLowerCase().includes(q) ||
      c.village?.toLowerCase().includes(q) ||
      c.propertyDetails?.toLowerCase().includes(q) ||
      c.remarks?.toLowerCase().includes(q) ||
      c.extraDetail?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const downloadPersonalPDF = (c) => {
    const doc = new jsPDF();
    doc.addFileToVFS('NotoSansGujarati.ttf', NotoSansGujaratiBase64);
    doc.addFont('NotoSansGujarati.ttf', 'NotoSansGujarati', 'normal');
    doc.setFont('NotoSansGujarati');
    doc.text(`Sub Register: ${c.petitioner} vs ${c.respondent}`, 14, 20);
    
    const bodyData = [
      ['Filing Date', formatDate(c.filingDate)],
      ['Village', c.village || ''],
      ['Petitioner (Dharavnar)', c.petitioner || ''],
      ['Respondent (Denar)', c.respondent || ''],
      ['Property Details', c.propertyDetails || ''],
      ['Extra Detail', c.extraDetail || ''],
      ['Status', c.status || ''],
      ['Remarks', c.remarks || '']
    ];

    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Details']],
      body: bodyData,
      styles: { font: 'NotoSansGujarati' },
    });

    doc.save(`SubRegister_${c.village}_${c.petitioner}.pdf`);
  };

  const downloadAllPDF = () => {
    const doc = new jsPDF();
    doc.addFileToVFS('NotoSansGujarati.ttf', NotoSansGujaratiBase64);
    doc.addFont('NotoSansGujarati.ttf', 'NotoSansGujarati', 'normal');
    doc.setFont('NotoSansGujarati');
    doc.text('Sub Register Records', 14, 20);
    
    // Sort ascending by date
    const sortedCases = [...filteredCases].sort((a, b) => new Date(a.filingDate) - new Date(b.filingDate));
    
    const tableData = sortedCases.map((c, index) => [
      index + 1,
      formatDate(c.filingDate),
      c.petitioner,
      c.respondent,
      c.propertyDetails,
      c.village,
      c.pdfFileName ? 'Yes' : 'No',
      c.status,
      c.remarks
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['S.No.', 'Filing Date', 'Petitioner', 'Respondent', 'Property', 'Village', 'PDF', 'Status', 'Remarks']],
      body: tableData,
      styles: { font: 'NotoSansGujarati' },
    });

    doc.save('All_SubRegister.pdf');
  };

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>

      {/* ── Header ─────────────────────────────── */}
      <div className="panel-header">
        <h3 className="panel-title">📁 {t('Sub Register')}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
            onClick={downloadAllPDF}
          >
            📄 Download All PDF
          </button>
          {!isReadOnly && (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '6px 16px', fontSize: '13px' }}
              onClick={() => { resetForm(); setShowAddForm(true); }}
              id="add-case-btn"
            >
              {t('+ Register New Sub Register')}
            </button>
          )}
        </div>
      </div>

      {/* Read-only notice */}
      {isReadOnly && (
        <div style={{ padding: '8px 12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> <strong>{t('Read-Only Access:')}</strong> {t('Case registrations and status changes are managed by Advocates.')}
        </div>
      )}

      {/* ── Filters ────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder={t('Search by name, village, details...')}
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
          <option value="active">{t('Active')}</option>
          <option value="pending">{t('Pending')}</option>
          <option value="closed">{t('Closed')}</option>
        </select>
      </div>

      {/* ── Table ──────────────────────────────── */}
      <div className="table-container">
        {filteredCases.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('No matching records found.')}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>{t('S.No.')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('Filing Date')}</th>
                <th>{t('Petitioner (Dharavnar)')}</th>
                <th>{t('Respondent (Denar)')}</th>
                <th>{t('Property Details')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('Village')}</th>
                <th style={{ width: '70px',  textAlign: 'center' }}>{t('PDF')}</th>
                <th style={{ width: '90px',  textAlign: 'center' }}>{t('Remarks')}</th>
                <th style={{ width: '120px',  textAlign: 'center' }}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, index) => {
                const ss = STATUS_STYLES[c.status] || STATUS_STYLES.active;
                return (
                  <tr key={c.id}>

                    {/* ક્રમ */}
                    <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>
                      {index + 1}
                    </td>

                    {/* દાખલ તારીખ */}
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {formatDate(c.filingDate)}
                    </td>

                    {/* ધરાવનાર */}
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {c.petitioner}
                    </td>

                    {/* દેનાર */}
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {c.respondent}
                    </td>

                    {/* મિલકતની વિગત */}
                    <td style={{ fontSize: '13px', maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                      {c.propertyDetails}
                      {c.extraDetail && (
                        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <strong>Extra:</strong> {c.extraDetail}
                        </div>
                      )}
                    </td>

                    {/* ગામ */}
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px',
                        borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                        background: 'var(--primary-glow)', color: 'var(--primary)',
                        whiteSpace: 'nowrap'
                      }}>
                        {c.village}
                      </span>
                    </td>

                    {/* PDF */}
                    <td style={{ textAlign: 'center' }}>
                      {c.pdfFileName ? (
                        <span title={c.pdfFileName} style={{ fontSize: '16px', color: 'var(--danger)' }}>📄</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* શેરો */}
                    <td style={{ textAlign: 'center' }}>
                      {isReadOnly ? (
                        <span style={{
                          display: 'inline-block', padding: '3px 12px',
                          borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                          background: ss.bg, color: ss.color
                        }}>
                          {c.remarks}
                        </span>
                      ) : (
                        <select
                          value={c.status}
                          onChange={(e) => updateCaseStatus(c.id, e.target.value)}
                          style={{
                            background: ss.bg, border: `1px solid ${ss.color}50`,
                            color: ss.color, borderRadius: '20px',
                            padding: '3px 10px', fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', outline: 'none'
                          }}
                          id={`status-select-${c.id}`}
                        >
                          <option value="active">દાખલ</option>
                          <option value="pending">બાકી</option>
                          <option value="closed">બંધ</option>
                        </select>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      {!isReadOnly && (
                        <div className="action-buttons" style={{ justifyContent: 'center', gap: '8px' }}>
                          <button
                            className="btn-icon"
                            onClick={() => downloadPersonalPDF(c)}
                            title="Download PDF"
                          >
                            📄
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleEditClick(c)}
                            title="Edit Record"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => deleteCase(c.id)}
                            title="Delete Record"
                            id={`delete-case-${c.id}`}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add/Edit Modal ──────────────────────── */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">📁 {editingId ? 'Edit Sub Register Record' : t('Register New Sub Register')}</h3>
              <button className="modal-close" onClick={() => { setShowAddForm(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>

              <div className="responsive-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">{t('Filing Date')}</label>
                  <div className="input-wrapper">
                    <input type="date" className="form-input"
                      value={filingDate} onChange={(e) => setFilingDate(e.target.value)}
                      id="new-case-date" style={{ paddingLeft: '16px' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Village')}</label>
                  <div className="input-wrapper">
                    <input type="text" className="form-input"
                      placeholder="e.g. નાણી(મોટી)"
                      value={village} onChange={(e) => setVillage(e.target.value)}
                      id="new-case-village" />
                    <span className="input-icon">🏘️</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Petitioner (Dharavnar)')}</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input"
                    placeholder="e.g. જીવરાજભાઈ નારણભાઈ રબારી"
                    value={petitioner} onChange={(e) => setPetitioner(e.target.value)}
                    id="new-case-petitioner" />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Respondent (Denar)')}</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input"
                    placeholder="e.g. અમરાભાઈ ભીમાભાઈ કોલી"
                    value={respondent} onChange={(e) => setRespondent(e.target.value)}
                    id="new-case-respondent" />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Property Details')}</label>
                <div className="input-wrapper">
                  <textarea className="form-input"
                    placeholder="e.g. ગામના રે.સર્વે નંબર ૬૬૭, ક્ષેત્રફળ ૨.૧૧.૦૫ હે."
                    value={propertyDetails} onChange={(e) => setPropertyDetails(e.target.value)}
                    style={{ minHeight: '64px', resize: 'vertical', paddingLeft: '44px', paddingTop: '10px' }}
                    id="new-case-property" />
                  <span className="input-icon" style={{ top: '14px' }}>📝</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Extra Detail')}</label>
                <div className="input-wrapper">
                  <textarea className="form-input"
                    placeholder="Any extra details..."
                    value={extraDetail} onChange={(e) => setExtraDetail(e.target.value)}
                    style={{ minHeight: '64px', resize: 'vertical', paddingLeft: '44px', paddingTop: '10px' }}
                    id="new-case-extra" />
                  <span className="input-icon" style={{ top: '14px' }}>📄</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Upload PDF Document (Max 10MB)')}</label>
                <div className="input-wrapper" style={{ padding: '8px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <input type="file" accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert('File size exceeds 10MB restriction.');
                          e.target.value = '';
                          setPdfFileName('');
                        } else {
                          setPdfFileName(file.name);
                        }
                      }
                    }}
                    style={{ width: '100%' }} id="new-case-pdf" />
                </div>
                {pdfFileName && <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>Selected: {pdfFileName}</div>}
              </div>

              <div className="responsive-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">{t('Status')}</label>
                  <div className="input-wrapper">
                    <select className="form-input" value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setRemarks(e.target.value === 'closed' ? 'બંધ' : e.target.value === 'pending' ? 'બાકી' : 'દાખલ');
                      }}
                      style={{ paddingLeft: '16px' }} id="new-case-status">
                      <option value="active">દાખલ (Active)</option>
                      <option value="pending">બાકી (Pending)</option>
                      <option value="closed">બંધ (Closed)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Remarks')}</label>
                  <div className="input-wrapper">
                    <input type="text" className="form-input"
                      placeholder="e.g. દાખલ"
                      value={remarks} onChange={(e) => setRemarks(e.target.value)}
                      id="new-case-remarks" />
                    <span className="input-icon">📋</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary"
                  onClick={() => { setShowAddForm(false); resetForm(); }}
                  style={{ flex: 1 }}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-case-submit">
                  {editingId ? 'Update Record' : t('Save Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
