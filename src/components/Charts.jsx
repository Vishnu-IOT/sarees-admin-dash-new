import React from 'react';

// Simple horizontal-scaled bar chart, built with plain divs so it needs no
// charting library. `data` = [{ label, value }]
export function MiniBarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <span className="bar-label">{d.label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

const DONUT_COLORS = ['#c79a4b', '#8c2a3b', '#4c6e8c', '#3f7a55', '#b9862f', '#392640'];

// data = [{ label, value }]
export function DonutChart({ data, size = 132, thickness = 20 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-sunk)"
            strokeWidth={thickness}
          />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * circumference;
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
        </g>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-display)"
          fontSize="22"
          fontWeight="600"
          fill="var(--text)"
        >
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div className="donut-legend-item" key={d.label}>
            <span className="donut-legend-swatch" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="lbl">{d.label}</span>
            <span className="val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
