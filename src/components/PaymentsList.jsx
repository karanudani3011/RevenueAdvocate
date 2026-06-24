import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PaymentsList() {
  const { payments, addPayment, deletePayment, currentUser, t } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit');
  const [category, setCategory] = useState('Consultation Fee');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('completed');

  // Role check: Office Staff is strictly restricted
  const isRestricted = currentUser?.role === 'Office Staff';

  if (isRestricted) {
    return (
      <div className="panel-card glass-panel animated-slideup" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '450px' }}>
        <div className="restricted-overlay">
          <div className="restricted-icon">🔒</div>
          <h3 className="restricted-title">{t('Access Denied: Financial Records')}</h3>
          <p className="restricted-text">
            {t('Your account role ')}<strong>({currentUser?.role})</strong>{t(' is unauthorized to access accounts, revenue ledgers, and transaction sheets. Please contact the Super Admin or Accountant.')}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !amount || !category || !date) {
      alert(t('Please fill in all fields') || 'Please fill in all fields');
      return;
    }
    addPayment(clientName, amount, type, category, date, status);
    setShowAddForm(false);
    // Reset Form
    setClientName('');
    setAmount('');
    setType('credit');
    setCategory('Consultation Fee');
    setDate('');
    setStatus('completed');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' ? true : p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Totals Calculations
  const completedCredits = payments.filter(p => p.type === 'credit' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const completedDebits = payments.filter(p => p.type === 'debit' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.type === 'credit' && p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const netRevenue = completedCredits - completedDebits;

  return (
    <div className="panel-card glass-panel animated-slideup" style={{ minHeight: '500px' }}>
      <div className="panel-header">
        <h3 className="panel-title">💰 {t('Financial Accounts Ledger')}</h3>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setShowAddForm(true)}
          id="add-payment-btn"
        >
          {t('+ Record Transaction')}
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>{t('Total Receipts (Credits)')}</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>₹{completedCredits.toLocaleString()}</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>{t('Total Expenses (Debits)')}</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--danger)' }}>₹{completedDebits.toLocaleString()}</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>{t('Pending Receivables')}</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--warning)' }}>₹{pendingPayments.toLocaleString()}</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>{t('Net Revenue Balance')}</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>₹{netRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder={t('Search by payer/vendor name or details...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '240px', paddingLeft: '16px' }}
          id="search-payments-input"
        />

        <select
          className="form-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: '160px', paddingLeft: '16px' }}
          id="filter-payments-type"
        >
          <option value="all">{t('All Ledgers')}</option>
          <option value="credit">{t('Credits (Income)')}</option>
          <option value="debit">{t('Debits (Expenses)')}</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        {filteredPayments.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('No transaction records matched.')}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Payer / Payee Vendor')}</th>
                <th>{t('Payment Date')}</th>
                <th>{t('Category Brief')}</th>
                <th>{t('Flow Type')}</th>
                <th>{t('Amount (INR)')}</th>
                <th>{t('Clearance')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600' }}>{p.clientName}</td>
                  <td>{p.date}</td>
                  <td>{t(p.category) || p.category}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: p.type === 'credit' ? 'var(--success-bg)' : 'var(--danger-bg)', 
                        color: p.type === 'credit' ? 'var(--success)' : 'var(--danger)',
                        textTransform: 'uppercase',
                        fontWeight: '700'
                      }}
                    >
                      {p.type === 'credit' ? t('Credit (Income)') : t('Debit (Expense)')}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>₹{p.amount.toLocaleString()}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: p.status === 'completed' ? 'var(--success-bg)' : 'var(--warning-bg)', 
                        color: p.status === 'completed' ? 'var(--success)' : 'var(--warning)' 
                      }}
                    >
                      {p.status === 'completed' ? t('Completed') : t('Pending')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon delete" 
                        onClick={() => deletePayment(p.id)}
                        title="Remove Transaction"
                        id={`delete-payment-${p.id}`}
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

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="modal-overlay animated-fade">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 className="modal-title">💰 {t('Record Financial Transaction')}</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('Payer / Payee Name')}</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('Enter client name or vendor')}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    id="new-payment-client"
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Flow Direction')}</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-payment-type"
                  >
                    <option value="credit">{t('Credit (Receipt / Client Income)')}</option>
                    <option value="debit">{t('Debit (Expense / Vendor Payee)')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Category')}</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-payment-category"
                  >
                    {type === 'credit' ? (
                      <>
                        <option value="Retainer Fee">{t('Retainer Fee')}</option>
                        <option value="Consultation Fee">{t('Consultation Fee')}</option>
                        <option value="Hearing Appearance Fee">{t('Hearing Appearance Fee')}</option>
                        <option value="Drafting Charges">{t('Drafting Charges')}</option>
                      </>
                    ) : (
                      <>
                        <option value="Rent">{t('Rent')}</option>
                        <option value="Research Subscription">{t('Research Subscription')}</option>
                        <option value="Travel Allowance">{t('Travel Allowance')}</option>
                        <option value="Office Stationery">{t('Office Stationery')}</option>
                        <option value="Staff Salaries">{t('Staff Salaries')}</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Amount (INR)')}</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="form-input"
                    placeholder={t('Amount in Rupees')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    id="new-payment-amount"
                  />
                  <span className="input-icon">₹</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Transaction Date')}</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    id="new-payment-date"
                  />
                  <span className="input-icon">📅</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('Clearing Status')}</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-payment-status"
                  >
                    <option value="completed">{t('Completed / Settled')}</option>
                    <option value="pending">{t('Pending / Uncleared')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-payment-submit">
                  {t('Save Ledger')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
