import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TimelinePoint } from '@/types/project';

interface ProgressLineChartProps {
  timelineData: TimelinePoint[];
  height?: number;
  currentProgress?: number;
  plannedProgress?: number;
}

export default function ProgressLineChart({
  timelineData,
  height = 340,
  currentProgress,
  plannedProgress,
}: ProgressLineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800/40 rounded-xl animate-pulse"
        style={{ height }}
      >
        <div className="text-xs text-gray-500 font-mono">Loading Progress S-Curve...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const planned = payload.find((p: any) => p.dataKey === 'plannedProgress')?.value ?? 0;
      const actual = payload.find((p: any) => p.dataKey === 'actualProgress')?.value ?? 0;
      const milestone = payload[0]?.payload?.milestone;
      const variance = actual - planned;

      return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl min-w-[200px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {label}
            </span>
            <span
              className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                variance >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
              }`}
            >
              {variance >= 0 ? `+${variance}% Ahead` : `${variance}% Lag`}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Actual Progress
              </span>
              <span className="font-mono font-bold text-white">{actual}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Planned Target
              </span>
              <span className="font-mono font-bold text-white">{planned}%</span>
            </div>
          </div>

          {milestone && (
            <div className="mt-2.5 pt-2 border-t border-gray-800/80">
              <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
                Milestone Key
              </span>
              <p className="text-xs text-gray-300 italic mt-0.5">{milestone}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={timelineData}
          margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#4b5563' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px' }}
            formatter={(value) => (
              <span className="text-xs font-medium text-gray-300 mr-2">
                {value === 'actualProgress' ? 'Actual Progress (%)' : 'Planned Baseline (%)'}
              </span>
            )}
          />
          {/* Planned Baseline: Smooth Blue dashed curve */}
          <Line
            type="monotone"
            dataKey="plannedProgress"
            name="plannedProgress"
            stroke="#3b82f6"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ fill: '#1e40af', stroke: '#60a5fa', strokeWidth: 1.5, r: 4 }}
            activeDot={{ r: 6, fill: '#60a5fa' }}
          />
          {/* Actual Progress: Solid vibrant Emerald curve */}
          <Line
            type="monotone"
            dataKey="actualProgress"
            name="actualProgress"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#065f46', stroke: '#34d399', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 7, fill: '#34d399' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

