"use client";

import React from 'react';
import ParakeetPricingView from '../pricing/ParakeetPricingView';

export default function Pricing3DSection({ onSelectPlan }) {
  return (
    <div className="pricing-3d-section-wrapper" style={{ position: 'relative', zIndex: 5 }}>
      <ParakeetPricingView onSelectPlan={onSelectPlan} />
    </div>
  );
}
