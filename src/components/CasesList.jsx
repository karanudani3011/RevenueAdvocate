import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const STATUS_STYLES = {
  active:  { bg: 'rgba(22,163,74,0.10)',   color: '#16a34a' },
  pending: { bg: 'rgba(217,119,6,0.10)',   color: '#d97706' },
  closed:  { bg: 'rgba(148,163,184,0.12)', color: '#64748b' },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

/* ─────────────────────────────────────────────
   Signature Pad Modal (canvas-based)
───────────────────────────────────────────── */
function SignaturePadModal({ caseItem, onSave, onClose }) {
  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef({ x: 0, y: 0 });
  const [isEmpty, setIsEmpty] = useState(true);

  /* Load existing signature onto canvas on open */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (caseItem.signature) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = caseItem.signature;
      setIsEmpty(false);
    }
  }, [caseItem.signature]);

  /* Helper: get position relative to canvas */
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    lastPos.current = pos;
    setIsEmpty(false);
  }, []);

  const stopDraw = useCallback((e) => {
    e?.preventDefault();
    isDrawing.current = false;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (isEmpty) { alert('Please draw a signature first.'); return; }
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(caseItem.id, dataUrl);
    onClose();
  };

  return (
    <div className="modal-overlay animated-fade" style={{ zIndex: 300 }}>
      <div className="modal-content glass-panel" style={{
        background: 'var(--bg-secondary)',
        maxWidth: '520px', width: '100%',
        padding: '28px'
      }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '4px' }}>
          <h3 className="modal-title">✍️ સહી (Virtual Signature)</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Case info */}
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <strong>{caseItem.petitioner}</strong> vs {caseItem.respondent}
        </p>

        {/* Canvas pad */}
        <div style={{
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          overflow: 'hidden',
          cursor: 'crosshair',
          touchAction: 'none',
          position: 'relative'
        }}>
          <canvas
            ref={canvasRef}
            width={460}
            height={200}
            style={{ display: 'block', width: '100%', height: '200px' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            id="signature-canvas"
          />
          {/* Watermark guide line */}
          <div style={{
            position: 'absolute', bottom: '40px', left: '20px', right: '20px',
            borderBottom: '1px dashed #cbd5e1', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: '20px', left: '20px',
            fontSize: '11px', color: '#94a3b8', pointerEvents: 'none'
          }}>
            અહીં સહી કરો →
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={clearCanvas}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: '500', fontFamily: 'var(--font-family)'
            }}
            id="sig-clear-btn"
          >
            🗑 Clear
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
            id="sig-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            style={{ flex: 1 }}
            id="sig-save-btn"
          >
            ✅ Save Signature
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main CasesList Component
───────────────────────────────────────────── */
export default function CasesList() {
  const { cases, addCase, updateCaseStatus, deleteCase, updateCaseSignature, currentUser, t } = useApp();
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [sigCase,       setSigCase]       = useState(null); // case being signed
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

  const isReadOnly = currentUser?.role === 'Accountant';

  const resetForm = () => {
    setFilingDate(new Date().toISOString().split('T')[0]);
    setRespondent(''); setPetitioner('');
    setPropertyDetails(''); setVillage('');
    setStatus('active'); setRemarks('દાખલ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filingDate || !respondent || !petitioner || !propertyDetails || !village) {
      alert('Please fill in all required fields');
      return;
    }
    addCase(filingDate, respondent, petitioner, propertyDetails, village, status, remarks);
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
      c.remarks?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>

      {/* ── Header ─────────────────────────────── */}
      <div className="panel-header">
        <h3 className="panel-title">📁 {t('Lawsuits & Case Portfolios')}</h3>
        {!isReadOnly && (
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '6px 16px', fontSize: '13px' }}
            onClick={() => setShowAddForm(true)}
            id="add-case-btn"
          >
            {t('+ Register New Case')}
          </button>
        )}
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
          placeholder={t('Search by case ID, title, type or client...')}
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
            {t('No matching case records found.')}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>{t('S.No.')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('Filing Date')}</th>
                <th>{t('Respondent')}</th>
                <th>{t('Petitioner')}</th>
                <th>{t('Property Details')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('Village')}</th>
                <th style={{ width: '90px',  textAlign: 'center' }}>{t('Remarks')}</th>
                <th style={{ width: '90px',  textAlign: 'center' }}>સહી</th>
                <th style={{ width: '80px',  textAlign: 'center' }}>{t('Actions')}</th>
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

                    {/* દેનાર */}
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {c.respondent}
                    </td>

                    {/* ધરાવનાર */}
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {c.petitioner}
                    </td>

                    {/* મિલકતની વિગત */}
                    <td style={{ fontSize: '13px', maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                      {c.propertyDetails}
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

                    {/* સહી — Signature column */}
                    <td style={{ textAlign: 'center' }}>
                      {c.signature ? (
                        /* Show thumbnail + re-sign button */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <img
                            src={c.signature}
                            alt="signature"
                            style={{
                              width: '72px', height: '36px',
                              objectFit: 'contain',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              background: '#fff',
                              cursor: isReadOnly ? 'default' : 'pointer'
                            }}
                            onClick={() => !isReadOnly && setSigCase(c)}
                            title="Click to re-sign"
                          />
                          {!isReadOnly && (
                            <span
                              style={{ fontSize: '10px', color: 'var(--primary)', cursor: 'pointer' }}
                              onClick={() => setSigCase(c)}
                            >
                              ✏️ Edit
                            </span>
                          )}
                        </div>
                      ) : (
                        !isReadOnly ? (
                          <button
                            onClick={() => setSigCase(c)}
                            style={{
                              padding: '5px 10px',
                              background: 'var(--primary-glow)',
                              border: '1px dashed var(--primary)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--primary)',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              fontFamily: 'var(--font-family)'
                            }}
                            id={`sign-btn-${c.id}`}
                            title="Add virtual signature"
                          >
                            ✍️ સહી
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                        )
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      {!isReadOnly && (
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn-icon delete"
                            onClick={() => deleteCase(c.id)}
                            title="Delete Case"
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

      {/* ── Signature Pad Modal ─────────────────── */}
      {sigCase && (
        <SignaturePadModal
          caseItem={sigCase}
          onSave={updateCaseSignature}
          onClose={() => setSigCase(null)}
        />
      )}

      {/* ── Add Case Modal ──────────────────────── */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)', maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">📁 {t('Register New Case')}</h3>
              <button className="modal-close" onClick={() => { setShowAddForm(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">{t('Filing Date *')}</label>
                  <div className="input-wrapper">
                    <input type="date" className="form-input"
                      value={filingDate} onChange={(e) => setFilingDate(e.target.value)}
                      id="new-case-date" required style={{ paddingLeft: '16px' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Village *')}</label>
                  <div className="input-wrapper">
                    <input type="text" className="form-input"
                      placeholder="e.g. નાણી(મોટી)"
                      value={village} onChange={(e) => setVillage(e.target.value)}
                      id="new-case-village" required />
                    <span className="input-icon">🏘️</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Respondent (Denar) *')}</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input"
                    placeholder="e.g. અમરાભાઈ ભીમાભાઈ કોલી"
                    value={respondent} onChange={(e) => setRespondent(e.target.value)}
                    id="new-case-respondent" required />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Petitioner (Dharavnar) *')}</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input"
                    placeholder="e.g. જીવરાજભાઈ નારણભાઈ રબારી"
                    value={petitioner} onChange={(e) => setPetitioner(e.target.value)}
                    id="new-case-petitioner" required />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Property Details *')}</label>
                <div className="input-wrapper">
                  <textarea className="form-input"
                    placeholder="e.g. ગામના રે.સર્વે નંબર ૬૬૭, ક્ષેત્રફળ ૨.૧૧.૦૫ હે."
                    value={propertyDetails} onChange={(e) => setPropertyDetails(e.target.value)}
                    style={{ minHeight: '64px', resize: 'vertical', paddingLeft: '44px', paddingTop: '10px' }}
                    id="new-case-property" required />
                  <span className="input-icon" style={{ top: '14px' }}>📝</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  {t('Save Case')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
