import React from 'react';

// Line/Area Chart Component
export const LineChart = ({ data = [], labels = [], title = "Revenue Trend ($)" }) => {
  const width = 500;
  const height = 180;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data, 100) * 1.15;
  const minVal = 0;

  const points = data.map((val, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val, label: labels[idx] };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0]?.x || paddingLeft},${paddingTop + chartHeight} ` + 
                     polylinePoints + 
                     ` ${points[points.length - 1]?.x || width - paddingRight},${paddingTop + chartHeight}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{title}</div>
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--sky)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            const val = Math.round(maxVal - ratio * (maxVal - minVal));
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="var(--ink-muted)" fontSize="9" fontWeight="600">{val}</text>
              </g>
            );
          })}

          {/* Area under line */}
          <polygon points={areaPoints} fill="url(#chart-area-grad)" />

          {/* Connection line */}
          <polyline points={polylinePoints} fill="none" stroke="var(--sky)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots on line */}
          {points.map((p, idx) => (
            <g key={idx} className="chart-dot-group" style={{ cursor: 'pointer' }}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--white)" stroke="var(--sky)" strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              <title>{`${p.label}: ${p.val}`}</title>
            </g>
          ))}

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text key={idx} x={p.x} y={height - 8} textAnchor="middle" fill="var(--ink-muted)" fontSize="9" fontWeight="600">{p.label}</text>
          ))}
        </svg>
      </div>
    </div>
  );
};

// Bar Chart Component
export const BarChart = ({ data = [], labels = [], title = "Daily Appointments" }) => {
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data, 10) * 1.15;
  const barWidth = (chartWidth / data.length) * 0.6;
  const gap = (chartWidth / data.length) * 0.4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{title}</div>
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            const val = Math.round(maxVal - ratio * maxVal);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="var(--ink-muted)" fontSize="9" fontWeight="600">{val}</text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((val, idx) => {
            const x = paddingLeft + idx * (barWidth + gap) + gap / 2;
            const h = (val / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - h;
            return (
              <g key={idx} style={{ cursor: 'pointer' }}>
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={h} 
                  rx="3" 
                  ry="3" 
                  fill="var(--mint)" 
                  style={{ transition: 'all 0.3s' }} 
                />
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill="var(--ink)" fontSize="9" fontWeight="bold">{val}</text>
                <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fill="var(--ink-muted)" fontSize="9" fontWeight="600">{labels[idx]}</text>
                <title>{`${labels[idx]}: ${val}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data = [], labels = [], title = "Top Specialties" }) => {
  const total = data.reduce((a, b) => a + b, 0);
  const colors = ['#863bff', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  let accumulatedPercent = 0;

  const segments = data.map((val, idx) => {
    const percent = total > 0 ? val / total : 0;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;
    return {
      val,
      label: labels[idx],
      percent,
      color: colors[idx % colors.length],
      strokeDasharray: `${percent * 100} ${100 - percent * 100}`,
      strokeDashoffset: `${100 - startPercent * 100 + 25}` // offset by 25 to start at top
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ width: '120px', height: '120px', position: 'relative' }}>
          <svg viewBox="0 0 42 42" width="100%" height="100%">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border)" strokeWidth="4" />
            {segments.map((seg, idx) => (
              <circle 
                key={idx}
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke={seg.color} 
                strokeWidth="5" 
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                style={{ transformOrigin: 'center', transition: 'stroke-dasharray 0.3s ease' }}
              />
            ))}
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--ink)' }}>{total}</span>
            <span style={{ fontSize: '9px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
          {segments.map((seg, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color }}></div>
                <span style={{ color: 'var(--ink)' }}>{seg.label}</span>
              </div>
              <span style={{ fontWeight: 'bold', color: 'var(--ink-soft)' }}>
                {seg.val} ({Math.round(seg.percent * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
