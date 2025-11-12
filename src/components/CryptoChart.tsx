import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface FibLevel {
  level: number;
  price: number;
  label: string;
  color: string;
}

export default function CryptoChart() {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [fibLevels, setFibLevels] = useState<FibLevel[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    const basePrice = 45000;
    const volatility = 2000;
    const candleCount = 50;
    
    const generatedCandles: CandleData[] = [];
    let lastClose = basePrice;
    
    for (let i = 0; i < candleCount; i++) {
      const open = lastClose;
      const change = (Math.random() - 0.5) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (volatility / 2);
      const low = Math.min(open, close) - Math.random() * (volatility / 2);
      
      generatedCandles.push({
        time: Date.now() - (candleCount - i) * 3600000,
        open,
        high,
        low,
        close
      });
      
      lastClose = close;
    }
    
    setCandles(generatedCandles);
    setCurrentPrice(lastClose);
    
    const allPrices = generatedCandles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    setPriceRange({ min, max });
    
    const fibLevelsData: FibLevel[] = [
      { level: 0, price: min, label: '0%', color: 'hsl(var(--chart-fib-236))' },
      { level: 0.236, price: min + (max - min) * 0.236, label: '23.6%', color: 'hsl(var(--chart-fib-236))' },
      { level: 0.382, price: min + (max - min) * 0.382, label: '38.2%', color: 'hsl(var(--chart-fib-382))' },
      { level: 0.5, price: min + (max - min) * 0.5, label: '50%', color: 'hsl(var(--chart-fib-50))' },
      { level: 0.618, price: min + (max - min) * 0.618, label: '61.8%', color: 'hsl(var(--chart-fib-618))' },
      { level: 1, price: max, label: '100%', color: 'hsl(var(--chart-fib-236))' }
    ];
    
    setFibLevels(fibLevelsData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 50;
        return prev + change;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getPriceY = (price: number, height: number) => {
    const range = priceRange.max - priceRange.min;
    const normalized = (price - priceRange.min) / range;
    return height - (normalized * height * 0.9) - (height * 0.05);
  };

  const getActiveZone = () => {
    if (!fibLevels.length) return null;
    
    for (let i = 0; i < fibLevels.length - 1; i++) {
      if (currentPrice >= fibLevels[i].price && currentPrice <= fibLevels[i + 1].price) {
        return { lower: fibLevels[i], upper: fibLevels[i + 1] };
      }
    }
    return null;
  };

  const chartHeight = 500;
  const chartWidth = 1000;
  const candleWidth = chartWidth / candles.length;
  const activeZone = getActiveZone();

  return (
    <div className="relative w-full h-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
        <defs>
          <linearGradient id="activeZoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {fibLevels.map((fib, index) => {
          const y = getPriceY(fib.price, chartHeight);
          return (
            <g key={index}>
              <line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke={fib.color}
                strokeWidth="1.5"
                strokeDasharray={fib.level === 0.5 ? "5,5" : "2,4"}
                opacity="0.6"
              />
              <text
                x={chartWidth - 100}
                y={y - 5}
                fill={fib.color}
                fontSize="11"
                fontWeight="600"
              >
                {fib.label} - ${fib.price.toFixed(2)}
              </text>
            </g>
          );
        })}

        {activeZone && (
          <rect
            x={0}
            y={getPriceY(activeZone.upper.price, chartHeight)}
            width={chartWidth}
            height={getPriceY(activeZone.lower.price, chartHeight) - getPriceY(activeZone.upper.price, chartHeight)}
            fill="url(#activeZoneGradient)"
            opacity="0.8"
          />
        )}

        {candles.map((candle, index) => {
          const x = index * candleWidth + candleWidth / 2;
          const isGreen = candle.close > candle.open;
          const color = isGreen ? 'hsl(var(--chart-buy))' : 'hsl(var(--chart-sell))';
          
          const openY = getPriceY(candle.open, chartHeight);
          const closeY = getPriceY(candle.close, chartHeight);
          const highY = getPriceY(candle.high, chartHeight);
          const lowY = getPriceY(candle.low, chartHeight);
          
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(openY - closeY);

          return (
            <g key={index}>
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth="1.5"
                opacity="0.8"
              />
              <rect
                x={x - candleWidth * 0.35}
                y={bodyTop}
                width={candleWidth * 0.7}
                height={Math.max(bodyHeight, 2)}
                fill={color}
                opacity="0.9"
              />
            </g>
          );
        })}

        <line
          x1={0}
          y1={getPriceY(currentPrice, chartHeight)}
          x2={chartWidth}
          y2={getPriceY(currentPrice, chartHeight)}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="8,4"
        />
        
        <circle
          cx={chartWidth - 50}
          cy={getPriceY(currentPrice, chartHeight)}
          r="5"
          fill="hsl(var(--primary))"
          className="animate-pulse"
        />
        
        <rect
          x={chartWidth - 120}
          y={getPriceY(currentPrice, chartHeight) - 15}
          width="110"
          height="30"
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          rx="4"
        />
        
        <text
          x={chartWidth - 65}
          y={getPriceY(currentPrice, chartHeight) + 5}
          fill="hsl(var(--primary))"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
        >
          ${currentPrice.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}
