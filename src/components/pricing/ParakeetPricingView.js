"use client";

import React, { useEffect, useState } from 'react';
import { detectCurrency, formatMoney, planAmount } from '../../lib/pricing';
import './pricing.css';

// Per-call prices assume 30 calls a month (one a day), each up to an hour.
const CALLS_PER_MONTH = 30;

const SUB_TIERS = [
  { id: 'sub_monthly', name: 'Monthly', badge: 'Most popular', badgeClass: 'pk-badge-yellow', months: 1, unit: 'Month' },
  { id: 'sub_yearly', name: 'Yearly', badge: 'Best value', badgeClass: 'pk-badge-amber', months: 12, unit: 'Year' },
];

const CREDIT_PACKS = [
  { id: 'pack_3', credits: 3 },
  { id: 'pack_6', credits: 8, paid: 6, free: 2 },
  { id: 'pack_9', credits: 15, paid: 9, free: 6 },
];

const PLAN_SUBTITLES = {
  sub_monthly: 'Monthly — Unlimited Calls.',
  sub_weekly: 'Weekly — Unlimited Calls.',
  sub_yearly: 'Yearly — Unlimited Calls.',
  pack_1: '1 Credit — Quick Assessment Session.',
  pack_3: '3 Credits — Call & Analysis Pack.',
  pack_6: '6 + 2 Free Credits — Call & Analysis Pack.',
  pack_9: '9 + 6 Free Credits — Call & Analysis Pack.',
};

function Radio({ checked }) {
  return <span className={`pk-radio ${checked ? 'is-checked' : ''}`} aria-hidden="true" />;
}

