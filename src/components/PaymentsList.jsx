import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PaymentsList() {
  const { payments, addPayment, deletePayment, currentUser } = useApp();
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
          <h3 className="restricted-title">Access Denied: Financial Records</h3>
          <p className="restricted-text">
            Your account role <strong>({currentUser?.role})</strong> is unauthorized to access accounts, revenue ledgers, and transaction sheets. Please contact the Super Admin or Accountant.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !amount || !category || !date) {
      alert('Please fill in all fields');
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
        <h3 className="panel-title">💰 Financial Accounts Ledger</h3>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setShowAddForm(true)}
          id="add-payment-btn"
        >
          + Record Transaction
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Total Receipts (Credits)</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>₹{completedCredits.toLocaleString()}</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Total Expenses (Debits)</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--danger)' }}>₹{completedDebits.toLocaleString()}</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Pending Receivables</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--warning)' }}>₹{pendingPayments.toLocaleString()}</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Net Revenue Balance</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>₹{netRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by payer/vendor name or details..."
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
          <option value="all">All Ledgers</option>
          <option value="credit">Credits (Income)</option>
          <option value="debit">Debits (Expenses)</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        {filteredPayments.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transaction records matched.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Payer / Payee Vendor</th>
                <th>Payment Date</th>
                <th>Category Brief</th>
                <th>Flow Type</th>
                <th>Amount (INR)</th>
                <th>Clearance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600' }}>{p.clientName}</td>
                  <td>{p.date}</td>
                  <td>{p.category}</td>
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
                      {p.type}
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
                      {p.status}
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
              <h3 className="modal-title">💰 Record Financial Transaction</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Payer / Payee Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter client name or vendor"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    id="new-payment-client"
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Flow Direction</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-payment-type"
                  >
                    <option value="credit">Credit (Receipt / Client Income)</option>
                    <option value="debit">Debit (Expense / Vendor Payee)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
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
                        <option value="Retainer Fee">Retainer Fee</option>
                        <option value="Consultation Fee">Consultation Fee</option>
                        <option value="Hearing Appearance Fee">Hearing Appearance Fee</option>
                        <option value="Drafting Charges">Drafting Charges</option>
                      </>
                    ) : (
                      <>
                        <option value="Rent">Office Rent</option>
                        <option value="Research Subscription">Research Subscription</option>
                        <option value="Travel Allowance">Travel Allowance</option>
                        <option value="Office Stationery">Office Stationery</option>
                        <option value="Staff Salaries">Staff Salaries</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (INR)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Amount in Rupees"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    id="new-payment-amount"
                  />
                  <span className="input-icon">₹</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Date</label>
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
                <label className="form-label">Clearing Status</label>
                <div className="input-wrapper">
                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                    id="new-payment-status"
                  >
                    <option value="completed">Completed / Settled</option>
                    <option value="pending">Pending / Uncleared</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-payment-submit">
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
