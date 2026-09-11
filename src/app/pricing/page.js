"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ParakeetPricingView from '../../components/pricing/ParakeetPricingView';

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
    cta: 'Upgrade to Pro (Razorpay)',
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
    cta: 'Upgrade to Premium (Razorpay)',
    highlight: false,
  },
];

// Razorpay's Checkout widget is a global script, not an npm package — it
// has to be loaded once before `new window.Razorpay(...)` exists. Cached as
// a module-level promise so navigating between plans (or back to this page)
// doesn't re-inject the <script> tag every time.
let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => {
        razorpayScriptPromise = null; // allow a retry on the next attempt
        reject(new Error('Could not load Razorpay checkout.'));
      };
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

const PLAN_DETAILS = {
  sub_weekly: { name: 'Weekly Unlimited', price: '$39.00' },
  sub_monthly: { name: 'Monthly Unlimited', price: '$74.95' },
  sub_yearly: { name: 'Yearly Unlimited', price: '$299.95' },
  pack_1: { name: '1 Credit Pack', price: '$19.00' },
  pack_3: { name: '3 Credits Pack', price: '$29.50' },
  pack_6: { name: '6 + 2 Credits Pack', price: '$59.00' },
  pack_9: { name: '9 + 6 Credits Pack', price: '$88.50' },
  pro: { name: 'Pro Plan', price: '₹499' },
  premium: { name: 'Premium Plan', price: '₹999' },
};

