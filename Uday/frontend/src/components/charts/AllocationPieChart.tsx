import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PieProps {
  sectorAllocation: Record<string, number>;
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1E3A8A', '#0EA5E9'];

export const AllocationPieChart: React.FC<PieProps> = ({ sectorAllocation }) => {
  const data = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2))
  }));

  if (data.length === 0) {
    return <div className="text-center text-xs text-slate-500 py-8">No sector data available.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
            formatter={(val: any) => [`${val}%`, 'Allocation']}
          />
          <Legend formatter={(val: any) => <span className="text-xs text-slate-700 font-medium">{val}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
