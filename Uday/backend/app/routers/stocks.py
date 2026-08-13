from typing import List, Optional, Any
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from app.schemas.schemas import StockQuoteResponse, StockHistoryResponse, IndicatorsResponse, StockSearchResult
from app.services.stock_service import StockService

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

@router.get("/{ticker}/quote", response_model=Any)
async def get_stock_quote(ticker: str):
    try:
        return await StockService.get_stock_quote(ticker)
    except HTTPException as he:
        return JSONResponse(
            status_code=200, 
            content={"success": False, "symbol": ticker.upper(), "error": he.detail}
        )
    except Exception as e:
        return JSONResponse(
            status_code=200, 
            content={"success": False, "symbol": ticker.upper(), "error": str(e)}
        )

@router.get("/{ticker}/history", response_model=Any)
async def get_stock_history(
    ticker: str,
    period: str = Query("1Y", description="1D, 1W, 1M, 1Y, 5Y"),
    interval: str = Query("1d", description="1m, 5m, 1d, 1wk")
):
    try:
        candles = await StockService.get_stock_history(ticker, period=period, interval=interval)
        return StockHistoryResponse(ticker=ticker.upper(), period=period, candles=candles)
    except HTTPException as he:
        return JSONResponse(
            status_code=200, 
            content={"success": False, "symbol": ticker.upper(), "error": he.detail}
        )
    except Exception as e:
        return JSONResponse(
            status_code=200, 
            content={"success": False, "symbol": ticker.upper(), "error": str(e)}
        )

@router.get("/{ticker}/indicators", response_model=IndicatorsResponse)
async def get_stock_indicators(ticker: str, period: str = Query("1Y", description="1M, 6M, 1Y, 5Y")):
    return await StockService.get_stock_indicators(ticker, period=period)
