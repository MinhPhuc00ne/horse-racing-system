import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754'];

export default function BreedPieChart({ breedDistribution }) {
  let chartData = [];
  if (breedDistribution && Object.keys(breedDistribution).length > 0) {
    chartData = Object.entries(breedDistribution).map(([name, value]) => ({ name, value }));
  }

  // Fallback demo dataset if DB is empty
  if (chartData.length === 0 || chartData.every(d => d.value === 0)) {
    chartData = [
      { name: 'Thoroughbred', value: 12 },
      { name: 'Quarter Horse', value: 8 },
      { name: 'Arabian', value: 5 },
      { name: 'Appaloosa', value: 3 }
    ];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(val) => [`${val} con`, 'Số lượng']}
          contentStyle={{ backgroundColor: '#212529', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
        />
        <Legend 
          iconType="circle"
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
