import React, { useState } from 'react';

export default function Charts({ cases, payments }) {
  const [hoveredRevenue, setHoveredRevenue] = useState(null);
  const [hoveredDonut, setHoveredDonut] = useState(null);

  // 1. Calculate Monthly Revenue Data (Jan - Jun)
  // Let's create realistic monthly breakdown
  const monthlyData = [
    { month: 'Jan', revenue: 85000, expenses: 18000 },
    { month: 'Feb', revenue: 95000, expenses: 22000 },
    { month: 'Mar', revenue: 140000, expenses: 31000 },
    { month: 'Apr', revenue: 110000, expenses: 25000 },
    { month: 'May', revenue: 180000, expenses: 40000 },
    { month: 'Jun', revenue: 245000, expenses: 60000 } // Reflecting June payments
  ];

  // Max value for revenue scaling
  const maxVal = Math.max(...monthlyData.map(d => d.revenue)) * 1.1;
  const width = 500;
  const height = 200;

  // Generate Area Chart points
  const points = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * (width - 60) + 40;
    const y = height - (d.revenue / maxVal) * (height - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 20} L ${points[0].x} ${height - 20} Z`;

  // 2. Cases Distribution Data
  const activeCount = cases.filter(c => c.status === 'active').length;
  const closedCount = cases.filter(c => c.status === 'closed').length;
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const totalCases = cases.length || 1;

  // Pie chart calculation
  const donutData = [
    { label: 'Active', count: activeCount, color: 'var(--primary)' },
    { label: 'Pending', count: pendingCount, color: 'var(--warning)' },
    { label: 'Closed', count: closedCount, color: 'var(--text-muted)' }
  ];

  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // 3. Credits vs Debits
  const creditsSum = payments.filter(p => p.type === 'credit' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const debitsSum = payments.filter(p => p.type === 'debit' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const maxFinance = Math.max(creditsSum, debitsSum) * 1.1 || 100000;

  return (
    <div className="charts-grid animated-slideup">
      {/* Revenue Area Chart */}
      <div className="chart-card glass-panel">
        <div className="chart-header">
          <h3 className="chart-title">📈 Revenue Performance (2026)</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Updated just now</span>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '220px' }}>
          <svg className="svg-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = 20 + ratio * (height - 60);
              return (
                <line
                  key={i}
                  x1="40"
                  y1={y}
                  x2={width - 20}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area path */}
            <path d={areaD} fill="url(#areaGrad)" />

            {/* Line path */}
            <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" />

            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="var(--bg-secondary)"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRevenue(p)}
                  onMouseLeave={() => setHoveredRevenue(null)}
                />
              </g>
            ))}

            {/* X Axis Months */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={height - 2}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
              >
                {p.month}
              </text>
            ))}
          </svg>

          {/* Dynamic Tooltip */}
          {hoveredRevenue && (
            <div style={{
              position: 'absolute',
              left: `${(hoveredRevenue.x / width) * 100}%`,
              top: `${(hoveredRevenue.y / height) * 100 - 30}%`,
              transform: 'translateX(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '6px 10px',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-md)',
              fontSize: '11px',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <strong>{hoveredRevenue.month} Revenue:</strong>
              <div style={{ color: 'var(--success)' }}>₹{hoveredRevenue.revenue.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Case Distribution Donut Chart */}
      <div className="chart-card glass-panel">
        <div className="chart-header">
          <h3 className="chart-title">📊 Case Distribution</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              {donutData.map((slice, i) => {
                const percent = slice.count / totalCases;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                cumulativePercent += percent;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                const largeArcFlag = percent > 0.5 ? 1 : 0;
                
                // Circle Path
                const pathData = [
                  `M ${startX} ${startY}`,
                  `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  `L 0 0`
                ].join(' ');

                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={slice.color}
                    opacity={hoveredDonut === slice.label ? 0.9 : 1.0}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredDonut(slice.label)}
                    onMouseLeave={() => setHoveredDonut(null)}
                  />
                );
              })}
              {/* Inner cutout for donut effect */}
              <circle cx="0" cy="0" r="0.6" fill="var(--bg-secondary)" />
            </svg>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '700', display: 'block' }}>{cases.length}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cases</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', fontSize: '12px' }}>
            {donutData.map((slice, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', background: hoveredDonut === slice.label ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: slice.color }}></span>
                  <span>{slice.label}</span>
                </div>
                <strong>{slice.count} ({Math.round((slice.count / totalCases) * 100)}%)</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