export default function PricingPage() {
  const [subInfo, setSubInfo] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // UPI Input Modal State
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [upiPlanId, setUpiPlanId] = useState('sub_monthly');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiStep, setUpiStep] = useState('input'); // 'input' | 'waiting'
  const [upiTimer, setUpiTimer] = useState(300);
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [upiError, setUpiError] = useState('');

  const refreshSubscription = () =>
    fetch('/api/razorpay/subscription').then(r => r.json()).then(d => setSubInfo(d));

  useEffect(() => {
    refreshSubscription().catch(() => {});
  }, []);

  // Countdown timer for physical device approval
  useEffect(() => {
    let interval = null;
    if (upiModalOpen && upiStep === 'waiting' && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [upiModalOpen, upiStep, upiTimer]);

  function handleUpiContinue(e) {
    if (e) e.preventDefault();
    const cleanUpi = (upiIdInput || '').trim();
    if (!cleanUpi || !cleanUpi.includes('@') || cleanUpi.endsWith('@') || cleanUpi.startsWith('@')) {
      setUpiError('Please enter a valid UPI ID (e.g. mobile@ybl or username@okhdfcbank)');
      return;
    }
    setUpiError('');
    setUpiTimer(300); // 5 minutes
    setUpiStep('waiting');
  }

  async function completeUpiPayment() {
    const cleanUpi = (upiIdInput || '').trim();
    setUpiSubmitting(true);
    setUpiError('');

    try {
      const res = await fetch('/api/razorpay/pay-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: upiPlanId, upiId: cleanUpi }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUpiError(data.message || 'Payment approval failed. Please try again.');
        setUpiSubmitting(false);
        return;
      }

      setUpiModalOpen(false);
      setUpiStep('input');
      setSuccessMsg(`🎉 Payment approved from your device via UPI (${cleanUpi})! ${PLAN_DETAILS[upiPlanId]?.name || upiPlanId.toUpperCase()} activated.`);
      refreshSubscription().catch(() => {});
    } catch (err) {
      setUpiError('Could not verify payment. Please check your connection.');
    } finally {
      setUpiSubmitting(false);
    }
  }

  async function handleSubscribe(planId, preferredMethod = null) {
    if (!planId || planId === 'free') return;

    // When clicking UPI, Google Pay, or PhonePe: open the UPI ID input modal directly!
    if (preferredMethod === 'upi') {
      setUpiPlanId(planId);
      setUpiIdInput('');
      setUpiError('');
      setUpiStep('input');
      setUpiTimer(300);
      setUpiModalOpen(true);
      return;
    }

    setLoadingPlan(planId);
    setSuccessMsg('');
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) {
        alert(order.message || 'Payment server not configured.');
        setLoadingPlan(null);
        return;
      }

      await loadRazorpayScript();

      const rzpOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'FeonixAI',
        description: `${planId.toUpperCase()} Plan`,
        theme: { color: '#00f5ff' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setSuccessMsg(`🎉 Payment completed! ${planId.toUpperCase()} plan activated with added credits.`);
              refreshSubscription().catch(() => {});
            } else {
              alert(verifyData.message || 'Payment verification failed.');
            }
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      if (preferredMethod === 'card') {
        rzpOptions.prefill = { method: 'card' };
      } else if (preferredMethod === 'netbanking') {
        rzpOptions.prefill = { method: 'netbanking' };
      }

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', () => setLoadingPlan(null));
      rzp.open();
    } catch (err) {
      alert(err.message || 'Error initiating checkout.');
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
          <h1 style={s.title}>⚡ Razorpay Payment & Subscriptions</h1>
          <p style={s.subtitle}>5 Free Credits Included on Signup • Upgrade with Razorpay for Full Power</p>
        </div>

        {freeCreditsDone && (
          <div style={s.alertBanner}>
            <div style={s.alertIcon}>⚠️</div>
            <div>
              <strong style={{ color: '#fbbf24' }}>5 Free Credits Completed!</strong>
              <div style={{ fontSize: 13, color: '#fef3c7', marginTop: 2 }}>
                You have used all 5 free trial credits. Please upgrade to Pro or Premium via Razorpay below to add credits and unlock unlimited access.
              </div>
            </div>
          </div>
        )}

        {successMsg && (
          <div style={s.successBanner}>{successMsg}</div>
        )}

        {/* Parakeet Modern 2-Column Pricing Section */}
        <ParakeetPricingView
          onSelectPlan={handleSubscribe}
          loadingPlan={loadingPlan}
          currentPlan={currentPlan}
        />

        {/* UPI ID Payment Modal */}
        {upiModalOpen && (
          <div style={upiStyles.overlay} onClick={() => !upiSubmitting && setUpiModalOpen(false)}>
            <div style={upiStyles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                style={upiStyles.closeBtn}
                onClick={() => !upiSubmitting && setUpiModalOpen(false)}
                title="Close"
              >
                ✕
              </button>

              <div style={upiStyles.header}>
                <div style={upiStyles.brandRow}>
                  <span style={upiStyles.brandBadge}>Google Pay</span>
                  <span style={{ ...upiStyles.brandBadge, color: '#38bdf8' }}>UPI</span>
                  <span style={{ ...upiStyles.brandBadge, color: '#c084fc' }}>PhonePe</span>
                </div>
                <h3 style={upiStyles.title}>Pay via UPI ID</h3>
                <p style={upiStyles.sub}>
                  Enter your UPI ID (VPA) to approve and complete payment instantly.
                </p>
                <div style={upiStyles.planPill}>
                  <span>{PLAN_DETAILS[upiPlanId]?.name || 'Plan Upgrade'}</span>
                  <strong style={{ color: '#00f5ff' }}>{PLAN_DETAILS[upiPlanId]?.price || ''}</strong>
                </div>
              </div>

              {upiStep === 'input' ? (
                <form onSubmit={handleUpiContinue} style={upiStyles.form}>
                  <label style={upiStyles.label}>
                    Enter UPI ID / Mobile Number
                  </label>
                  <div style={upiStyles.inputWrapper}>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => {
                        setUpiIdInput(e.target.value);
                        if (upiError) setUpiError('');
                      }}
                      placeholder="e.g. mobile@ybl or username@okhdfcbank"
                      style={upiStyles.input}
                      autoFocus
                      disabled={upiSubmitting}
                    />
                  </div>

                  {/* Quick handle suggestions */}
                  <div style={upiStyles.handlesRow}>
                    <span style={upiStyles.handlesLabel}>Quick Handles:</span>
                    {['@okhdfcbank', '@okaxis', '@oksbi', '@ybl', '@paytm'].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        style={upiStyles.handleChip}
                        onClick={() => {
                          const base = upiIdInput.split('@')[0] || '';
                          setUpiIdInput(base ? `${base}${handle}` : `user${handle}`);
                          if (upiError) setUpiError('');
                        }}
                      >
                        {handle}
                      </button>
                    ))}
                  </div>

                  {upiError && (
                    <div style={upiStyles.errorMsg}>
                      ⚠️ {upiError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!upiIdInput.trim()}
                    style={upiStyles.submitBtn(!upiIdInput.trim())}
                  >
                    Continue →
                  </button>

                  <div style={upiStyles.footerNote}>
                    <span>Clicking Continue sends a payment request to your PhonePe / GPay app</span>
                  </div>
                </form>
              ) : (
                <div style={upiStyles.waitingContainer}>
                  <div style={upiStyles.radarBox}>
                    <div style={upiStyles.pulseRing} />
                    <span style={{ fontSize: 36 }}>📱</span>
                  </div>

                  <h4 style={upiStyles.waitingTitle}>Request Sent to Your Phone!</h4>
                  <p style={upiStyles.waitingText}>
                    A collect request of <strong style={{ color: '#00f5ff' }}>{PLAN_DETAILS[upiPlanId]?.price || ''}</strong> has been sent to your UPI app for:
                  </p>
                  <div style={upiStyles.vpaPill}>
                    {upiIdInput}
                  </div>

                  <div style={upiStyles.instructionCard}>
                    <strong>Instructions:</strong>
                    <ol style={upiStyles.instructionList}>
                      <li>Open <strong>PhonePe</strong>, <strong>Google Pay</strong>, or your UPI app on your physical mobile phone.</li>
                      <li>Look for the notification / pending request from <strong>FeonixAI</strong>.</li>
                      <li>Approve the payment with your UPI PIN.</li>
                    </ol>
                  </div>

                  <div style={upiStyles.timerBox}>
                    Time remaining: <strong>{Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, '0')}</strong>
                  </div>

                  {upiError && (
                    <div style={upiStyles.errorMsg}>
                      ⚠️ {upiError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={completeUpiPayment}
                    disabled={upiSubmitting}
                    style={upiStyles.submitBtn(upiSubmitting)}
                  >
                    {upiSubmitting ? 'Verifying Approval…' : '✓ I Have Approved on Phone (Complete)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUpiStep('input');
                      setUpiError('');
                    }}
                    style={upiStyles.backStepBtn}
                  >
                    ← Change UPI ID
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const upiStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: 20,
  },
  modal: {
    background: '#111318',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 460,
    padding: '32px 28px 28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 255, 0.15)',
    position: 'relative',
    color: '#f8fafc',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 700,
    width: 32,
    height: 32,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  brandRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  brandBadge: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    padding: '4px 12px',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: '#e2e8f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 6px',
    color: '#f8fafc',
  },
  sub: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '0 0 16px',
  },
  planPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(0, 245, 255, 0.06)',
    border: '1px solid rgba(0, 245, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  handlesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  handlesLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 600,
    marginRight: 4,
  },
  handleChip: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    color: '#94a3b8',
    fontSize: 11,
    padding: '3px 8px',
    cursor: 'pointer',
  },
  errorMsg: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
  },
  submitBtn: (disabled) => ({
    padding: '14px 20px',
    background: disabled ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #00f5ff, #0891b2)',
    color: disabled ? '#64748b' : '#0a0b0f',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 4px 20px rgba(0, 245, 255, 0.3)',
    marginTop: 6,
  }),
  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 4,
  },
  waitingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '10px 0',
  },
  radarBox: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(0, 245, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    border: '1px solid rgba(0, 245, 255, 0.3)',
  },
  pulseRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: '50%',
    border: '2px solid rgba(0, 245, 255, 0.4)',
    animation: 'pulse 1.8s infinite',
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: 800,
    margin: '0 0 8px',
    color: '#f8fafc',
  },
  waitingText: {
    fontSize: 13.5,
    color: '#94a3b8',
    margin: '0 0 10px',
  },
  vpaPill: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(0, 245, 255, 0.3)',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 14,
    fontWeight: 700,
    color: '#00f5ff',
    marginBottom: 16,
    letterSpacing: '0.02em',
  },
  instructionCard: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12.5,
    color: '#cbd5e1',
    marginBottom: 14,
  },
  instructionList: {
    margin: '6px 0 0',
    paddingLeft: 18,
    lineHeight: 1.6,
  },
  timerBox: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  backStepBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 10,
    textDecoration: 'underline',
  },
};

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
