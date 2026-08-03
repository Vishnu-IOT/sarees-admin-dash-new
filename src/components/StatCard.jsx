import React from 'react';

export default function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon"><Icon /></span>
      </div>
      <div className="stat-card-value">{value}</div>
      {note && <div className="stat-card-delta flat">{note}</div>}
    </div>
  );
}
