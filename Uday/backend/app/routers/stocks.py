from typing import List, Optional, Any
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from app.schemas.schemas import StockQuoteResponse, StockHistoryResponse, IndicatorsResponse, StockSearchResult
from app.services.stock_service import StockService
from app.market.manager import market_data_manager, POPULAR_STOCKS_DATA

router = APIRouter(prefix="/stocks", tags=["Stock Data & Indicators"])

@router.get("/test-yahoo")
async def test_yahoo_endpoint(ticker: str = "AAPL"):
    import yfinance as yf
    try:
        data = yf.Ticker(ticker)
        info = data.info or getattr(data, 'fast_info', {})
        if info:
            return {"success": True, "provider": "yfinance", "symbol": ticker}
        return {"success": False, "provider": "yfinance", "symbol": ticker, "error": "No info returned"}
    except Exception as e:
        return {"success": False, "provider": "yfinance", "symbol": ticker, "error": str(e)}

@router.get("/search", response_model=List[StockSearchResult])
async def search_stocks(query: str = Query("", description="Ticker or Company Name"), country: Optional[str] = Query(None, description="IN or US")):
    return await StockService.search_stocks(query, country)

@router.get("/trending", response_model=List[StockQuoteResponse])
async def get_trending_stocks(country: str = Query("US", description="IN or US")):
    country_upper = country.upper() if country else "US"
    # Get top 4 configured symbols for the requested country
    target_stocks = [s["ticker"] for s in POPULAR_STOCKS_DATA if s.get("country", "").upper() == country_upper][:4]
    
    # Fallback to hardcoded safe defaults if configuration is somehow missing
    if not target_stocks:
        target_stocks = ["AAPL", "NVDA", "TSLA", "MSFT"] if country_upper == "US" else ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"]
        
    # Reuse exact same provider architecture (yfinance -> Finnhub fallback) via get_market_data_batch
    results = await market_data_manager.get_market_data_batch(target_stocks)
    
    quotes = []
    # Preserve order and handle partial failures gracefully
    for ticker in target_stocks:
        mdata = results.get(ticker)
        if mdata and mdata.quote:
            quotes.append(mdata.quote)
            
    if not quotes:
        raise HTTPException(status_code=503, detail="Market data for trending stocks is temporarily unavailable.")
        
    return quotes

@router.get("/{ticker}/quote", response_model=StockQuoteResponse)
async def get_stock_quote(ticker: str):
    return await StockService.get_stock_quote(ticker)

@router.get("/{ticker}/history", response_model=StockHistoryResponse)
async def get_stock_history(
    ticker: str,
    period: str = Query("1Y", description="1D, 1W, 1M, 1Y, 5Y"),
    interval: str = Query("1d", description="1m, 5m, 1d, 1wk")
):
    candles = await StockService.get_stock_history(ticker, period=period, interval=interval)
    return StockHistoryResponse(ticker=ticker.upper(), period=period, candles=candles)

@router.get("/{ticker}/indicators", response_model=IndicatorsResponse)
async def get_stock_indicators(ticker: str, period: str = Query("1Y", description="1M, 6M, 1Y, 5Y")):
    return await StockService.get_stock_indicators(ticker, period=period)
