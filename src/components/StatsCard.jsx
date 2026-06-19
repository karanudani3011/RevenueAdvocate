import React from 'react';

export default function StatsCard({ title, value, icon, trend, accentColor, bgGlow, onClick }) {
  return (
    <div 
      className="metric-card glass-panel animated-slideup"
      style={{
        '--card-accent': accentColor,
        '--card-accent-glow': bgGlow,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div className="metric-icon-container">
          <span style={{ fontSize: '18px' }}>{icon}</span>
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {trend && (
        <div className="metric-trend">
          {trend.type === 'up' && <span className="trend-up">▲ {trend.value}</span>}
          {trend.type === 'down' && <span className="trend-down">▼ {trend.value}</span>}
          {trend.type === 'neutral' && <span style={{ color: 'var(--text-muted)' }}>● {trend.value}</span>}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
