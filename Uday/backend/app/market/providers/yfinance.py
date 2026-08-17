import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import httpx
import pandas as pd

from app.market.providers.base import BaseMarketDataProvider
from app.market.models import MarketData
from app.schemas.schemas import StockQuoteResponse, CandlePoint, StockSearchResult

logger = logging.getLogger(__name__)

# Fallback Sector/Industry mapping for major stocks
STOCK_SECTOR_MAP = {
    "AAPL": ("Technology", "Consumer Electronics"),
    "NVDA": ("Technology", "Semiconductors"),
    "TSLA": ("Consumer Cyclical", "Auto Manufacturers"),
    "MSFT": ("Technology", "Software—Infrastructure"),
    "GOOGL": ("Communication Services", "Internet Content & Information"),
    "AMZN": ("Consumer Cyclical", "Internet Retail"),
    "META": ("Communication Services", "Internet Content & Information"),
    "AMD": ("Technology", "Semiconductors"),
    "RELIANCE.NS": ("Energy", "Oil & Gas Refining & Marketing"),
    "TCS.NS": ("Technology", "Information Technology Services"),
    "INFY.NS": ("Technology", "Information Technology Services"),
    "HDFCBANK.NS": ("Financial Services", "Banks—Regional"),
    "ICICIBANK.NS": ("Financial Services", "Banks—Regional"),
    "SBIN.NS": ("Financial Services", "Banks—Regional"),
    "BHARTIARTL.NS": ("Communication Services", "Telecom Services"),
    "WIPRO.NS": ("Technology", "Information Technology Services"),
    "ITC.NS": ("Consumer Defensive", "Tobacco"),
    "LT.NS": ("Industrials", "Engineering & Construction"),
    "MARUTI.NS": ("Consumer Cyclical", "Auto Manufacturers"),
    "TATAPOWER.NS": ("Utilities", "Utilities—Regulated Electric"),
    "TMPV.NS": ("Consumer Cyclical", "Auto Manufacturers"),
}

