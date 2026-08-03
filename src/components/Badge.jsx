import React from 'react';

// Maps the backend's exact enum values (Order.status, Order.paymentStatus,
// Product.status) to a visual tone. Falls back to neutral for anything else.
const TONE_MAP = {
  // Product.status
  active: 'success',
  inactive: 'neutral',
  discontinued: 'danger',
  // Order.status
  Pending: 'warning',
  Confirmed: 'info',
  Packed: 'info',
  Shipped: 'gold',
  Delivered: 'success',
  Cancelled: 'danger',
  Returned: 'danger',
  // Order.paymentStatus
  Paid: 'success',
  Failed: 'danger',
  Refunded: 'neutral'
};

export default function Badge({ value, label }) {
  const tone = TONE_MAP[value] || 'neutral';
  return <span className={`badge badge-${tone}`}>{label || value}</span>;
}
