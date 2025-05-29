'use client';

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TickerEnum = 'btcusdt' | 'ethusdt' | 'bnbusdt' | 'solusdt';

interface PricePoint {
  time: string;
  price: number;
}

interface PriceChartProps {
  ticker: TickerEnum;
}

const currencyMap: Record<TickerEnum, string> = {
  btcusdt: 'BTC/USDT',
  ethusdt: 'ETH/USDT',
  bnbusdt: 'BNB/USDT',
  solusdt: 'SOL/USDT',
};

export default function PriceChart({ ticker }: PriceChartProps) {
  const [marketData, setMarketData] = useState<PricePoint[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const socketRef = useRef<WebSocket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate price range whenever market data changes
  useEffect(() => {
    if (marketData.length > 0) {
      const prices = marketData.map(point => point.price as number);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const padding = Math.max((max - min) * 0.05, 25); // 5% or at least $25 padding
      setPriceRange({
        min: min - padding,
        max: max + padding,
      });
    }
  }, [marketData]);

  // Connect to Binance WebSocket for real-time trades
  useEffect(() => {
    const endpoints = [
      `wss://stream.binance.com:9443/ws/${ticker}@ticker`,
      `wss://stream.binance.com:443/ws/${ticker}@ticker`,
      `wss://data-stream.binance.vision:9443/ws/${ticker}@ticker`,
      `wss://stream.binance.us:9443/ws/${ticker}@ticker`,
    ];

    let currentEndpointIndex = 0;

    const connectWebSocket = () => {
      // if (currentEndpointIndex >= endpoints.length) {
      //   console.error('All Binance endpoints failed. Using mock data...');
      //   // Start mock data generation as fallback
      //   startMockData();
      //   return;
      // }

      const endpoint = endpoints[currentEndpointIndex];
      console.log(`Attempting to connect to: ${endpoint}`);

      const ws = new WebSocket(endpoint);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log(`Successfully connected to: ${endpoint}`);
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          // console.log('Received data:', data)

          const price = parseFloat(data.c);
          // console.log('Price:', price);
          const time = new Date().toLocaleTimeString();
          const newPoint = { time, price };

          setMarketData(prev => {
            const updated = [...prev, newPoint];
            return updated.length > 100 ? updated.slice(-100) : updated;
          });

          // Set loading to false once we receive first data
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      ws.onerror = err => {
        console.error(`WebSocket Error for ${endpoint}:`, err);
        console.error('WebSocket readyState:', ws.readyState);
        currentEndpointIndex++;
        setTimeout(connectWebSocket, 2000); // Try next endpoint after 2 seconds
      };

      ws.onclose = event => {
        console.log(`WebSocket closed for ${endpoint}:`, event.code, event.reason);
        if (event.code !== 1000) {
          currentEndpointIndex++;
          setTimeout(connectWebSocket, 2000); // Try next endpoint
        }
      };
    };

    // const startMockData = () => {
    //   console.log('Starting mock BTC price data...');
    //   let mockPrice = 95000; // Starting price around $95k

    //   const interval = setInterval(() => {
    //     // Simulate price movement
    //     const change = (Math.random() - 0.5) * 100; // Random change between -$50 and +$50
    //     mockPrice += change;

    //     const time = new Date().toLocaleTimeString();
    //     const newPoint = { time, price: mockPrice };

    //     setMarketData((prev) => {
    //       const updated = [...prev, newPoint];
    //       return updated.length > 100 ? updated.slice(-100) : updated;
    //     });
    //   }, 2000); // Update every 2 seconds

    //   // Store interval in ref so we can clean it up
    //   socketRef.current = { close: () => clearInterval(interval) } as WebSocket;
    // };

    connectWebSocket();

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="rounded-lg border border-cyan-500 bg-gray-900 text-center text-white shadow-[0_0_10px_cyan]">
      {/* Header section - always visible */}
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-lg p-3 transition-colors hover:bg-gray-800/50 sm:p-4 md:p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 flex-1">
          <h2 className="mb-1 truncate text-sm text-cyan-300 sm:mb-2 sm:text-lg md:text-xl">
            Live {currencyMap[ticker]} Price (Binance)
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-2 sm:py-4">
              <Loader2 className="mr-1 h-4 w-4 animate-spin text-cyan-400 sm:mr-2 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              <span className="text-xs text-cyan-400 sm:text-sm md:text-lg">
                Loading price data...
              </span>
            </div>
          ) : marketData.length > 0 ? (
            <div className="animate-pulse font-mono text-lg break-all text-cyan-400 sm:text-2xl md:text-3xl">
              $
              {marketData[marketData.length - 1].price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400 sm:text-base md:text-lg">No data available</div>
          )}
        </div>
        <div className="ml-2 flex-shrink-0 sm:ml-4">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-cyan-400 transition-transform sm:h-5 sm:w-5 md:h-6 md:w-6" />
          ) : (
            <ChevronDown className="h-4 w-4 text-cyan-400 transition-transform sm:h-5 sm:w-5 md:h-6 md:w-6" />
          )}
        </div>
      </div>

      {/* Chart section - only visible when expanded */}
      {isExpanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
          <div className="h-[250px] w-full sm:h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="time"
                  stroke="#888"
                  tick={{ fill: '#888', fontSize: 10 }}
                  className="text-xs sm:text-sm"
                />
                <YAxis
                  width={60} // Reduced for mobile
                  className="sm:w-20 md:w-24"
                  stroke="#888"
                  tick={{ fill: '#888', fontSize: 10 }}
                  tickFormatter={value =>
                    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  }
                  domain={[priceRange.min, priceRange.max]}
                  allowDataOverflow={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888', fontSize: '11px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#0ff"
                  strokeWidth={1.5}
                  className="sm:stroke-2"
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
