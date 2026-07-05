import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BetVolumeBarChart({ data }) {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const formatShortName = (name) => {
    return name.length > 5 ? name.substring(0, 4) + '..' : name;
  };

  if (!data || data.length === 0) {
    return <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="tournament" 
          tickFormatter={formatShortName} 
          tick={{ fontSize: 10, fill: '#4a5568', fontWeight: 'bold' }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [value + " bets", "Volume"]}
          labelFormatter={(label) => <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{label}</span>}
          contentStyle={{ backgroundColor: '#212529', color: '#fff', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11px' }}
          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
        />
        <Bar 
          dataKey="bets" 
          radius={[3, 3, 3, 3]}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={activeIndex === index ? '#fed65b' : '#003820'} 
              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
