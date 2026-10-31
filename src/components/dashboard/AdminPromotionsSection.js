"use client";

import React, { useState, useEffect, useRef } from 'react';

const OFFER_TYPES = [
  { value: 'percentage_discount', label: '1. Percentage Discount (e.g. 50% off)' },
  { value: 'fixed_discount', label: '2. Fixed-Amount Discount (e.g. ₹500 off)' },
  { value: 'plan_discount', label: '3. Selected Subscription Plan Discount' },
  { value: 'pack_discount', label: '4. Selected Paid Credit Pack Discount' },
  { value: 'bonus_credits', label: '5. Bonus Credit Bundle (e.g. +2 free credits)' },
  { value: 'limited_time', label: '6. Limited-Time Promotional Offer' },
];

const AVAILABLE_PRODUCTS = [
  { id: 'all', label: 'All Products & Plans' },
  { id: 'subscriptions', label: 'All Subscriptions' },
  { id: 'credit_packs', label: 'All Credit Packs' },
  { id: 'sub_weekly', label: 'Weekly Unlimited ($39)' },
  { id: 'sub_monthly', label: 'Monthly Unlimited ($74.95)' },
  { id: 'sub_yearly', label: 'Yearly Unlimited ($299.95)' },
  { id: 'pack_1', label: '1 Credit Pack ($19)' },
  { id: 'pack_3', label: '3 Credits Pack ($29.50)' },
  { id: 'pack_6', label: '6 + 2 Credits Pack ($59)' },
  { id: 'pack_9', label: '9 + 6 Credits Pack ($88.50)' },
  { id: 'pro', label: 'Legacy Pro Plan (₹499)' },
  { id: 'premium', label: 'Legacy Premium Plan (₹999)' },
];

