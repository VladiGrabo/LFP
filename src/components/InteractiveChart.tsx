import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Move, TrendingUp, Activity } from 'lucide-react';

interface InteractiveChartProps {
  symbol: string;
  height?: number;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ symbol, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<Candle[]>([]);
  const [offset, setOffset] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const basePrice = getBasePrice(symbol);
    const numCandles = 200;
    const generatedData = generateCandleData(basePrice, numCandles);
    setData(generatedData);
    setOffset(Math.max(0, numCandles - 100));
  }, [symbol]);

  useEffect(() => {
    if (!data.length) return;
    drawChart();
  }, [data, offset, scale, hoverIndex, isMobile]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const chartHeight = canvas.height;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, chartHeight);

    const visibleCandles = Math.floor(100 / scale);
    const startIdx = Math.max(0, Math.min(offset, data.length - visibleCandles));
    const endIdx = Math.min(data.length, startIdx + visibleCandles);
    const visibleData = data.slice(startIdx, endIdx);

    if (visibleData.length === 0) return;

    // Адаптивные отступы
    const leftPadding = isMobile ? 85 : 60;
    const rightPadding = isMobile ? 20 : 20;
    const topPadding = isMobile ? 60 : 45;
    const bottomPadding = isMobile ? 50 : 35;

    const candleWidth = (width - leftPadding - rightPadding) / visibleData.length;
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleData.forEach(candle => {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    });

    const priceRange = maxPrice - minPrice || 1;

    const priceToY = (price: number) => {
      return topPadding + ((maxPrice - price) / priceRange) * (chartHeight - topPadding - bottomPadding);
    };

    // Адаптивные размеры шрифтов
    const priceFontSize = isMobile ? 20 : 14;
    const timeFontSize = isMobile ? 16 : 13;
    const titleFontSize = isMobile ? 20 : 18;

    // Сетка
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    const gridLines = isMobile ? 3 : 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = topPadding + (i * (chartHeight - topPadding - bottomPadding)) / gridLines;
      ctx.beginPath();
      ctx.moveTo(leftPadding, y);
      ctx.lineTo(width - rightPadding, y);
      ctx.stroke();

      const price = maxPrice - (i * priceRange) / gridLines;
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${priceFontSize}px Arial, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(isMobile ? 0 : 2), leftPadding - (isMobile ? 10 : 5), y + (isMobile ? 7 : 4));
    }

    // Временная ось
    const timeLabels = isMobile ? 2 : 5;
    const timeStep = Math.max(1, Math.floor(visibleData.length / timeLabels));
    for (let i = 0; i < visibleData.length; i += timeStep) {
      const x = leftPadding + i * candleWidth + candleWidth / 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${timeFontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      const date = new Date(visibleData[i].time);
      const timeText = isMobile
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      ctx.fillText(timeText, x, chartHeight - bottomPadding + (isMobile ? 30 : 18));
    }

    // Свечи
    visibleData.forEach((candle, i) => {
      const x = leftPadding + i * candleWidth + candleWidth / 2;
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);

      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10b981' : '#ef4444';
      const isHovered = hoverIndex === i;

      // Подсветка при наведении
      if (isHovered && !isMobile) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(x - candleWidth / 2, topPadding, candleWidth, chartHeight - topPadding - bottomPadding);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillStyle = color;
      ctx.fillRect(
        x - candleWidth * 0.4,
        bodyTop,
        candleWidth * 0.8,
        bodyHeight
      );

      if (isHovered && !isMobile) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          x - candleWidth * 0.4,
          bodyTop,
          candleWidth * 0.8,
          bodyHeight
        );
      }
    });

    // Заголовок
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleFontSize}px sans-serif`;
    ctx.textAlign = 'left';

    const currentPrice = visibleData[visibleData.length - 1].close;
    const firstPrice = visibleData[0].open;
    const change = ((currentPrice - firstPrice) / firstPrice) * 100;
    const changeColor = change >= 0 ? '#10b981' : '#ef4444';

    if (isMobile) {
      // Компактная версия для мобильных
      const headerY = 32;
      const symbolText = symbol.replace('USDT', '');
      ctx.font = `900 ${titleFontSize}px Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(symbolText, leftPadding, headerY);

      const priceText = `$${currentPrice.toFixed(currentPrice >= 1000 ? 0 : 1)}`;
      const priceX = leftPadding + ctx.measureText(symbolText).width + 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(priceText, priceX, headerY);

      const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      const changeX = priceX + ctx.measureText(priceText).width + 8;
      ctx.fillStyle = changeColor;
      ctx.fillText(changeText, changeX, headerY);
    } else {
      // Полная версия для десктопа
      ctx.fillText(`${symbol}`, leftPadding, 28);
      ctx.fillText(`${currentPrice.toFixed(2)}`, leftPadding + 100, 28);
      ctx.fillStyle = changeColor;
      ctx.fillText(`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`, leftPadding + 230, 28);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const actualX = x * scaleX;

    const leftPadding = isMobile ? 85 : 60;
    const rightPadding = isMobile ? 20 : 20;
    const visibleCandles = Math.floor(100 / scale);
    const candleWidth = (canvas.width - leftPadding - rightPadding) / visibleCandles;
    const candleIndex = Math.floor((actualX - leftPadding) / candleWidth);

    if (candleIndex >= 0 && candleIndex < visibleCandles && !isMobile) {
      setHoverIndex(candleIndex);
      setHoverPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoverIndex(null);
    }

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const candleDelta = Math.floor(deltaX / (candleWidth / scaleX));

      if (Math.abs(candleDelta) > 0) {
        setOffset(prev => {
          const newOffset = prev - candleDelta;
          return Math.max(0, Math.min(data.length - visibleCandles, newOffset));
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverIndex(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(4, prev * delta)));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const leftPadding = isMobile ? 85 : 60;
    const rightPadding = isMobile ? 20 : 20;
    const visibleCandles = Math.floor(100 / scale);
    const candleWidth = (canvas.width - leftPadding - rightPadding) / visibleCandles;

    const deltaX = e.touches[0].clientX - dragStart.x;
    const candleDelta = Math.floor(deltaX / (candleWidth / scaleX));

    if (Math.abs(candleDelta) > 0) {
      setOffset(prev => {
        const newOffset = prev - candleDelta;
        return Math.max(0, Math.min(data.length - visibleCandles, newOffset));
      });
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(4, prev * 1.2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev / 1.2));
  };

  const handleReset = () => {
    setScale(1);
    setOffset(Math.max(0, data.length - 100));
  };

  const getHoverData = () => {
    if (hoverIndex === null) return null;
    const visibleCandles = Math.floor(100 / scale);
    const startIdx = Math.max(0, Math.min(offset, data.length - visibleCandles));
    const candle = data[startIdx + hoverIndex];
    if (!candle) return null;
    return candle;
  };

  const hoverData = getHoverData();
  const chartHeight = isMobile ? 550 : height;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
      <div className="p-2 md:p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
          <span className="text-white font-medium text-sm md:text-base">График</span>
        </div>
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={handleZoomIn}
            className="p-1.5 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Увеличить"
          >
            <ZoomIn className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Уменьшить"
          >
            <ZoomOut className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Сбросить"
          >
            <Move className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={chartHeight}
          style={{
            width: '100%',
            height: `${chartHeight}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {hoverData && (
          <div
            className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 pointer-events-none z-10 shadow-xl"
            style={{
              left: hoverPos.x + 10,
              top: hoverPos.y - 80,
            }}
          >
            <div className="text-xs space-y-1">
              <div className="text-gray-400">
                {new Date(hoverData.time).toLocaleString('ru-RU')}
              </div>
              <div className="flex gap-3 text-white font-mono">
                <span className="text-gray-400">O:</span>
                <span>{hoverData.open.toFixed(2)}</span>
              </div>
              <div className="flex gap-3 text-white font-mono">
                <span className="text-gray-400">H:</span>
                <span className="text-green-400">{hoverData.high.toFixed(2)}</span>
              </div>
              <div className="flex gap-3 text-white font-mono">
                <span className="text-gray-400">L:</span>
                <span className="text-red-400">{hoverData.low.toFixed(2)}</span>
              </div>
              <div className="flex gap-3 text-white font-mono">
                <span className="text-gray-400">C:</span>
                <span>{hoverData.close.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
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

function generateCandleData(basePrice: number, count: number): Candle[] {
  const data: Candle[] = [];
  let currentPrice = basePrice;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const volatility = 0.015;
    const change = (Math.random() - 0.5) * volatility;

    const open = currentPrice;
    const close = currentPrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

    data.push({
      time: now - (count - i) * 60000,
      open,
      high,
      low,
      close
    });

    currentPrice = close;
  }

  return data;
}

export default InteractiveChart;
