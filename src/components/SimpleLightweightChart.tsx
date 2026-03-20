import React from 'react';

interface SimpleLightweightChartProps {
  symbol: string;
  height?: number;
}

const SimpleLightweightChart: React.FC<SimpleLightweightChartProps> = ({
  symbol,
  height = 600
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>
        График {symbol}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>
        Загрузка графика...
      </div>
    </div>
  );
};

export default SimpleLightweightChart;
