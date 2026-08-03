import React from 'react';
import { IconBox } from './icons.jsx';

export function Loader() {
  return (
    <div className="loader-wrap">
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}

export function EmptyState({ icon: Icon = IconBox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <Icon />
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
