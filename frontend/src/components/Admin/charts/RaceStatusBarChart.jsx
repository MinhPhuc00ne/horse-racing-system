import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const STATUS_COLORS = {
  'SCHEDULED': '#0d6efd',
  'REGISTRATION_OPEN': '#198754',
  'ONGOING': '#ffc107',
  'FINISHED': '#6c757d',
  'CANCELLED': '#dc3545'
};

export default function RaceStatusBarChart({ raceStatusDistribution }) {
  let chartData = [];
  if (raceStatusDistribution && Object.keys(raceStatusDistribution).length > 0) {
    chartData = Object.entries(raceStatusDistribution).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
      rawStatus: status
    }));
  }

  // Fallback demo data if DB empty
  if (chartData.length === 0 || chartData.every(d => d.count === 0)) {
    chartData = [
      { status: 'SCHEDULED', count: 6, rawStatus: 'SCHEDULED' },
      { status: 'REGISTRATION OPEN', count: 14, rawStatus: 'REGISTRATION_OPEN' },
      { status: 'ONGOING', count: 3, rawStatus: 'ONGOING' },
      { status: 'FINISHED', count: 28, rawStatus: 'FINISHED' }
    ];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="status" 
          tick={{ fontSize: 9, fill: '#4a5568', fontWeight: '600' }} 
          interval={0}
          angle={-15}
          textAnchor="end"
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
        <Tooltip 
          formatter={(val) => [`${val} races`, 'Count']}
          contentStyle={{ backgroundColor: '#212529', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.rawStatus] || '#0d6efd'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
