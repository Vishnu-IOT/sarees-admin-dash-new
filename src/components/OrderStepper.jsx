import React from 'react';
import { IconCheck } from './icons.jsx';

// Order.status enum, in the sequence the backend models it (pending ->
// ... -> delivered). cancelled/returned are terminal exceptions shown
// separately rather than bent into this line.
const SEQUENCE = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderStepper({ status }) {
  if (status === 'Cancelled' || status === 'returned') {
    return <span className="badge badge-danger" style={{ fontSize: 12.5 }}>{status}</span>;
  }

  const currentIndex = SEQUENCE.indexOf(status);

  return (
    <div className="stepper">
      {SEQUENCE.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={step} className={`stepper-step${done ? ' done' : ''}${current ? ' current' : ''}`}>
            <span className="stepper-line" />
            <span className="stepper-dot">{done && <IconCheck />}</span>
            <span className="stepper-label">{step}</span>
          </div>
        );
      })}
    </div>
  );
}
