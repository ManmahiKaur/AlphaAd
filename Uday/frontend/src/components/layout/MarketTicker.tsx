import React, { useEffect, useState, useRef } from 'react';
import { stocksApi } from '../../api';
import { StockQuote } from '../../types';
import { useCountry } from '../../context/CountryContext';

const TICKERS = {
  US: [
    { ticker: 'AAPL', name: 'Apple' },
    { ticker: 'MSFT', name: 'Microsoft' },
    { ticker: 'NVDA', name: 'Nvidia' },
    { ticker: 'TSLA', name: 'Tesla' },
    { ticker: 'GOOGL', name: 'Alphabet' },
    { ticker: 'AMZN', name: 'Amazon' },
    { ticker: 'META', name: 'Meta' },
    { ticker: 'AMD', name: 'AMD' }
  ],
  IN: [
    { ticker: '^NSEI', name: 'Nifty 50' },
    { ticker: 'RELIANCE.NS', name: 'Reliance' },
    { ticker: 'TCS.NS', name: 'TCS' },
    { ticker: 'HDFCBANK.NS', name: 'HDFC' },
    { ticker: 'INFY.NS', name: 'Infosys' },
    { ticker: 'ICICIBANK.NS', name: 'ICICI' }
  ]
};

const isMarketOpen = (market: 'US' | 'IN'): boolean => {
  const timeZone = market === 'US' ? 'America/New_York' : 'Asia/Kolkata';
  
  try {
    const now = new Date();
    // Get the localized string for the target timezone
    const tzString = now.toLocaleString('en-US', { timeZone });
    const tzDate = new Date(tzString);
    
    const day = tzDate.getDay();
    const hours = tzDate.getHours();
    const minutes = tzDate.getMinutes();
    const month = tzDate.getMonth() + 1;
    const date = tzDate.getDate();
    
    // Weekends
    if (day === 0) return false; // Sunday is always closed
    if (day === 6 && market === 'US') return false; // US is closed on Saturday
    // IN market occasionally has special live trading sessions on Saturdays, so we allow it to be evaluated by time.
    
    const isHoliday = (m: number, d: number) => month === m && date === d;
    
    if (market === 'US') {
      if (isHoliday(1, 1) || isHoliday(7, 4) || isHoliday(12, 25)) return false;
      const timeInMinutes = hours * 60 + minutes;
      // US Market: 9:30 AM to 4:00 PM (570 to 960)
      return timeInMinutes >= 570 && timeInMinutes < 960;
    } else {
      if (isHoliday(1, 26) || isHoliday(8, 15) || isHoliday(10, 2) || isHoliday(12, 25)) return false;
      const timeInMinutes = hours * 60 + minutes;
      // IN Market: 9:15 AM to 3:30 PM (555 to 930)
      return timeInMinutes >= 555 && timeInMinutes < 930;
    }
  } catch (error) {
    // Fallback if Date parsing fails
    return false;
  }
};

const TickerItem = ({ market, ticker, name }: { market: 'US' | 'IN', ticker: string, name: string }) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    const fetchQuote = async () => {
      try {
        const data = await stocksApi.getQuote(ticker);
        setQuote(data);
        setError(false);
      } catch (err) {
        setError(true);
      }
    };

    fetchQuote(); // initial fetch
    // Poll every 10 seconds
    interval = setInterval(fetchQuote, 10000);

    return () => clearInterval(interval);
  }, [ticker]);

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 border-r border-slate-200/50 whitespace-nowrap text-xs text-rose-500 min-w-max">
        <span className="font-bold">{market === 'US' ? '🇺🇸 US' : '🇮🇳 INDIA'}</span>
        <span>{name} Data Unavailable</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center gap-2 px-4 border-r border-slate-200/50 whitespace-nowrap text-xs text-slate-500 animate-pulse min-w-max">
        <span className="font-bold">{market === 'US' ? '🇺🇸 US' : '🇮🇳 INDIA'}</span>
        <span>{name} Loading...</span>
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const currencySymbol = market === 'US' ? '$' : '₹';
  
  return (
    <div className="flex items-center gap-3 px-6 border-r border-slate-200/50 whitespace-nowrap min-w-max">
      <span className="text-xs font-semibold text-slate-900">{name}</span>
      <span className="text-xs font-mono font-medium">
        {currencySymbol}{quote.current_price.toFixed(2)}
      </span>
      <span className={`text-xs font-mono font-medium flex items-center ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(quote.change).toFixed(2)} ({isPositive ? '+' : ''}{quote.percent_change.toFixed(2)}%)
      </span>
    </div>
  );
};

export const MarketTicker: React.FC = () => {
  const { country } = useCountry();
  const [isOpen, setIsOpen] = useState(isMarketOpen(country));

  useEffect(() => {
    // Check initial state
    setIsOpen(isMarketOpen(country));

    // Poll market status every minute
    const interval = setInterval(() => {
      setIsOpen(isMarketOpen(country));
    }, 60000);

    return () => clearInterval(interval);
  }, [country]);

  const activeTickers = TICKERS[country];

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 overflow-hidden relative z-50 py-1.5 flex items-center">
      {isOpen ? (
        // Marquee container
        <div className="flex w-full group overflow-hidden">
          {/* We create a seamless loop by animating a container with TWO identical lists of tickers side-by-side */}
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] hover:[animation-play-state:paused]">
            <div className="flex">
              {activeTickers.map(item => (
                <TickerItem key={item.ticker} market={country} ticker={item.ticker} name={item.name} />
              ))}
            </div>
            {/* Duplicate for seamless scrolling */}
            <div className="flex">
              {activeTickers.map(item => (
                <TickerItem key={item.ticker + '_dup'} market={country} ticker={item.ticker} name={item.name} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Closed state
        <div className="max-w-7xl mx-auto flex w-full justify-center text-xs font-bold text-slate-500 py-1 tracking-wide">
          <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {country === 'US' ? '🇺🇸 US MARKET CLOSED' : '🇮🇳 INDIA MARKET CLOSED'}
          </span>
        </div>
      )}
    </div>
  );
};
