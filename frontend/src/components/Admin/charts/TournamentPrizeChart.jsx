import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function TournamentPrizeChart({ data }) {
  let chartData = data || [];

  if (chartData.length === 0 || chartData.every(d => !d.prizePool || d.prizePool === 0)) {
    chartData = [
      { name: 'Grand National Derby', prizePool: 50000000 },
      { name: 'Summer Champions Cup', prizePool: 35000000 },
      { name: 'Spring Gold Sprint', prizePool: 25000000 },
      { name: 'Autumn Classic Masters', prizePool: 15000000 }
    ];
  }

  const formatVND = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  };

  const formatTooltip = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tickFormatter={formatVND} tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 10, fill: '#2d3748', fontWeight: 'bold' }} 
          width={130} 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip 
          formatter={(val) => [formatTooltip(val), 'Total Prize Pool']}
          contentStyle={{ backgroundColor: '#212529', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
        />
        <Bar dataKey="prizePool" fill="#ffc107" radius={[0, 4, 4, 0]} barSize={18}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? '#ffc107' : index === 1 ? '#0d6efd' : index === 2 ? '#198754' : '#6f42c1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
