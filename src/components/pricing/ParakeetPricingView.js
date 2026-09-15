"use client";

import React, { useState } from 'react';
import './pricing.css';

export default function ParakeetPricingView({
  onSelectPlan,
  loadingPlan = null,
  currentPlan = null,
}) {
  // Subscription Card State
  const [subPeriod, setSubPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [subViewMode, setSubViewMode] = useState('hourly'); // 'total' | 'monthly' | 'hourly'

  // Credits Card State
  const [creditPack, setCreditPack] = useState('pack_6'); // 'pack_3' | 'pack_6' | 'pack_9' | 'pack_1'
  const [creditViewMode, setCreditViewMode] = useState('total'); // 'total' | 'hourly'

  // Subscription Pricing Data (half of reference image prices)
  const subTiers = {
    weekly: {
      id: 'sub_weekly',
      name: 'Weekly',
      totalPrice: '$39.00',
      periodLabel: '/ Week',
      perMonthPrice: '$156.00',
      perHourPrice: '$5.63',
      btnText: 'Go Unlimited · Weekly $39.00',
    },
    monthly: {
      id: 'sub_monthly',
      name: 'Monthly',
      badge: 'Most popular',
      totalPrice: '$74.95',
      periodLabel: '/ Month',
      perMonthPrice: '$74.95',
      perHourPrice: '$2.50',
      btnText: 'Go Unlimited · Monthly $74.95',
    },
    yearly: {
      id: 'sub_yearly',
      name: 'Yearly',
      badge: 'Best value',
      totalPrice: '$299.95',
      periodLabel: '/ Year',
      perMonthPrice: '$24.99',
      perHourPrice: '$0.83',
      btnText: 'Go Unlimited · Yearly $299.95',
    },
  };

  // Credit Packs Data (half of previous prices)
  const creditPacks = {
    pack_3: {
      id: 'pack_3',
      name: '3 Credits',
      credits: 3,
      totalPrice: '$29.50',
      perHourPrice: '$4.92 / hour',
      btnText: 'Get 3 Credits · $29.50',
    },
    pack_6: {
      id: 'pack_6',
      name: '6 Credits',
      badge: '+2 free',
      sub: '8 total credits',
      credits: 8,
      totalPrice: '$59.00',
      perHourPrice: '$7.38 / hour',
      btnText: 'Get 6 + 2 Credits · $59.00',
    },
    pack_9: {
      id: 'pack_9',
      name: '9 Credits',
      badge: '+6 free',
      sub: '15 total credits',
      credits: 15,
      totalPrice: '$88.50',
      perHourPrice: '$5.90 / hour',
      btnText: 'Get 9 + 6 Credits · $88.50',
    },
    pack_1: {
      id: 'pack_1',
      name: '1 Credit',
      credits: 1,
      totalPrice: '$19.00',
      perHourPrice: '$19.00 / hour',
      btnText: 'Get 1 Credit · $19.00',
    },
  };

  const activeSub = subTiers[subPeriod] || subTiers.monthly;
  const activePack = creditPacks[creditPack] || creditPacks.pack_6;

  const handleSubClick = (method = null) => {
    if (onSelectPlan) onSelectPlan(activeSub.id, method);
  };

  const handleCreditClick = (packId = null, method = null) => {
    const id = packId || activePack.id;
    if (onSelectPlan) onSelectPlan(id, method);
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

      {/* Two-Column Cards Grid */}
      <div className="pk-pricing-grid">
        {/* ================= LEFT: SUBSCRIPTION CARD ================= */}
        <div className="pk-card pk-card-sub">
          <div className="pk-card-head">
            <div>
              <div className="pk-card-title-wrap">
                <h3 className="pk-card-title">Subscription</h3>
                <span className="pk-tag-recommended">✳ Recommended</span>
              </div>
              <p className="pk-card-desc">Stop counting. Everything covered, for as long as you need it.</p>
            </div>

            {/* Switcher: Total / Per month / Per hour */}
            <div className="pk-segmented-pills">
              <button
                type="button"
                className={`pk-pill-btn ${subViewMode === 'total' ? 'is-active' : ''}`}
                onClick={() => setSubViewMode('total')}
              >
                Total
              </button>
              <button
                type="button"
                className={`pk-pill-btn ${subViewMode === 'monthly' ? 'is-active' : ''}`}
                onClick={() => setSubViewMode('monthly')}
              >
                Per month
              </button>
              <button
                type="button"
                className={`pk-pill-btn ${subViewMode === 'hourly' ? 'is-active' : ''}`}
                onClick={() => setSubViewMode('hourly')}
              >
                Per hour
              </button>
            </div>
          </div>

          {/* Radio Options: Weekly / Monthly / Yearly */}
          <div className="pk-options-list">
            {Object.keys(subTiers).map((key) => {
              const tier = subTiers[key];
              const isSelected = subPeriod === key;

              let displayPrice = tier.totalPrice;
              let displayPeriod = tier.periodLabel;

              if (subViewMode === 'monthly') {
                displayPrice = tier.perMonthPrice;
                displayPeriod = '/ Month';
              } else if (subViewMode === 'hourly') {
                displayPrice = tier.perHourPrice;
                displayPeriod = ' /hour*';
              }

              return (
                <div
                  key={key}
                  className={`pk-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSubPeriod(key)}
                >
                  <div className="pk-option-left">
                    <div className="pk-option-label-wrap">
                      <div className="pk-option-title-row">
                        <span className="pk-option-name">{tier.name}</span>
                        {tier.badge === 'Most popular' && (
                          <span className="pk-badge-yellow">{tier.badge}</span>
                        )}
                        {tier.badge === 'Best value' && (
                          <span className="pk-badge-amber">{tier.badge}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pk-option-price-wrap">
                    <div>
                      <span className="pk-option-price">{displayPrice}</span>
                      <span className="pk-option-period">{displayPeriod}</span>
                    </div>
                    {subViewMode === 'hourly' && (
                      <div className="pk-option-note">
                        {tier.totalPrice} {tier.periodLabel}
                      </div>
                    )}
                    {subViewMode === 'monthly' && key !== 'monthly' && (
                      <div className="pk-option-note">
                        {tier.totalPrice} {tier.periodLabel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="pk-footnote-text">
            * Assumes 30 hours of calls a month or 1 call per day
          </p>

          {/* Subscription Feature Checklist */}
          <ul className="pk-features-list">
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>Unlimited call sessions (& mock)</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>Full privacy mode</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>20 resume PDF downloads a day</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>30 headshots a day</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>Full Question Bank access</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            type="button"
            className={`pk-action-btn-main pk-btn-unlimited ${loadingPlan === activeSub.id ? 'pk-btn-loading-state' : ''}`}
            onClick={handleSubClick}
            disabled={loadingPlan === activeSub.id}
          >
            {loadingPlan === activeSub.id ? 'Opening Checkout…' : activeSub.btnText}
          </button>
          <p className="pk-action-subnote">No lock-in. Cancel anytime.</p>
        </div>

        {/* ================= RIGHT: CREDITS CARD ================= */}
        <div className="pk-card pk-card-credits">
          <div className="pk-card-head">
            <div>
              <div className="pk-card-title-wrap">
                <h3 className="pk-card-title">Credits</h3>
              </div>
              <p className="pk-card-desc">Buy a pack of credits and use them whenever.</p>
            </div>

            {/* Switcher: Total / Per hour */}
            <div className="pk-segmented-pills">
              <button
                type="button"
                className={`pk-pill-btn ${creditViewMode === 'total' ? 'is-active' : ''}`}
                onClick={() => setCreditViewMode('total')}
              >
                Total
              </button>
              <button
                type="button"
                className={`pk-pill-btn ${creditViewMode === 'hourly' ? 'is-active' : ''}`}
                onClick={() => setCreditViewMode('hourly')}
              >
                Per hour
              </button>
            </div>
          </div>

          {/* Radio Options: 3 Credits / 6 Credits / 9 Credits */}
          <div className="pk-options-list">
            {['pack_3', 'pack_6', 'pack_9'].map((key) => {
              const pack = creditPacks[key];
              const isSelected = creditPack === key;

              let displayPrice = pack.totalPrice;
              let displayPeriod = '';

              if (creditViewMode === 'hourly') {
                displayPrice = pack.perHourPrice;
              }

              return (
                <div
                  key={key}
                  className={`pk-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setCreditPack(key)}
                >
                  <div className="pk-option-left">
                    <div className="pk-option-label-wrap">
                      <div className="pk-option-title-row">
                        <span className="pk-option-name">{pack.name}</span>
                        {pack.badge && <span className="pk-badge-yellow">{pack.badge}</span>}
                      </div>
                      {pack.sub && <span className="pk-option-sub">{pack.sub}</span>}
                    </div>
                  </div>
                  <div className="pk-option-price-wrap">
                    <span className="pk-option-price">{displayPrice}</span>
                    {displayPeriod && <span className="pk-option-period">{displayPeriod}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Credits Feature Checklist */}
          <ul className="pk-features-list">
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>0.5 Credit = 30 min call session (& mock)</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>Full privacy mode</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>1 Credit = 1 resume PDF download</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>1 Credit = 1 headshot</span>
            </li>
            <li className="pk-feature-item">
              <span className="pk-check-icon">✓</span>
              <span>1 Credit = 1 Question Bank position</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            type="button"
            className={`pk-action-btn-main pk-btn-credits ${loadingPlan === activePack.id ? 'pk-btn-loading-state' : ''}`}
            onClick={() => handleCreditClick()}
            disabled={loadingPlan === activePack.id}
          >
            {loadingPlan === activePack.id ? 'Opening Checkout…' : activePack.btnText}
          </button>
          <div className="pk-action-single-credit">
            or, just need 1 credit?{' '}
            <button
              type="button"
              className="pk-single-link"
              onClick={() => {
                setCreditPack('pack_1');
                handleCreditClick('pack_1');
              }}
            >
              1 credit for $19.00
            </button>
          </div>
        </div>
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



    </section>
  );
}