export default function AdminPromotionsSection() {
  const [promotionsData, setPromotionsData] = useState({
    promotions: [],
    kpis: { total: 0, active: 0, scheduled: 0, expired: 0, total_redemptions: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Redemptions detail modal
  const [showRedemptionsModal, setShowRedemptionsModal] = useState(false);
  const [viewingPromo, setViewingPromo] = useState(null);
  const [redemptionsList, setRedemptionsList] = useState([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    offer_type: 'percentage_discount',
    discount_percent: 50,
    discount_amount: 0,
    bonus_credits: 0,
    eligible_products: ['all'],
    min_purchase_amount: 0,
    max_redemptions: '',
    per_user_limit: 1,
    start_date: '',
    expiry_date: '',
    status: 'active',
    is_public: true,
    attachment: null,
  });

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/promotions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPromotionsData(data);
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, [search, statusFilter]);

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      offer_type: 'percentage_discount',
      discount_percent: 50,
      discount_amount: 0,
      bonus_credits: 0,
      eligible_products: ['all'],
      min_purchase_amount: 0,
      max_redemptions: '',
      per_user_limit: 1,
      start_date: '',
      expiry_date: '',
      status: 'active',
      is_public: true,
      attachment: null,
    });
    setFormMsg({ text: '', type: '' });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingPromo(p);
    setFormData({
      name: p.name || '',
      code: p.code || '',
      description: p.description || '',
      offer_type: p.offer_type || 'percentage_discount',
      discount_percent: p.discount_percent || 0,
      discount_amount: p.discount_amount || 0,
      bonus_credits: p.bonus_credits || 0,
      eligible_products: Array.isArray(p.eligible_products) ? p.eligible_products : ['all'],
      min_purchase_amount: p.min_purchase_amount || 0,
      max_redemptions: p.max_redemptions || '',
      per_user_limit: p.per_user_limit || 1,
      start_date: p.start_date ? p.start_date.slice(0, 16) : '',
      expiry_date: p.expiry_date ? p.expiry_date.slice(0, 16) : '',
      status: p.status || 'active',
      is_public: p.is_public !== false,
      attachment: p.attachment || null,
    });
    setFormMsg({ text: '', type: '' });
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const formatBytes = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      };

      setFormData((prev) => ({
        ...prev,
        attachment: {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: formatBytes(file.size),
          data_url: event.target.result,
        },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSavePromotion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg({ text: '', type: '' });

    try {
      const isEdit = Boolean(editingPromo);
      const url = isEdit ? `/api/admin/promotions/${editingPromo.id}` : '/api/admin/promotions';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discount_percent: Number(formData.discount_percent) || 0,
        discount_amount: Number(formData.discount_amount) || 0,
        bonus_credits: Number(formData.bonus_credits) || 0,
        min_purchase_amount: Number(formData.min_purchase_amount) || 0,
        max_redemptions: formData.max_redemptions ? Number(formData.max_redemptions) : null,
        per_user_limit: Number(formData.per_user_limit) || 1,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setFormMsg({
          text: `Promotion ${isEdit ? 'updated' : 'created'} successfully!`,
          type: 'ok',
        });
        setTimeout(() => {
          setShowModal(false);
          setEditingPromo(null);
          setFormMsg({ text: '', type: '' });
          loadPromotions();
        }, 1100);
      } else {
        setFormMsg({
          text: data.message || 'Operation failed. Check input fields.',
          type: 'err',
        });
      }
    } catch (err) {
      setFormMsg({ text: 'Network connection error.', type: 'err' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (promo) => {
    const actionText = promo.status === 'active' ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${actionText} promotion code "${promo.code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}/status`, {
        method: 'PATCH',
      });
      if (res.ok) {
        loadPromotions();
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to update promotion status.');
      }
    } catch (err) {
      alert('Network connection error.');
    }
  };

  const handleDeletePromo = async (promo) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete promotion "${promo.name}" (${promo.code})?\n\nThis will remove the campaign record. Past user redemption ledger entries will remain archived for accounting.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadPromotions();
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to delete promotion.');
      }
    } catch (err) {
      alert('Network connection error.');
    }
  };

  const handleViewRedemptions = async (promo) => {
    setViewingPromo(promo);
    setShowRedemptionsModal(true);
    setLoadingRedemptions(true);
    setRedemptionsList([]);

    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}/redemptions`);
      if (res.ok) {
        const d = await res.json();
        setRedemptionsList(d.redemptions || []);
      }
    } catch (err) {
      console.error('Failed to load redemptions:', err);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const handleProductToggle = (prodId) => {
    let current = [...formData.eligible_products];
    if (prodId === 'all') {
      current = ['all'];
    } else {
      current = current.filter((x) => x !== 'all');
      if (current.includes(prodId)) {
        current = current.filter((x) => x !== prodId);
        if (current.length === 0) current = ['all'];
      } else {
        current.push(prodId);
      }
    }
    setFormData((prev) => ({ ...prev, eligible_products: current }));
  };

  const formatBenefit = (p) => {
    const parts = [];
    if (p.discount_percent > 0) parts.push(`${p.discount_percent}% off`);
    if (p.discount_amount > 0) parts.push(`₹${p.discount_amount} off`);
    if (p.bonus_credits > 0) parts.push(`+${p.bonus_credits} bonus credits`);
    if (parts.length === 0) return 'Custom Offer';
    return parts.join(' + ');
  };

  const renderStatusBadge = (calculatedStatus) => {
    switch (calculatedStatus) {
      case 'active':
        return <span className="admin-badge active">● Active</span>;
      case 'scheduled':
        return <span className="admin-badge scheduled">⏱ Scheduled</span>;
      case 'expired':
        return <span className="admin-badge expired">✕ Expired</span>;
      case 'exhausted':
        return <span className="admin-badge exhausted">⛔ Exhausted</span>;
      case 'inactive':
      default:
        return <span className="admin-badge inactive">⏸ Inactive</span>;
    }
  };

  const kpis = promotionsData?.kpis || {
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    total_redemptions: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 5 KPI Summary Cards */}
      <section className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {/* KPI 1: Total Promotions */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap users">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                <path d="M9 9h.01"></path>
                <path d="M15 15h.01"></path>
                <path d="m15 9-6 6"></path>
              </svg>
            </div>
          </div>
          <span className="admin-kpi-label">Total promotions</span>
          <div className="admin-kpi-value">{kpis.total}</div>
          <div className="admin-kpi-trend">
            <span style={{ color: 'var(--ad-text-muted)' }}>All campaigns</span>
          </div>
        </div>

        {/* KPI 2: Active Promotions */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap credits">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>
          </div>
          <span className="admin-kpi-label">Active promotions</span>
          <div className="admin-kpi-value" style={{ color: 'var(--ad-green)' }}>{kpis.active}</div>
          <div className="admin-kpi-trend">
            <span style={{ color: 'var(--ad-green)' }}>Live &amp; redeemable</span>
          </div>
        </div>

        {/* KPI 3: Scheduled */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap sessions">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
          <span className="admin-kpi-label">Scheduled</span>
          <div className="admin-kpi-value" style={{ color: 'var(--ad-blue)' }}>{kpis.scheduled}</div>
          <div className="admin-kpi-trend">
            <span style={{ color: 'var(--ad-blue)' }}>Upcoming launches</span>
          </div>
        </div>

        {/* KPI 4: Expired */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap rate">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <span className="admin-kpi-label">Expired</span>
          <div className="admin-kpi-value" style={{ color: 'var(--ad-text-muted)' }}>{kpis.expired}</div>
          <div className="admin-kpi-trend">
            <span style={{ color: 'var(--ad-text-muted)' }}>Past or exhausted</span>
          </div>
        </div>

        {/* KPI 5: Total Redemptions */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap tokens">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
          </div>
          <span className="admin-kpi-label">Total redemptions</span>
          <div className="admin-kpi-value" style={{ color: 'var(--ad-purple)' }}>{kpis.total_redemptions}</div>
          <div className="admin-kpi-trend">
            <span style={{ color: 'var(--ad-purple)' }}>Coupons applied</span>
          </div>
        </div>
      </section>

      {/* Main Promotions Management Card */}
      <div className="admin-management-card">
        {/* Header & Filter Bar */}
        <div className="admin-filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 className="admin-chart-title" style={{ margin: 0 }}>Promotions &amp; Special Offers</h3>
            <span style={{ fontSize: '13px', color: 'var(--ad-text-muted)' }}>
              ({(promotionsData?.promotions || []).length} promotions)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input-styled"
              style={{ width: '220px', padding: '6px 12px' }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select-styled"
              style={{ padding: '6px 12px' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              className="admin-btn-primary"
              onClick={openCreateModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>＋</span> Create Promotion
            </button>
          </div>
        </div>

        {/* Promotions Data Table */}
        <div className="admin-table-responsive">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Promotion Name</th>
                <th>Coupon Code</th>
                <th>Offer Type</th>
                <th>Discount / Bonus</th>
                <th>Eligible Products</th>
                <th>Validity Period</th>
                <th>Redemptions</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(promotionsData?.promotions || []).map((p) => {
                const dynamicStatus = p.calculated_status || p.status;
                const maxRedemptionsText = p.max_redemptions
                  ? `${p.redemption_count || 0} / ${p.max_redemptions}`
                  : `${p.redemption_count || 0} (No limit)`;

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ad-text)' }}>{p.name}</div>
                      {p.description && (
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-muted)', marginTop: '2px', maxWidth: '220px' }}>
                          {p.description}
                        </div>
                      )}
                      {p.attachment && (
                        <div style={{ marginTop: '4px' }}>
                          <a
                            href={p.attachment.data_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={p.attachment.name}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#38bdf8',
                              textDecoration: 'none',
                              background: 'rgba(56, 189, 248, 0.1)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                            }}
                            title={`Download ${p.attachment.name} (${p.attachment.size})`}
                          >
                            📎 {p.attachment.name} ({p.attachment.size})
                          </a>
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="admin-coupon-pill" title="Click to copy code">
                        🏷️ {p.code}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '12.5px', color: 'var(--ad-text)' }}>
                        {OFFER_TYPES.find((t) => t.value === p.offer_type)?.label.replace(/^\d+\.\s*/, '') || p.offer_type}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--ad-purple)' }}>
                        {formatBenefit(p)}
                      </span>
                    </td>

                    <td style={{ fontSize: '12px', color: 'var(--ad-text-muted)', maxWidth: '160px' }}>
                      {Array.isArray(p.eligible_products) && p.eligible_products.includes('all')
                        ? 'All Products'
                        : p.eligible_products.join(', ')}
                    </td>

                    <td style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                      <div>Start: {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Immediate'}</div>
                      <div>End: {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'No expiry'}</div>
                    </td>

                    <td style={{ fontSize: '12.5px', fontWeight: 600 }}>
                      {maxRedemptionsText}
                    </td>

                    <td>{renderStatusBadge(dynamicStatus)}</td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="admin-sm-btn"
                          onClick={() => handleViewRedemptions(p)}
                          title="View customer redemptions"
                        >
                          👁 Details
                        </button>

                        <button
                          type="button"
                          className="admin-sm-btn"
                          onClick={() => openEditModal(p)}
                          title="Edit promotion settings"
                        >
                          ✏ Edit
                        </button>

                        <button
                          type="button"
                          className="admin-sm-btn"
                          onClick={() => handleToggleStatus(p)}
                          title={p.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {p.status === 'active' ? '⏸' : '▶'}
                        </button>

                        <button
                          type="button"
                          className="admin-sm-btn"
                          onClick={() => handleDeletePromo(p)}
                          style={{ color: 'var(--ad-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete promotion"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {(!promotionsData?.promotions || promotionsData.promotions.length === 0) && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-muted)' }}>
                    {loading ? 'Loading promotions...' : 'No promotions found. Click "Create Promotion" to launch an offer.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MODAL: CREATE / EDIT PROMOTION
          ==================================================================== */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <h3>{editingPromo ? `Edit Promotion: ${editingPromo.code}` : 'Create New Promotional Offer'}</h3>
              <button type="button" className="admin-close-x" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSavePromotion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-field-group">
                  <label>Promotion Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parakeet 50% Flash Sale"
                    className="admin-input-styled"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label>Coupon Code * (Uppercase)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FEONIX50"
                    className="admin-input-styled"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Get 50% discount on any monthly or yearly subscription"
                  className="admin-input-styled"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="admin-field-group">
                <label>Offer Type *</label>
                <select
                  className="admin-select-styled"
                  value={formData.offer_type}
                  onChange={(e) => setFormData({ ...formData, offer_type: e.target.value })}
                >
                  {OFFER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic inputs based on Offer Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="admin-field-group">
                  <label>Discount Percent (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 50"
                    className="admin-input-styled"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    className="admin-input-styled"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label>Bonus Credits Bundle</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    className="admin-input-styled"
                    value={formData.bonus_credits}
                    onChange={(e) => setFormData({ ...formData, bonus_credits: e.target.value })}
                  />
                </div>
              </div>

              {/* Eligible Products */}
              <div className="admin-field-group">
                <label>Eligible Products &amp; Packs</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {AVAILABLE_PRODUCTS.map((prod) => {
                    const isSelected = formData.eligible_products.includes(prod.id);
                    return (
                      <button
                        type="button"
                        key={prod.id}
                        onClick={() => handleProductToggle(prod.id)}
                        className={`admin-sm-btn ${isSelected ? 'active' : ''}`}
                        style={{
                          fontSize: '11.5px',
                          padding: '4px 10px',
                          background: isSelected ? 'var(--ad-purple)' : 'transparent',
                          color: isSelected ? '#ffffff' : 'var(--ad-text)',
                          borderColor: isSelected ? 'var(--ad-purple)' : 'var(--ad-border)',
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{prod.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Limits and Schedule */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="admin-field-group">
                  <label>Min Purchase (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = No min"
                    className="admin-input-styled"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label>Max Total Redemptions</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    className="admin-input-styled"
                    value={formData.max_redemptions}
                    onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label>Per-User Limit</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-input-styled"
                    value={formData.per_user_limit}
                    onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                  />
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-field-group">
                  <label>Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    className="admin-input-styled"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label>Expiry Date (Optional)</label>
                  <input
                    type="datetime-local"
                    className="admin-input-styled"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Attach File / Promotional Banner */}
              <div className="admin-field-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📎 Attached File / Promotional Banner</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)' }}>Optional (PNG, JPG, WebP, PDF up to 10MB)</span>
                </label>

                {formData.attachment ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(124, 58, 237, 0.1)',
                      border: '1px dashed var(--ad-purple)',
                      borderRadius: '10px',
                      marginTop: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {formData.attachment.type && formData.attachment.type.startsWith('image/') ? (
                        <img
                          src={formData.attachment.data_url}
                          alt="Attachment Preview"
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--ad-border)' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            background: 'var(--ad-card)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                          }}
                        >
                          📄
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ad-text)', fontSize: '13.5px' }}>
                          {formData.attachment.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                          {formData.attachment.size} • {formData.attachment.type || 'File'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={formData.attachment.data_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-sm-btn"
                        download={formData.attachment.name}
                        style={{ textDecoration: 'none' }}
                      >
                        👁 View
                      </a>
                      <button
                        type="button"
                        className="admin-sm-btn"
                        style={{ color: 'var(--ad-red)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        onClick={() => setFormData({ ...formData, attachment: null })}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      border: '1px dashed var(--ad-border)',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      background: 'rgba(0, 0, 0, 0.25)',
                      cursor: 'pointer',
                      marginTop: '6px',
                    }}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <div style={{ fontSize: '22px', marginBottom: '2px' }}>📁</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ad-text)' }}>
                      Click to attach file or promotional banner
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)', marginTop: '2px' }}>
                      Supports banners, flyers, posters, and PDF terms
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '4px 0' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                  <span>Show on public pricing page banner / deals</span>
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                  />
                  <span>Set as Active immediately</span>
                </label>
              </div>

              {formMsg.text && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: formMsg.type === 'ok' ? 'var(--ad-green-light)' : 'var(--ad-red-light)',
                    color: formMsg.type === 'ok' ? 'var(--ad-green)' : 'var(--ad-red)',
                  }}
                >
                  {formMsg.text}
                </div>
              )}

              <div className="admin-modal-actions" style={{ marginTop: '12px' }}>
                <button type="button" className="admin-sm-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingPromo ? 'Update Promotion' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: VIEW REDEMPTIONS AUDIT HISTORY
          ==================================================================== */}
      {showRedemptionsModal && viewingPromo && (
        <div className="admin-modal-backdrop" onClick={() => setShowRedemptionsModal(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '780px', width: '94%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <div>
                <h3>Redemption History — {viewingPromo.name} ({viewingPromo.code})</h3>
                <span style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                  Total redemptions: {redemptionsList.length}
                </span>
              </div>
              <button type="button" className="admin-close-x" onClick={() => setShowRedemptionsModal(false)}>✕</button>
            </div>

            {viewingPromo.attachment && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(124, 58, 237, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {viewingPromo.attachment.type && viewingPromo.attachment.type.startsWith('image/') ? (
                    <img
                      src={viewingPromo.attachment.data_url}
                      alt="Attached Banner"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px' }}>📄</span>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ad-text)', fontSize: '13px' }}>
                      Attached: {viewingPromo.attachment.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)' }}>
                      {viewingPromo.attachment.size} • {viewingPromo.attachment.type || 'File'}
                    </div>
                  </div>
                </div>

                <a
                  href={viewingPromo.attachment.data_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-sm-btn"
                  download={viewingPromo.attachment.name}
                  style={{ textDecoration: 'none' }}
                >
                  📥 Download Attachment
                </a>
              </div>
            )}

            <div className="admin-table-responsive" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Customer Email</th>
                    <th>Plan</th>
                    <th>Payment / Order</th>
                    <th>Original ₹</th>
                    <th>Discount ₹</th>
                    <th>Paid ₹</th>
                    <th>Bonus Credits</th>
                    <th>Redeemed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionsList.map((r) => (
                    <tr key={r.id || r._id}>
                      <td style={{ fontWeight: 600 }}>{r.user_email}</td>
                      <td><span className="admin-badge owner">{r.plan}</span></td>
                      <td style={{ fontSize: '11.5px', fontFamily: 'monospace' }}>
                        <div>{r.payment_id}</div>
                        {r.order_id && <div style={{ color: 'var(--ad-text-muted)' }}>{r.order_id}</div>}
                      </td>
                      <td>₹{r.original_amount}</td>
                      <td style={{ color: 'var(--ad-green)', fontWeight: 600 }}>-₹{r.discount_amount}</td>
                      <td style={{ fontWeight: 700 }}>₹{r.final_amount}</td>
                      <td style={{ color: 'var(--ad-purple)', fontWeight: 700 }}>
                        {r.bonus_credits > 0 ? `+${r.bonus_credits}` : '—'}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                        {new Date(r.redeemed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {redemptionsList.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                        {loadingRedemptions ? 'Loading redemptions...' : 'No customers have redeemed this promotion yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-primary" onClick={() => setShowRedemptionsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

