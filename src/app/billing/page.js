"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BillingPage() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/razorpay/subscription')
      .then(r => r.json())
      .then(d => setSub(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
        <h1 style={s.title}>💳 Subscription & Billing</h1>
        <p style={s.subtitle}>Manage your membership, payment methods, and invoice history</p>

        {loading ? (
          <div style={s.center}>Loading subscription details...</div>
        ) : (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <span style={s.planBadge(sub?.plan)}>{(sub?.plan || 'Free').toUpperCase()} PLAN</span>
                <h2 style={s.planTitle}>Current Subscription</h2>
              </div>
              <Link href="/pricing" style={s.changePlanBtn}>Change Plan</Link>
            </div>

            <div style={s.detailsGrid}>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Subscription Status</div>
                <div style={s.detailValue}>{sub?.status || 'Free Tier'}</div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Payment Details Added</div>
                <div style={{ ...s.detailValue, color: sub?.payment_details_added ? '#34d399' : '#f59e0b' }}>
                  {sub?.payment_details_added ? '✓ Paid via Razorpay' : 'Not Added Yet'}
                </div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Free Trial Status</div>
                <div style={{ ...s.detailValue, color: sub?.trials_remaining > 0 ? '#34d399' : '#fbbf24' }}>
                  {sub?.trials_remaining > 0 ? `${sub.trials_remaining} Free Trials Left` : '5 Free Credits Completed'}
                </div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Credit Balance</div>
                <div style={{ ...s.detailValue, color: '#00f5ff' }}>
                  {sub?.credits_balance ?? 0} Credits
                </div>
              </div>
            </div>

            <div style={s.promoBox}>
              <div>
                <strong>{sub?.payment_details_added ? 'Credits run low? Top up anytime' : '5 Free Credits Period Status'}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                  {sub?.payment_details_added
                    ? 'Every plan purchase adds credits on top of what you already have — buy again whenever you need more.'
                    : sub?.trials_remaining === 0
                      ? 'You have completed all 5 free credits. Upgrade via Razorpay to add paid credits and continue.'
                      : 'You are using your initial 5 free trial credits. Upgrade to Pro/Premium for high quotas.'}
                </p>
              </div>
              <Link href="/pricing" style={s.upgradeBtn}>
                {sub?.payment_details_added ? 'Buy More Credits →' : 'Upgrade with Razorpay →'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 720, margin: '0 auto', padding: '40px 24px' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 800, margin: '12px 0 4px' },
  subtitle: { color: '#64748b', fontSize: 14.5, margin: '0 0 24px' },
  center: { textAlign: 'center', padding: '60px 0', color: '#64748b' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  planBadge: (plan) => ({
    fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.06em',
    background: plan === 'pro' ? 'rgba(0,245,255,0.15)' : plan === 'premium' ? 'rgba(168,85,247,0.15)' : 'rgba(100,116,139,0.15)',
    color: plan === 'pro' ? '#00f5ff' : plan === 'premium' ? '#c084fc' : '#94a3b8',
  }),
  planTitle: { fontSize: 22, fontWeight: 800, margin: '8px 0 0', color: '#f8fafc' },
  changePlanBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  detailLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' },
  detailValue: { fontSize: 15, fontWeight: 700, color: '#cbd5e1' },
  promoBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px', fontSize: 13.5, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  upgradeBtn: { background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', borderRadius: 8, padding: '8px 18px', fontWeight: 800, fontSize: 13, textDecoration: 'none', flexShrink: 0 },
};
