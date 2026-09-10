import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CompletionPieChartProps {
  completedPercentage?: number;
  currentProgress?: number;
  plannedProgress?: number;
  height?: number;
}

export default function CompletionPieChart({
  completedPercentage,
  currentProgress,
  plannedProgress,
  height = 240,
}: CompletionPieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const progressVal = completedPercentage ?? currentProgress ?? 0;
  const safeCompleted = Math.min(100, Math.max(0, progressVal));
  const remaining = Math.max(0, 100 - safeCompleted);

  const data = [
    { name: 'Completed Work', value: safeCompleted, color: '#10b981' },
    { name: 'Remaining Scope', value: remaining, color: '#475569' },
  ];

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center bg-slate-100 dark:bg-gray-800/40 rounded-xl animate-pulse"
        style={{ height }}
      >
        <div className="text-xs text-slate-400 dark:text-gray-500 font-mono">Loading Chart Visualization...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-2 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload.color }}
            />
            {item.name}
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-mono text-sm mt-0.5">{item.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 dark:text-gray-300 font-medium">Completed ({safeCompleted}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-gray-600 inline-block" />
          <span className="text-slate-500 dark:text-gray-400">Remaining ({remaining}%)</span>
        </div>
      </div>
    </div>
  );
}
