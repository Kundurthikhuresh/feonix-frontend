/* Plan prices per currency, in the smallest unit (paise, cents, pence).
 * Razorpay charges the matching numbers from feonix-backend/src/pricing.js —
 * change both together. India sees INR, the UK GBP, everyone else USD. */

export const PLAN_PRICES = {
  sub_weekly:  { INR: 498000,  USD: 3900,  GBP: 3200 },
  sub_monthly: { INR: 947000,  USD: 7495,  GBP: 5995 },
  sub_yearly:  { INR: 3790000, USD: 29995, GBP: 23995 },
  pack_1:      { INR: 237000,  USD: 1900,  GBP: 1500 },
  pack_3:      { INR: 369000,  USD: 2950,  GBP: 2350 },
  pack_6:      { INR: 738000,  USD: 5900,  GBP: 4700 },
  pack_9:      { INR: 1107000, USD: 8850,  GBP: 7050 },
};

const LOCALES = { INR: 'en-IN', USD: 'en-US', GBP: 'en-GB' };

/* Guesses the visitor's country from the browser's time zone, then its
 * language. The backend overrides this with the real country when the app
 * runs behind a CDN that reports one. */
export function detectCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
    if (tz === 'Europe/London' || tz === 'Europe/Belfast') return 'GBP';
    if (tz.startsWith('America/') || tz.startsWith('US/')) return 'USD';
    const lang = (typeof navigator !== 'undefined' && navigator.language) || '';
    if (/-IN$/i.test(lang)) return 'INR';
    if (/-GB$/i.test(lang)) return 'GBP';
  } catch {}
  return 'USD';
}

export function planAmount(plan, currency) {
  const row = PLAN_PRICES[plan];
  return row ? (row[currency] ?? row.USD) / 100 : 0;
}

/* ₹9,470 · $74.95 · £59.95 — whole amounts drop the decimals unless
 * `decimals` forces two (used for per-call and per-credit prices). */
export function formatMoney(amount, currency, { decimals = false } = {}) {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(LOCALES[currency] || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals || !whole ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
