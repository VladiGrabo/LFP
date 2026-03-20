import React, { useEffect, useRef } from 'react';

interface WorkingChartProps {
  symbol: string;
  height?: number;
}

const WorkingChart: React.FC<WorkingChartProps> = ({ symbol, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const chartHeight = canvas.height;

    // Очистка
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, chartHeight);

    // Генерация данных
    const basePrice = getBasePrice(symbol);
    const numCandles = 100;
    const candleWidth = (width - 100) / numCandles;
    const data = generateCandleData(basePrice, numCandles);

    // Находим min/max для масштабирования
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    data.forEach(candle => {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    });

    const priceRange = maxPrice - minPrice;
    const padding = 40;

    // Функция для преобразования цены в координату Y
    const priceToY = (price: number) => {
      return padding + ((maxPrice - price) / priceRange) * (chartHeight - padding * 2);
    };

    // Рисуем сетку
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = padding + (i * (chartHeight - padding * 2)) / 4;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();

      // Подписи цен
      const price = maxPrice - (i * priceRange) / 4;
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), 45, y + 4);
    }

    // Рисуем свечи
    data.forEach((candle, i) => {
      const x = 50 + i * candleWidth + candleWidth / 2;
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);

      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10b981' : '#ef4444';

      // Тень (фитиль)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Тело свечи
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillStyle = color;
      ctx.fillRect(
        x - candleWidth * 0.4,
        bodyTop,
        candleWidth * 0.8,
        bodyHeight
      );
    });

    // Заголовок
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${symbol} Chart`, 50, 25);

    // Текущая цена
    const currentPrice = data[data.length - 1].close;
    const change = ((currentPrice - data[0].open) / data[0].open) * 100;
    const changeColor = change >= 0 ? '#10b981' : '#ef4444';
    ctx.fillStyle = changeColor;
    ctx.font = '14px sans-serif';
    ctx.fillText(
      `${currentPrice.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`,
      200,
      25
    );

  }, [symbol, height]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1000}
        height={height}
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
};

function getBasePrice(symbol: string): number {
  const prices: { [key: string]: number } = {
    'BTCUSDT': 43250,
    'ETHUSDT': 2650,
    'BNBUSDT': 315,
    'ADAUSDT': 0.485,
    'SOLUSDT': 98,
    'XRPUSDT': 0.52,
    'DOTUSDT': 6.5,
    'LINKUSDT': 15.5
  };
  return prices[symbol] || 100;
}

function generateCandleData(basePrice: number, count: number) {
  const data = [];
  let currentPrice = basePrice;

  for (let i = 0; i < count; i++) {
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility;

    const open = currentPrice;
    const close = currentPrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

    data.push({ open, high, low, close });
    currentPrice = close;
  }

  return data;
}

export default WorkingChart;
