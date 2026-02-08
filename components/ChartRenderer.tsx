import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { ChartConfig } from '../types';

interface ChartRendererProps {
  config: ChartConfig;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  const { type, data, title, xAxisKey } = config;

  // Determine which data keys to plot (excluding the axis key)
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== xAxisKey) : [];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#059669', color: '#fff' }} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={index === 0 ? "#10b981" : "#3b82f6"} />
            ))}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#059669', color: '#fff' }} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Area key={key} type="monotone" dataKey={key} stroke={index === 0 ? "#10b981" : "#3b82f6"} fill={index === 0 ? "#10b981" : "#3b82f6"} fillOpacity={0.3} />
            ))}
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#059669', color: '#fff' }} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={index === 0 ? "#10b981" : "#3b82f6"} strokeWidth={2} dot={{ r: 4 }} />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full bg-neutral-900 border border-eco-800 rounded-lg p-4 mt-4 mb-4">
      <h3 className="text-eco-400 font-mono text-sm mb-4 text-center border-b border-eco-900 pb-2">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartRenderer;