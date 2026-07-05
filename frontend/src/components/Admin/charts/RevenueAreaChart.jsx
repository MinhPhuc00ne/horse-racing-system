import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueAreaChart({ data }) {
  const formatVND = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  };

  const formatTooltip = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!data || data.length === 0) {
    return <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f5132" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#0f5132" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#4a5568', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatVND} tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
        <Tooltip 
          formatter={(value) => [formatTooltip(value), "Revenue"]}
          contentStyle={{ backgroundColor: '#212529', color: '#fff', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11px' }}
          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
          labelStyle={{ color: '#ffc107', fontWeight: 'bold' }}
        />
        <Area type="monotone" dataKey="val" stroke="#0f5132" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" activeDot={{ r: 6, fill: '#D4AF37', stroke: '#0f5132', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
