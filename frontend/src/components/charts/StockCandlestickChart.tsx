import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { CandlePoint, IndicatorsData } from '../../types';

interface ChartProps {
  candles: CandlePoint[];
  indicators?: IndicatorsData;
  currency?: string;
}

export const StockCandlestickChart: React.FC<ChartProps> = ({ candles, indicators, currency = 'USD' }) => {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [subChart, setSubChart] = useState<'volume' | 'rsi' | 'macd'>('rsi');

  const currSymbol = currency === 'INR' || currency === 'IN' ? '₹' : '$';

  // Merge candles with calculated indicators by index
  const chartData = candles.map((c, i) => {
    const sma20 = indicators?.sma_20?.[i] ?? null;
    const sma50 = indicators?.sma_50?.[i] ?? null;
    const rsi = indicators?.rsi?.[i] ?? 50;
    const bbUpper = indicators?.bollinger_bands?.upper?.[i] ?? null;
    const bbLower = indicators?.bollinger_bands?.lower?.[i] ?? null;
    const macdVal = indicators?.macd?.macd?.[i] ?? null;
    const macdSignal = indicators?.macd?.signal?.[i] ?? null;

    return {
      time: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
      sma20,
      sma50,
      rsi,
      bbUpper,
      bbLower,
      macdVal,
      macdSignal,
      color: c.close >= c.open ? '#22c55e' : '#ef4444'
    };
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Chart Controls & Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">Overlays:</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={showSMA20}
              onChange={(e) => setShowSMA20(e.target.checked)}
              className="accent-orange-600 rounded"
            />
            SMA 20
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={showSMA50}
              onChange={(e) => setShowSMA50(e.target.checked)}
              className="accent-purple-600 rounded"
            />
            SMA 50
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={showBollinger}
              onChange={(e) => setShowBollinger(e.target.checked)}
              className="accent-brown-600 rounded"
            />
            Bollinger Bands
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Sub-Chart:</span>
          {(['rsi', 'macd', 'volume'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSubChart(mode)}
              className={`px-2.5 py-1 rounded uppercase font-bold transition-all ${
                subChart === mode ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stock Price Chart */}
      <div className="h-80 w-full glass-card rounded-xl p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#64748b"
              tickFormatter={(v) => `${currSymbol}${v}`}
              tick={{ fontSize: 11 }}
              orientation="right"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#93C5FD', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
              formatter={(value: any, name: any) => [`${currSymbol}${Number(value).toFixed(2)}`, name]}
            />
            <Area type="monotone" dataKey="close" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#priceGrad)" name="Price" />
            {showSMA20 && <Line type="monotone" dataKey="sma20" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="SMA 20" />}
            {showSMA50 && <Line type="monotone" dataKey="sma50" stroke="#8B5CF6" strokeWidth={1.5} dot={false} name="SMA 50" />}
            {showBollinger && <Line type="monotone" dataKey="bbUpper" stroke="#A16207" strokeDasharray="3 3" dot={false} name="BB Upper" />}
            {showBollinger && <Line type="monotone" dataKey="bbLower" stroke="#A16207" strokeDasharray="3 3" dot={false} name="BB Lower" />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-Chart (RSI / MACD / Volume) */}
      <div className="h-36 w-full glass-card rounded-xl p-2">
        <ResponsiveContainer width="100%" height="100%">
          {subChart === 'rsi' ? (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} ticks={[30, 50, 70]} stroke="#64748b" tick={{ fontSize: 10 }} orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#93C5FD', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
              <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={1.5} dot={false} name="RSI (14)" />
            </ComposedChart>
          ) : subChart === 'macd' ? (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#93C5FD', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
              <Line type="monotone" dataKey="macdVal" stroke="#16A34A" strokeWidth={1.5} dot={false} name="MACD" />
              <Line type="monotone" dataKey="macdSignal" stroke="#DC2626" strokeWidth={1.5} dot={false} name="Signal" />
            </ComposedChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#93C5FD', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
              <Bar dataKey="volume" fill="#0F766E" name="Volume" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
