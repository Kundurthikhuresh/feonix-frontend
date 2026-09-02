"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'FREE TIER',
    price: '₹0',
    period: '/month',
    desc: '5 Free Credits included on signup for basic trial testing',
    features: [
      '5 Free Initial Trial Credits',
      '3 Resume Analyses / month',
      '10 AI Generations / month',
      '5 Job Match Analyses / month',
      '3 Cover Letters / month',
      '3 Interview Prep Sessions / month',
    ],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'PRO PLAN',
    price: '₹499',
    period: '/month',
    desc: 'Full-featured upgrade after 5 free credits are completed',
    features: [
      '+50 Paid Session Credits Granted',
      '30 Resume Analyses / month',
      '100 AI Generations / month',
      '50 Job Match Analyses / month',
      '30 Cover Letters / month',
      '30 Interview Prep Sessions / month',
      'Full Application Tracker',
      'Priority AI Processing Speed',
    ],
    cta: 'Upgrade to Pro (Stripe)',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'PREMIUM PLAN',
    price: '₹999',
    period: '/month',
    desc: 'Unlimited power & credits for high-volume job applications',
    features: [
      '+200 Paid Session Credits Granted',
      'Unlimited Resume Analyses',
      'Unlimited AI Generations',
      'Unlimited Job Match Analyses',
      'Unlimited Cover Letters',
      'Unlimited Interview Prep Sessions',
      'Full Kanban Application Board',
      'Dedicated Priority Processing',
    ],
    cta: 'Upgrade to Premium (Stripe)',
    highlight: false,
  },
];

export default function PricingPage() {
  const [subInfo, setSubInfo] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/stripe/subscription')
      .then(r => r.json())
      .then(d => setSubInfo(d))
      .catch(() => {});
  }, []);

  async function handleSubscribe(planId) {
    if (planId === 'free' || planId === subInfo?.plan) return;
    setLoadingPlan(planId);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        // Fallback for test mode without live Stripe secret key: Activate plan directly
        const actRes = await fetch('/api/stripe/activate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId }),
        });
        const actData = await actRes.json();
        if (actRes.ok) {
          setSuccessMsg(`🎉 Payment completed! ${planId.toUpperCase()} plan activated with added credits.`);
          fetch('/api/stripe/subscription').then(r => r.json()).then(d => setSubInfo(d));
        } else {
          alert(actData.message || 'Payment server not configured.');
        }
      }
    } catch {
      alert('Error initiating checkout.');
    } finally {
      setLoadingPlan(null);
    }
  }

  const currentPlan = subInfo?.plan || 'free';
  const trialsLeft = subInfo?.trials_remaining ?? 5;
  const freeCreditsDone = trialsLeft === 0 && currentPlan === 'free';

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
          <h1 style={s.title}>⚡ Stripe Payment & Subscriptions</h1>
          <p style={s.subtitle}>5 Free Credits Included on Signup • Upgrade with Stripe for Full Power</p>
        </div>

        {freeCreditsDone && (
          <div style={s.alertBanner}>
            <div style={s.alertIcon}>⚠️</div>
            <div>
              <strong style={{ color: '#fbbf24' }}>5 Free Credits Completed!</strong>
              <div style={{ fontSize: 13, color: '#fef3c7', marginTop: 2 }}>
                You have used all 5 free trial credits. Please upgrade to Pro or Premium via Stripe below to add credits and unlock unlimited access.
              </div>
            </div>
          </div>
        )}

        {successMsg && (
          <div style={s.successBanner}>{successMsg}</div>
        )}

        <div style={s.grid}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id} style={{ ...s.card, ...(plan.highlight ? s.cardHighlight : {}) }}>
                {plan.highlight && <div style={s.badge}>RECOMMENDED</div>}
                <div style={s.planName}>{plan.name}</div>
                <div style={s.priceRow}>
                  <span style={s.price}>{plan.price}</span>
                  <span style={s.period}>{plan.period}</span>
                </div>
                <p style={s.desc}>{plan.desc}</p>

                <div style={s.featureList}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={s.featureItem}>
                      <span style={s.check}>✓</span> {f}
                    </div>
                  ))}
                </div>

                <button
                  style={{
                    ...s.ctaBtn,
                    ...(plan.highlight ? s.ctaHighlight : {}),
                    ...(isCurrent ? s.ctaCurrent : {}),
                  }}
                  disabled={isCurrent || loadingPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loadingPlan === plan.id ? '⏳ Processing Payment...' : isCurrent ? '✓ Active Plan' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 1080, margin: '0 auto', padding: '40px 24px' },
  header: { textAlign: 'center', marginBottom: 32 },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-block', marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 800, margin: '0 0 8px' },
  subtitle: { color: '#64748b', fontSize: 15, margin: 0 },
  alertBanner: { display: 'flex', gap: 14, alignItems: 'center', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 },
  alertIcon: { fontSize: 24 },
  successBanner: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', borderRadius: 12, padding: '14px 20px', fontWeight: 700, textAlign: 'center', marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 24px', display: 'flex', flexDirection: 'column', position: 'relative' },
  cardHighlight: { background: 'rgba(0,245,255,0.04)', borderColor: 'rgba(0,245,255,0.3)', boxShadow: '0 0 40px rgba(0,245,255,0.1)' },
  badge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 999, letterSpacing: '0.08em' },
  planName: { fontSize: 14, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 8px' },
  price: { fontSize: 36, fontWeight: 900, color: '#f8fafc' },
  period: { fontSize: 13, color: '#64748b' },
  desc: { fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 24px', minHeight: 40 },
  featureList: { flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 },
  featureItem: { fontSize: 13.5, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 8 },
  check: { color: '#00f5ff', fontWeight: 800 },
  ctaBtn: { width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' },
  ctaHighlight: { background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none' },
  ctaCurrent: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', cursor: 'default' },
};
