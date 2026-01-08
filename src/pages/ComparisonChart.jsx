import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
];

export default function ComparisonChart({ comparisonData, fullscreen = false }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!comparisonData || comparisonData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p className="text-sm sm:text-base">No comparison data available</p>
      </div>
    );
  }

  // Get file names (keys excluding 'name')
  const fileNames = Object.keys(comparisonData[0]).filter(key => key !== 'name');

  // Custom label to show percentage on top of bars
  const renderCustomLabel = (props) => {
    const { x, y, width, value } = props;
    
    // Don't show labels on very small screens or if bar is too small
    if (isMobile && !fullscreen && width < 30) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#475569"
        textAnchor="middle"
        fontSize={fullscreen ? (isMobile ? 11 : 14) : (isMobile ? 9 : 12)}
        fontWeight="600"
      >
        {value}%
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-slate-200 max-w-[200px] sm:max-w-none">
          <p className="font-bold text-slate-800 mb-2 text-xs sm:text-sm truncate">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs sm:text-sm text-slate-600 truncate">
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.name}:
              </span>{' '}
              {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tick for X-axis to handle long topic names
  const CustomXAxisTick = ({ x, y, payload }) => {
    let maxLength;
    
    if (fullscreen) {
      maxLength = isMobile ? 12 : 20;
    } else {
      maxLength = isMobile ? 8 : 15;
    }
    
    let text = payload.value;
    
    // Truncate if too long
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    const fontSize = fullscreen ? (isMobile ? 10 : 13) : (isMobile ? 9 : 11);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#475569"
          fontSize={fontSize}
          fontWeight="500"
        >
          {text}
        </text>
      </g>
    );
  };

  // Responsive margins
  const getMargins = () => {
    if (fullscreen) {
      return {
        top: isMobile ? 20 : 30,
        right: isMobile ? 10 : 30,
        left: isMobile ? 5 : 20,
        bottom: isMobile ? 70 : 80,
      };
    }
    return {
      top: isMobile ? 15 : 30,
      right: isMobile ? 5 : 30,
      left: isMobile ? 0 : 20,
      bottom: isMobile ? 60 : 60,
    };
  };

  // Responsive bar size
  const getBarSize = () => {
    if (fullscreen) {
      return isMobile ? 40 : 80;
    }
    return isMobile ? 30 : 60;
  };

  // Responsive angle
  const getAngle = () => {
    if (isMobile) return -60;
    return fullscreen ? -35 : -45;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={comparisonData}
        margin={getMargins()}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={<CustomXAxisTick />}
          interval={0}
          angle={getAngle()}
          textAnchor="end"
          height={fullscreen ? (isMobile ? 80 : 100) : (isMobile ? 70 : 80)}
          stroke="#94a3b8"
        />
        <YAxis
          label={{
            value: isMobile && !fullscreen ? '%' : 'Percentage (%)',
            angle: -90,
            position: 'insideLeft',
            style: {
              fill: '#475569',
              fontSize: fullscreen ? (isMobile ? 11 : 14) : (isMobile ? 10 : 12),
              fontWeight: 600,
            },
          }}
          stroke="#94a3b8"
          tick={{ 
            fill: '#475569', 
            fontSize: fullscreen ? (isMobile ? 10 : 13) : (isMobile ? 9 : 11) 
          }}
          width={isMobile ? 30 : 60}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          wrapperStyle={{ zIndex: 1000 }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: isMobile ? '10px' : '20px',
            fontSize: fullscreen ? (isMobile ? 11 : 14) : (isMobile ? 10 : 12),
          }}
          iconType="circle"
          iconSize={isMobile ? 8 : 10}
          formatter={(value) => {
            // Truncate legend text on mobile
            if (isMobile && value.length > 15) {
              return value.substring(0, 15) + '...';
            }
            return value;
          }}
        />
        {fileNames.map((fileName, index) => (
          <Bar
            key={fileName}
            dataKey={fileName}
            fill={COLORS[index % COLORS.length]}
            radius={[8, 8, 0, 0]}
            maxBarSize={getBarSize()}
          >
            <LabelList
              dataKey={fileName}
              content={renderCustomLabel}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}