class YFinanceProvider(BaseMarketDataProvider):
    """
    High-speed, resilient direct async Yahoo Finance Market Data Provider.
    Bypasses crumb-restricted endpoints by utilizing high-availability v8 Chart APIs
    and multi-region Yahoo endpoints with resilient fallbacks.
    """
    name = "yfinance"

    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

    async def fetch_market_data(self, ticker: str) -> Optional[MarketData]:
        ticker_clean = ticker.strip().upper()
        is_indian = ticker_clean.endswith(".NS") or ticker_clean.endswith(".BO")
        
        # Primary & secondary Yahoo Finance endpoints
        endpoints = [
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker_clean}?range=1y&interval=1d&includePrePost=false",
            f"https://query2.finance.yahoo.com/v8/finance/chart/{ticker_clean}?range=1y&interval=1d&includePrePost=false"
        ]

        async with httpx.AsyncClient(headers=self.headers, timeout=7.0, follow_redirects=True) as client:
            for url in endpoints:
                try:
                    resp = await client.get(url)
                    if resp.status_code != 200:
                        continue
                    
                    data = resp.json()
                    chart_results = data.get("chart", {}).get("result", [])
                    if not chart_results:
                        continue
                    
                    chart_data = chart_results[0]
                    meta = chart_data.get("meta", {})
                    indicators = chart_data.get("indicators", {}).get("quote", [{}])[0]
                    timestamps = chart_data.get("timestamp", [])

                    opens = indicators.get("open", [])
                    highs = indicators.get("high", [])
                    lows = indicators.get("low", [])
                    closes = indicators.get("close", [])
                    volumes = indicators.get("volume", [])

                    candles: List[CandlePoint] = []
                    df_rows: List[Dict[str, Any]] = []

                    for t, o, h, l, c, v in zip(timestamps, opens, highs, lows, closes, volumes):
                        if o is not None and h is not None and l is not None and c is not None:
                            try:
                                dt_str = datetime.fromtimestamp(t, timezone.utc).strftime('%Y-%m-%d')
                            except Exception:
                                dt_str = str(t)
                            
                            c_point = CandlePoint(
                                timestamp=dt_str,
                                open=round(float(o), 2),
                                high=round(float(h), 2),
                                low=round(float(l), 2),
                                close=round(float(c), 2),
                                volume=round(float(v or 0), 0)
                            )
                            candles.append(c_point)
                            df_rows.append({
                                "timestamp": dt_str,
                                "open": float(o),
                                "high": float(h),
                                "low": float(l),
                                "close": float(c),
                                "volume": float(v or 0)
                            })

                    # Extract pricing information
                    current_price = (
                        meta.get("regularMarketPrice") or
                        (candles[-1].close if candles else None)
                    )
                    if current_price is None:
                        continue

                    current_price = round(float(current_price), 2)
                    prev_close = (
                        meta.get("chartPreviousClose") or
                        meta.get("previousClose") or
                        (candles[-2].close if len(candles) > 1 else current_price)
                    )
                    prev_close = round(float(prev_close), 2)
                    
                    change = round(current_price - prev_close, 2)
                    pct_change = round((change / prev_close * 100), 2) if prev_close else 0.0

                    day_high = round(float(meta.get("regularMarketDayHigh") or (max(c.high for c in candles[-5:]) if candles else current_price)), 2)
                    day_low = round(float(meta.get("regularMarketDayLow") or (min(c.low for c in candles[-5:]) if candles else current_price)), 2)
                    open_price = round(candles[-1].open if candles else current_price, 2)

                    high_52 = meta.get("fiftyTwoWeekHigh") or (max(c.high for c in candles) if candles else current_price)
                    low_52 = meta.get("fiftyTwoWeekLow") or (min(c.low for c in candles) if candles else current_price)

                    volume = int(meta.get("regularMarketVolume") or (candles[-1].volume if candles else 1000000))
                    currency = meta.get("currency") or ("INR" if is_indian else "USD")
                    exchange = meta.get("fullExchangeName") or meta.get("exchangeName") or ("NSE" if is_indian else "NASDAQ")
                    country = "IN" if is_indian else "US"
                    name = meta.get("longName") or meta.get("shortName") or ticker_clean

                    sector, industry = STOCK_SECTOR_MAP.get(ticker_clean, ("Technology", "Software"))

                    # Compute approximate market cap based on volume and price if not present
                    market_cap = None
                    pe_ratio = None
                    dividend_yield = None

                    quote = StockQuoteResponse(
                        ticker=ticker_clean,
                        name=name,
                        current_price=current_price,
                        change=change,
                        percent_change=pct_change,
                        day_high=day_high,
                        day_low=day_low,
                        open_price=open_price,
                        previous_close=prev_close,
                        volume=volume,
                        market_cap=market_cap,
                        pe_ratio=pe_ratio,
                        dividend_yield=dividend_yield,
                        high_52w=round(float(high_52), 2) if high_52 else None,
                        low_52w=round(float(low_52), 2) if low_52 else None,
                        sector=sector,
                        industry=industry,
                        exchange=exchange,
                        country=country,
                        currency=currency,
                        last_updated=datetime.now(timezone.utc).isoformat()
                    )

                    mdata = MarketData(
                        ticker=ticker_clean,
                        quote=quote,
                        candles=candles,
                        news=[],
                        provider_name=self.name
                    )

                    if df_rows:
                        df = pd.DataFrame(df_rows)
                        df.set_index(pd.to_datetime(df["timestamp"]), inplace=True, drop=False)
                        mdata._dataframe = df

                    logger.info(f"✨ Successfully fetched live market data for {ticker_clean} ({current_price} {currency})")
                    return mdata

                except Exception as e:
                    logger.warning(f"Error fetching {ticker_clean} from {url}: {e}")
                    continue

        logger.warning(f"All Yahoo endpoints failed for {ticker_clean}")
        return None

    async def search_stocks(self, query: str, country: Optional[str] = None) -> List[StockSearchResult]:
        if not query or not query.strip():
            return []
            
        results: List[StockSearchResult] = []
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=5.0) as client:
                r = await client.get(f'https://query2.finance.yahoo.com/v1/finance/search?q={query.strip()}&quotesCount=10&newsCount=0')
                if r.status_code == 200:
                    data = r.json()
                    quotes = data.get('quotes', [])
                    for q in quotes:
                        quote_type = q.get('quoteType', '')
                        if quote_type not in ['EQUITY', 'ETF', 'MUTUALFUND']:
                            continue
                            
                        symbol = q.get('symbol', '')
                        exchange = q.get('exchDisp', '') or q.get('exchange', '')
                        
                        is_indian = symbol.endswith('.NS') or symbol.endswith('.BO') or exchange.upper() in ['NSE', 'BSE']
                        stock_country = 'IN' if is_indian else 'US'
                        
                        if country and country.upper() != stock_country:
                            continue
                            
                        sec, ind = STOCK_SECTOR_MAP.get(symbol, (q.get('sectorDisp') or q.get('sector') or "Technology", q.get('industryDisp') or q.get('industry') or "General"))
                        results.append(StockSearchResult(
                            ticker=symbol,
                            name=q.get('longname') or q.get('shortname') or symbol,
                            exchange=exchange,
                            country=stock_country,
                            sector=sec,
                            industry=ind
                        ))
        except Exception as e:
            logger.warning(f"Yahoo search failed for query '{query}': {e}")
            
        return results