export default function ParakeetPricingView({
  onSelectPlan,
  loadingPlan = null,
  currentPlan = null,
  activePublicPromos = [],
  appliedCoupon = null,
  onApplyCoupon = null,
  onRemoveCoupon = null,
  couponValidating = false,
  couponError = '',
  currency: currencyProp = null,
  onSignupClick = null,
}) {
  const [inputCode, setInputCode] = useState('');
  const [planTab, setPlanTab] = useState('unlimited'); // 'unlimited' | 'credits'
  const [subPlan, setSubPlan] = useState('sub_monthly');
  const [subViewMode, setSubViewMode] = useState('total'); // 'total' | 'monthly' | 'call'
  const [creditPack, setCreditPack] = useState('pack_6');
  const [creditViewMode, setCreditViewMode] = useState('total'); // 'total' | 'credit'

  // Dedicated Checkout Modal State (matches user specification)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState('sub_monthly');
  const [modalCurrency, setModalCurrency] = useState('INR');
  const [referralInput, setReferralInput] = useState('');
  const [modalCoupon, setModalCoupon] = useState(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Detected after mount: the server render cannot know the visitor's country.
  const [detected, setDetected] = useState('USD');
  useEffect(() => { setDetected(detectCurrency()); }, []);
  const currency = currencyProp || detected;
  const money = (amount, opts) => formatMoney(amount, currency, opts);

  const activeSub = SUB_TIERS.find((t) => t.id === subPlan) || SUB_TIERS[0];
  const activeSubTotal = planAmount(activeSub.id, currency);
  const weeklyTotal = planAmount('sub_weekly', currency);
  const activePack = CREDIT_PACKS.find((p) => p.id === creditPack) || CREDIT_PACKS[1];
  const activePackTotal = planAmount(activePack.id, currency);
  const singleCredit = planAmount('pack_1', currency);

  // Opens the dedicated Checkout Modal with the selected plan details
  const openCheckout = (planId) => {
    const target = planId || (planTab === 'credits' ? activePack.id : activeSub.id);
    setCheckoutPlanId(target);
    setModalCurrency(currency === 'USD' ? 'USD' : 'INR');
    setCodeError('');
    if (appliedCoupon) {
      setModalCoupon(appliedCoupon);
      setReferralInput(appliedCoupon.code || '');
    }
    setCheckoutModalOpen(true);
  };

  const selectPlan = (id, method = null) => {
    openCheckout(id);
  };

  // Payment-method chips buy whatever is selected on the open tab.
  const handleSubClick = (method = null) => {
    selectPlan(planTab === 'credits' ? activePack.id : activeSub.id, method);
  };

  // Live validate discount / referral code
  const validateModalCode = async (codeToValidate, cur = modalCurrency, targetPlan = checkoutPlanId) => {
    const clean = (codeToValidate || referralInput).trim().toUpperCase();
    if (!clean) {
      setCodeError('Please enter a promotion or referral code.');
      return;
    }
    setIsValidatingCode(true);
    setCodeError('');
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: clean,
          plan: targetPlan,
          currency: cur,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setModalCoupon(data);
        setCodeError('');
        if (onApplyCoupon) onApplyCoupon(clean, targetPlan, cur);
      } else {
        setModalCoupon(null);
        setCodeError(data.message || 'Invalid or expired code.');
      }
    } catch {
      setCodeError('Could not validate code. Please check connection.');
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Currency toggle inside modal
  const handleCurrencySwitch = (newCur) => {
    setModalCurrency(newCur);
    if (modalCoupon && modalCoupon.valid && modalCoupon.promotion?.code) {
      validateModalCode(modalCoupon.promotion.code, newCur, checkoutPlanId);
    }
  };

  // Live price & discount calculations for the modal
  const baseCheckoutAmount = planAmount(checkoutPlanId, modalCurrency);
  let finalCheckoutAmount = baseCheckoutAmount;
  let discountAmount = 0;
  if (modalCoupon && modalCoupon.valid) {
    if (modalCoupon.final_amount !== undefined && modalCoupon.currency === modalCurrency) {
      finalCheckoutAmount = modalCoupon.final_amount;
      discountAmount = modalCoupon.discount_amount || (baseCheckoutAmount - finalCheckoutAmount);
    } else if (modalCoupon.promotion?.discount_percent > 0) {
      discountAmount = (baseCheckoutAmount * modalCoupon.promotion.discount_percent) / 100;
      finalCheckoutAmount = Math.max(1, baseCheckoutAmount - discountAmount);
    } else if (modalCoupon.discount_amount > 0) {
      discountAmount = modalCoupon.discount_amount;
      finalCheckoutAmount = Math.max(1, baseCheckoutAmount - discountAmount);
    }
  }

  // Handle Checkout Click: launches payment gateway with applied discount
  const handleProceedCheckout = async () => {
    setIsProcessingCheckout(true);
    setCodeError('');
    const targetPlan = checkoutPlanId;
    const targetCurrency = modalCurrency;
    const appliedCode = modalCoupon?.valid ? modalCoupon.promotion?.code : (referralInput.trim() ? referralInput.trim().toUpperCase() : null);

    if (onSelectPlan) {
      onSelectPlan(targetPlan, null, targetCurrency, appliedCode);
      setCheckoutModalOpen(false);
      setIsProcessingCheckout(false);
      return;
    }

    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: targetPlan,
          currency: targetCurrency,
          coupon_code: appliedCode,
        }),
      });

      const order = await orderRes.json();
      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pending_checkout', JSON.stringify({
              plan: targetPlan,
              currency: targetCurrency,
              coupon_code: appliedCode,
            }));
          }
          setCheckoutModalOpen(false);
          if (onSignupClick) onSignupClick();
          else window.location.href = '/?auth=register';
          return;
        }
        throw new Error(order.message || 'Payment server not ready.');
      }

      if (typeof window !== 'undefined') {
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load Razorpay payment gateway'));
            document.body.appendChild(s);
          });
        }

        const rzp = new window.Razorpay({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          order_id: order.order_id,
          name: 'Feonix AI',
          description: `${PLAN_SUBTITLES[targetPlan] || targetPlan.toUpperCase()} Checkout`,
          theme: { color: '#22c55e' },
          handler: async (resp) => {
            try {
              const vRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  plan: targetPlan,
                  coupon_code: appliedCode,
                }),
              });
              const vData = await vRes.json();
              if (vRes.ok && vData.success) {
                alert(`🎉 Payment Successful! Your ${targetPlan} plan has been activated.`);
                window.location.reload();
              } else {
                alert(vData.message || 'Payment verification failed.');
              }
            } catch {
              alert('Could not verify payment.');
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessingCheckout(false);
            },
          },
        });
        rzp.open();
        setCheckoutModalOpen(false);
      }
    } catch (err) {
      setCodeError(err.message || 'Could not connect to payment gateway.');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const subPrice = (tier) => {
    const total = planAmount(tier.id, currency);
    if (subViewMode === 'call') {
      return { main: money(total / tier.months / CALLS_PER_MONTH, { decimals: true }), unit: '/ call*', note: `${money(total)} / ${tier.unit}` };
    }
    if (subViewMode === 'monthly') {
      return { main: money(total / tier.months, { decimals: tier.months > 1 }), unit: '/ Month', note: tier.months > 1 ? `${money(total)} / ${tier.unit}` : null };
    }
    return { main: money(total), unit: `/ ${tier.unit}`, note: null };
  };

  const packPrice = (pack) => {
    const total = planAmount(pack.id, currency);
    if (creditViewMode === 'credit') {
      return { main: money(total / pack.credits, { decimals: true }), unit: '/ credit', note: `${money(total)} total` };
    }
    return { main: money(total), unit: '', note: null };
  };

  const couponSuffix = (kind) => {
    if (!appliedCoupon) return '';
    if (kind === 'credits' && appliedCoupon.bonus_credits > 0) return ` (+ ${appliedCoupon.bonus_credits} Bonus Credits!)`;
    return ` (Coupon ${appliedCoupon.code} Applied)`;
  };

  const selectOnKey = (e, select) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select();
    }
  };

  return (
    <section className="pk-pricing-section" id="pricing">
      {/* Centered Section Header */}
      <div className="pk-pricing-header">
        <div className="pk-pricing-badge">✦ Transparent Pricing</div>
        <h2 className="pk-pricing-title">
          Subscribe for unlimited peace of mind, or buy credits and use them whenever.
        </h2>
        <p className="pk-pricing-subtitle">
          Engineered for live interviews and high-stakes technical assessments with real-time stealth copilot.
        </p>
      </div>

      {/* Unlimited / Credits tabs */}
      <div className="pk-plan-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={planTab === 'unlimited'}
          className={`pk-plan-tab ${planTab === 'unlimited' ? 'is-active' : ''}`}
          onClick={() => setPlanTab('unlimited')}
        >
          Unlimited
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={planTab === 'credits'}
          className={`pk-plan-tab ${planTab === 'credits' ? 'is-active' : ''}`}
          onClick={() => setPlanTab('credits')}
        >
          Credits
        </button>
      </div>

      <div className="pk-pricing-single">
        {planTab === 'unlimited' ? (
          /* ================= UNLIMITED ================= */
          <div className="pk-card pk-card-sub">
            <div className="pk-card-top">
              <h3 className="pk-card-title">Unlimited</h3>
              <span className="pk-tag-recommended">✳ Recommended</span>
            </div>
            <p className="pk-card-desc">Stop counting. Everything covered, for as long as you need it.</p>

            <div className="pk-switch-row">
              <div className="pk-segmented-pills">
                {[['total', 'Total'], ['monthly', 'Per month'], ['call', 'Per call']].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={`pk-pill-btn ${subViewMode === mode ? 'is-active' : ''}`}
                    onClick={() => setSubViewMode(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pk-options-list" role="radiogroup">
              {SUB_TIERS.map((tier) => {
                const isSelected = subPlan === tier.id;
                const price = subPrice(tier);
                return (
                  <div
                    key={tier.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`pk-option-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSubPlan(tier.id)}
                    onKeyDown={(e) => selectOnKey(e, () => setSubPlan(tier.id))}
                  >
                    <div className="pk-option-left">
                      <Radio checked={isSelected} />
                      <div className="pk-option-title-row">
                        <span className="pk-option-name">{tier.name}</span>
                        <span className={tier.badgeClass}>{tier.badge}</span>
                      </div>
                    </div>
                    <div className="pk-option-price-wrap">
                      <div>
                        <span className="pk-option-price">{price.main}</span>
                        <span className="pk-option-period"> {price.unit}</span>
                      </div>
                      {price.note && <div className="pk-option-note">{price.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {subViewMode === 'call' && (
              <p className="pk-footnote-text">* Assumes 30 calls a month (1 a day), each up to an hour</p>
            )}

            <ul className="pk-features-list">
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>Unlimited call sessions (& mock)</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>Full privacy mode</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>20 resume PDF downloads a day</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>30 headshots a day</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>Full Question Bank access</span></li>
            </ul>

            <button
              type="button"
              className={`pk-action-btn-main pk-btn-unlimited ${loadingPlan === activeSub.id ? 'pk-btn-loading-state' : ''}`}
              onClick={() => selectPlan(activeSub.id)}
              disabled={loadingPlan === activeSub.id}
            >
              {loadingPlan === activeSub.id
                ? 'Opening Checkout…'
                : `Go Unlimited · ${activeSub.name} ${money(activeSubTotal)}${couponSuffix('sub')}`}
            </button>
            <div className="pk-action-single-credit">
              or, only need a week?{' '}
              <button
                type="button"
                className="pk-single-link"
                onClick={() => selectPlan('sub_weekly')}
                disabled={loadingPlan === 'sub_weekly'}
              >
                {loadingPlan === 'sub_weekly' ? 'Opening Checkout…' : `Weekly plan for ${money(weeklyTotal)} / week`}
              </button>
            </div>
          </div>
        ) : (
          /* ================= CREDITS ================= */
          <div className="pk-card pk-card-credits">
            <div className="pk-card-top">
              <h3 className="pk-card-title">Credits</h3>
            </div>
            <p className="pk-card-desc">Buy a pack of credits and use them whenever.</p>

            <div className="pk-switch-row">
              <div className="pk-segmented-pills">
                {[['total', 'Total'], ['credit', 'Per credit']].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={`pk-pill-btn ${creditViewMode === mode ? 'is-active' : ''}`}
                    onClick={() => setCreditViewMode(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pk-options-list" role="radiogroup">
              {CREDIT_PACKS.map((pack) => {
                const isSelected = creditPack === pack.id;
                const price = packPrice(pack);
                return (
                  <div
                    key={pack.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`pk-option-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setCreditPack(pack.id)}
                    onKeyDown={(e) => selectOnKey(e, () => setCreditPack(pack.id))}
                  >
                    <div className="pk-option-left">
                      <Radio checked={isSelected} />
                      <div className="pk-option-label-wrap">
                        <span className="pk-option-name">{pack.credits} Credits</span>
                        {pack.free > 0 && (
                          <span className="pk-option-sub">
                            {pack.paid} credits <span className="pk-badge-yellow">+{pack.free} free</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pk-option-price-wrap">
                      <div>
                        <span className="pk-option-price">{price.main}</span>
                        {price.unit && <span className="pk-option-period"> {price.unit}</span>}
                      </div>
                      {price.note && <div className="pk-option-note">{price.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <ul className="pk-features-list">
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>0.5 Credit = 30 min call session (& mock)</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>Full privacy mode</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>1 Credit = 1 resume PDF download</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>1 Credit = 1 headshot</span></li>
              <li className="pk-feature-item"><span className="pk-check-icon">✓</span><span>1 Credit = 1 Question Bank position</span></li>
            </ul>

            <button
              type="button"
              className={`pk-action-btn-main pk-btn-credits ${loadingPlan === activePack.id ? 'pk-btn-loading-state' : ''}`}
              onClick={() => selectPlan(activePack.id)}
              disabled={loadingPlan === activePack.id}
            >
              {loadingPlan === activePack.id
                ? 'Opening Checkout…'
                : `Get ${activePack.credits} Credits · ${money(activePackTotal)}${couponSuffix('credits')}`}
            </button>
            <div className="pk-action-single-credit">
              or, just need 1 credit?{' '}
              <button
                type="button"
                className="pk-single-link"
                onClick={() => selectPlan('pack_1')}
                disabled={loadingPlan === 'pack_1'}
              >
                {loadingPlan === 'pack_1' ? 'Opening Checkout…' : `1 credit for ${money(singleCredit)}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= COUPON CODE & PROMOTIONAL DISCOUNT BOX ================= */}
      <div className="pk-coupon-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🏷️ Have a Coupon or Promotional Code?
          </span>
          {appliedCoupon && (
            <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>
              Discount Active
            </span>
          )}
        </div>

        <form
          className="pk-coupon-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (onApplyCoupon && inputCode.trim()) {
              onApplyCoupon(inputCode.trim(), planTab === 'credits' ? activePack.id : activeSub.id, currency);
            }
          }}
        >
          <input
            type="text"
            className="pk-coupon-input"
            placeholder="ENTER COUPON CODE (E.G. FEONIX50)"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            disabled={couponValidating}
          />
          <button
            type="submit"
            className="pk-coupon-btn"
            disabled={couponValidating || !inputCode.trim()}
          >
            {couponValidating ? 'Checking…' : 'Apply Coupon'}
          </button>
        </form>

        {appliedCoupon && (
          <div className="pk-coupon-success">
            <div>
              <strong>✓ Coupon {appliedCoupon.code} Applied: </strong>
              <span>{appliedCoupon.name || 'Promotional Deal'}</span>
              {appliedCoupon.discount_amount > 0 && (
                <span> • Saved {money(Number(appliedCoupon.discount_amount))}</span>
              )}
              {appliedCoupon.bonus_credits > 0 && (
                <span style={{ color: '#c084fc', fontWeight: 700 }}>
                  {' '}• 🎁 +{appliedCoupon.bonus_credits} Bonus Credits included!
                </span>
              )}
            </div>
            <button
              type="button"
              className="pk-coupon-remove-btn"
              onClick={() => {
                if (onRemoveCoupon) onRemoveCoupon();
                setInputCode('');
              }}
            >
              Remove
            </button>
          </div>
        )}

        {couponError && (
          <div className="pk-coupon-error">
            ⚠️ {couponError}
          </div>
        )}
      </div>

      {/* ================= BOTTOM TRUST HIGHLIGHTS ================= */}
      <div className="pk-trust-row">
        <div className="pk-trust-item">
          <div className="pk-trust-icon">🌐</div>
          <div className="pk-trust-text">
            <span className="pk-trust-title">Top Models</span>
            <span className="pk-trust-sub">From OpenAI, Anthropic & Google</span>
          </div>
        </div>

        <div className="pk-trust-item">
          <div className="pk-trust-icon">🛡️</div>
          <div className="pk-trust-text">
            <span className="pk-trust-title">Refund policy</span>
            <span className="pk-trust-sub">
              <a href="/privacy" className="pk-trust-link">Learn more ↗</a>
            </span>
          </div>
        </div>

        <div className="pk-trust-item">
          <div className="pk-trust-icon">🔄</div>
          <div className="pk-trust-text">
            <span className="pk-trust-title">How do credits work?</span>
            <span className="pk-trust-sub">
              <a href="#how-it-works" className="pk-trust-link">See video ↗</a>
            </span>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT METHODS BAR ================= */}
      <div className="pk-payment-bar">
        <span className="pk-payment-label">Pay with</span>
        <div className="pk-payment-chips">

          {/* VISA */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('card')} title="Pay with VISA">
            <svg className="pk-pay-logo" viewBox="0 0 38 12" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 0.5L11.5 11.5H9L12 0.5H14.5Z" fill="#1A1F71"/>
              <path d="M23.5 0.7C22.9 0.5 22 0.3 20.8 0.3C18.2 0.3 16.3 1.6 16.3 3.5C16.3 4.9 17.6 5.7 18.6 6.1C19.6 6.6 20 6.9 20 7.3C20 7.9 19.2 8.2 18.5 8.2C17.5 8.2 17 8.1 16.1 7.7L15.7 7.5L15.3 9.8C16 10.1 17.3 10.4 18.6 10.4C21.4 10.4 23.2 9.1 23.2 7.1C23.2 6 22.5 5.1 21 4.4C20.1 3.9 19.5 3.6 19.5 3.1C19.5 2.7 20 2.3 20.9 2.3C21.6 2.3 22.2 2.4 22.7 2.6L22.9 2.7L23.5 0.7Z" fill="#1A1F71"/>
              <path d="M27.5 7.2L28.8 3.8C28.8 3.8 29.1 3 29.3 2.5L29.5 3.7L30.3 7.2H27.5ZM33 0.5H30.9C30.2 0.5 29.7 0.7 29.4 1.4L25.5 11.5H28.3L28.8 10H32.2L32.5 11.5H35L33 0.5Z" fill="#1A1F71"/>
              <path d="M6.5 0.5L3.9 7.9L3.6 6.5C3.1 4.9 1.6 3.1 0 2.1L2.4 11.5H5.3L9.4 0.5H6.5Z" fill="#1A1F71"/>
              <path d="M1.5 0.5H-2.5C-2.5 0.5 3.3 2.1 3.6 6.5L2.7 1.5C2.5 0.8 2 0.5 1.5 0.5Z" fill="#F9A51A"/>
            </svg>
            <span>VISA</span>
          </button>

          {/* Mastercard */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('card')} title="Pay with Mastercard">
            <svg className="pk-pay-logo" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="12" r="10" fill="#EB001B"/>
              <circle cx="24" cy="12" r="10" fill="#F79E1B"/>
              <path d="M19 4.8A10 10 0 0 1 23.2 12 10 10 0 0 1 19 19.2 10 10 0 0 1 14.8 12 10 10 0 0 1 19 4.8Z" fill="#FF5F00"/>
            </svg>
            <span>Mastercard</span>
          </button>

          {/* AMEX */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('card')} title="Pay with American Express">
            <svg className="pk-pay-logo" viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="20" rx="3" fill="#2E77BC"/>
              <text x="50%" y="14" dominantBaseline="auto" textAnchor="middle" fontFamily="'Arial Black',Arial" fontWeight="900" fontSize="9" fill="#ffffff" letterSpacing="0.5">AMEX</text>
            </svg>
          </button>

          {/* Apple Pay */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('card')} title="Pay with Apple Pay">
            {/* Apple logo */}
            <svg className="pk-pay-logo" viewBox="0 0 18 22" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 11.5c0-2.8 2.3-4.2 2.4-4.3-1.3-1.9-3.3-2.1-4-2.2-1.7-.2-3.3 1-4.2 1s-2.2-1-3.6-1C3.7 5 1.2 6.4.1 8.6c-2.2 4.5-.6 11.2 1.6 14.8 1 1.8 2.3 3.8 3.9 3.7 1.6-.1 2.2-.9 4-.9 1.9 0 2.4.9 4.1.8 1.7-.1 2.8-1.8 3.9-3.6 1.2-2 1.7-4 1.7-4.1-.1 0-3.3-1.3-3.3-5.8z" fill="#ffffff" transform="scale(0.55) translate(1,0)"/>
              <path d="M12 2C12.5.9 13.4.1 14.5 0c.1 1.2-.3 2.4-1 3.2-.7.9-1.7 1.5-2.8 1.5-.2-1.2.3-2.4 1.3-2.7z" fill="#ffffff" transform="scale(0.55) translate(1,0)"/>
            </svg>
            <span>Apple Pay</span>
          </button>

          {/* Google Pay */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('upi')} title="Pay with Google Pay">
            {/* G icon */}
            <svg className="pk-pay-logo" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-.9 2.3-1.9 3v2.5h3.1c1.8-1.7 2.9-4.1 2.9-7.1 0-.1.1-.2.1-.2z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H1v2.6C2.7 17.7 6.1 20 10 20z" fill="#34A853"/>
              <path d="M4.2 11.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V5.6H1C.4 6.8 0 8.4 0 10s.4 3.2 1 4.4l3.2-2.6z" fill="#FBBC05"/>
              <path d="M10 3.9c1.5 0 2.9.5 3.9 1.5L16.9 2C15 .2 12.6-.8 10-.8 6.1-.8 2.7 1.5 1 5.6l3.2 2.6C5 5.7 7.3 3.9 10 3.9z" fill="#EA4335"/>
            </svg>
            <span>Google Pay</span>
          </button>

          {/* UPI */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('upi')} title="Pay with UPI">
            {/* UPI arrows icon */}
            <svg className="pk-pay-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polygon points="11,2 19,12 11,22 7.5,18.5 13.5,12 7.5,5.5" fill="#097939"/>
              <polygon points="16,2 24,12 16,22 12.5,18.5 18.5,12 12.5,5.5" fill="#ed752e"/>
            </svg>
            <span>UPI</span>
          </button>

          {/* PhonePe */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('upi')} title="Pay with PhonePe">
            {/* PhonePe P icon */}
            <svg className="pk-pay-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#5f259f"/>
              <text x="3.5" y="18" fontFamily="'Arial Black',Arial" fontWeight="900" fontSize="15" fill="#ffffff">P</text>
              <circle cx="17" cy="8" r="3.5" fill="#cbacf9"/>
            </svg>
            <span>PhonePe</span>
          </button>

          {/* NetBanking */}
          <button type="button" className="pk-pay-chip" onClick={() => handleSubClick('netbanking')} title="Pay with NetBanking">
            {/* Bank building icon */}
            <svg className="pk-pay-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5"/>
              <rect x="5" y="10" width="3" height="7" rx="0.5"/>
              <rect x="10.5" y="10" width="3" height="7" rx="0.5"/>
              <rect x="16" y="10" width="3" height="7" rx="0.5"/>
              <line x1="2" y1="21" x2="22" y2="21"/>
              <line x1="2" y1="9.5" x2="22" y2="9.5"/>
            </svg>
            <span>NetBanking</span>
          </button>

        </div>
      </div>

      {/* ================= EXACT CHECKOUT POPUP MODAL ================= */}
      {checkoutModalOpen && (
        <div
          className="pk-checkout-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCheckoutModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="pk-checkout-modal">
            {/* Top Close Button (✕) */}
            <button
              type="button"
              className="pk-checkout-close"
              onClick={() => setCheckoutModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Title & Dynamic Plan Subtitle */}
            <h3 className="pk-checkout-title">Checkout</h3>
            <p className="pk-checkout-subtitle">
              {PLAN_SUBTITLES[checkoutPlanId] || 'Monthly — Unlimited Calls.'}
            </p>

            {/* Discount or Referral Code (Optional) Input */}
            <div className="pk-checkout-field">
              <label className="pk-checkout-label" htmlFor="pk-referral-input">
                Discount or Referral Code <span className="pk-checkout-label-opt">(Optional)</span>
              </label>
              <div className="pk-checkout-input-row">
                <input
                  id="pk-referral-input"
                  type="text"
                  className={`pk-checkout-input ${modalCoupon?.valid ? 'has-discount' : ''}`}
                  placeholder="Enter code"
                  value={referralInput}
                  onChange={(e) => {
                    setReferralInput(e.target.value);
                    if (codeError) setCodeError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      validateModalCode(referralInput);
                    }
                  }}
                  disabled={isValidatingCode}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="pk-checkout-apply-btn"
                  onClick={() => validateModalCode(referralInput)}
                  disabled={isValidatingCode || !referralInput.trim()}
                >
                  {isValidatingCode ? 'Checking…' : 'Apply'}
                </button>
              </div>

              {/* Dynamic Discount Applied Message */}
              {modalCoupon?.valid && (
                <div className="pk-checkout-discount-badge">
                  <span>
                    ✓ Code <strong>{modalCoupon.promotion?.code}</strong> applied!
                    {discountAmount > 0 && ` Saved ${formatMoney(discountAmount, modalCurrency)}`}
                    {modalCoupon.promotion?.discount_percent > 0 && ` (${modalCoupon.promotion.discount_percent}% Off)`}
                  </span>
                  <button
                    type="button"
                    className="pk-checkout-remove-code"
                    onClick={() => {
                      setModalCoupon(null);
                      setReferralInput('');
                      if (onRemoveCoupon) onRemoveCoupon();
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Validation Error Message */}
              {codeError && (
                <div className="pk-checkout-error-msg">
                  ⚠️ {codeError}
                </div>
              )}
            </div>

            {/* Currency Selector Row */}
            <div className="pk-checkout-currency-row">
              <span className="pk-checkout-currency-label">Currency</span>
              <div className="pk-checkout-currency-tabs" role="group" aria-label="Select Currency">
                <button
                  type="button"
                  className={`pk-checkout-currency-tab ${modalCurrency === 'INR' ? 'is-active' : ''}`}
                  onClick={() => handleCurrencySwitch('INR')}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  className={`pk-checkout-currency-tab ${modalCurrency === 'USD' ? 'is-active' : ''}`}
                  onClick={() => handleCurrencySwitch('USD')}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* Action Buttons: [ Close ] and [ Checkout ₹... ] */}
            <div className="pk-checkout-actions">
              <button
                type="button"
                className="pk-checkout-btn-close"
                onClick={() => setCheckoutModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="pk-checkout-btn-submit"
                onClick={handleProceedCheckout}
                disabled={isProcessingCheckout}
              >
                {isProcessingCheckout
                  ? 'Redirecting…'
                  : `Checkout ${formatMoney(finalCheckoutAmount, modalCurrency)}`}
              </button>
            </div>

            {/* Footer Trust Note */}
            <div className="pk-checkout-footer">
              <span className="pk-checkout-lock-icon">🔒</span>
              <span>Card or UPI payment via Stripe</span>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
