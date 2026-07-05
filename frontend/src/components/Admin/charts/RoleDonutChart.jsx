import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ROLE_COLORS = {
  Spectators: '#95d4ac',
  Owners: '#D4AF37',
  Jockeys: '#0f5132',
  Referees: '#745c00',
  Admins: '#ef4444'
};

export default function RoleDonutChart({ roleDistribution }) {
  const data = Object.entries(roleDistribution || {}).map(([role, count]) => ({
    name: role,
    value: count
  }));

  const totalUsers = data.reduce((sum, item) => sum + item.value, 0) || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = ((data.value / totalUsers) * 100).toFixed(0);
      return (
        <div style={{ backgroundColor: '#212529', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '11px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ fontWeight: 'bold' }}>{data.name}</div>
          <div style={{ color: '#ffc107', fontWeight: 'bold' }}>{data.value} ({pct}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '130px', height: '130px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={40}
              outerRadius={55}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name] || '#718096'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
           <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--ho-primary-dark)' }}>{totalUsers}</div>
           <div style={{ fontSize: '8px', color: '#718096', letterSpacing: '0.05em' }}>TOTAL USERS</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '10px', fontSize: '9.5px' }}>
        {data.map((entry) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS[entry.name] || '#718096' }} />
            <span style={{ color: '#718096' }}>{entry.name.substring(0, 4)}: <strong>{entry.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}
