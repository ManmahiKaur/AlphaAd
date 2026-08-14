from datetime import datetime
from typing import Dict, Any, List, Optional
from app.market.manager import market_data_manager
from app.ai.agent import StockAnalysisAgent
from app.ai.llm_service import LLMService

class FinancialAdvisorChatbot:
    """Conversational Financial Advisor Chatbot Engine powered by Gemini 3.6 Flash & Centralized Market Data Layer"""

    @staticmethod
    async def answer_query(
        user_query: str,
        ticker_context: Optional[str] = None,
        portfolio_context: Optional[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        query_lower = user_query.lower()
        sources = []

        # Determine target tickers from context or query keywords
        target_tickers = []
        if ticker_context:
            target_tickers.append(ticker_context.upper())

        known_map = {
            "apple": "AAPL", "aapl": "AAPL",
            "nvidia": "NVDA", "nvda": "NVDA",
            "tesla": "TSLA", "tsla": "TSLA",
            "microsoft": "MSFT", "msft": "MSFT",
            "google": "GOOGL", "googl": "GOOGL", "alphabet": "GOOGL",
            "amazon": "AMZN", "amzn": "AMZN",
            "meta": "META", "facebook": "META",
            "amd": "AMD",
            "reliance": "RELIANCE.NS",
            "tcs": "TCS.NS",
            "infosys": "INFY.NS", "infy": "INFY.NS",
            "hdfc": "HDFCBANK.NS", "hdfcbank": "HDFCBANK.NS",
            "icici": "ICICIBANK.NS", "icicibank": "ICICIBANK.NS",
            "tata motors": "TATAMOTORS.NS", "tatamotors": "TATAMOTORS.NS",
            "airtel": "BHARTIARTL.NS", "bharti": "BHARTIARTL.NS",
            "wipro": "WIPRO.NS",
            "netflix": "NFLX", "nflx": "NFLX",
            "walmart": "WMT", "wmt": "WMT",
        }
        # Added typo variations for better ticker detection
        known_map["tsc"] = "TCS.NS"
        known_map["tata"] = "TATAMOTORS.NS"
        for kw, t in known_map.items():
            if kw in query_lower and t not in target_tickers:
                target_tickers.append(t)

        if not target_tickers:
            import re
            matches = re.findall(r'\b[A-Z]{2,5}(?:\.[A-Z]{2})?\b', user_query)
            for m in matches:
                if m not in target_tickers:
                    target_tickers.append(m)

        # Ensure we don't have too many, limit to 2 for comparison
        target_tickers = target_tickers[:2]
        target_ticker = target_tickers[0] if target_tickers else None

        # Fetch unified MarketData objects & quantitative indicators
        stock_data = {}
        for ticker in target_tickers:
            try:
                mdata = await market_data_manager.get_market_data(ticker)
                quote = mdata.quote.model_dump()
                indicators = mdata.indicators.model_dump() if mdata.indicators else {}
                rec = await StockAnalysisAgent.run_analysis(ticker)

                def get_latest(key, default=None):
                    vals = indicators.get(key)
                    if isinstance(vals, list) and len(vals) > 0:
                        return vals[-1]
                    return default

                stock_data[ticker] = {
                    "ticker": ticker,
                    "quote": quote,
                    "quantitative_indicators": {
                        "sma_20": get_latest("sma_20"),
                        "rsi": get_latest("rsi", 50.0),
                        "macd_line": indicators.get("macd", {}).get("macd", [None])[-1] if indicators.get("macd") else None,
                    },
                    "recommendation": rec.get("recommendation"),
                    "confidence": rec.get("confidence"),
                }
            except Exception as err:
                print(f"Warning: Failed to fetch market data for {ticker}: {err}")

                # Detect comparison intent early and handle it before generic LLM routing
        if any(kw in query_lower for kw in ["compare", "compare between", "compara", "which is better", "which should i buy", "difference between", "vs", "versus"]):
            if len(target_tickers) >= 2:
                t1, t2 = target_tickers[0], target_tickers[1]
                d1, d2 = stock_data.get(t1), stock_data.get(t2)
                response = f"### 📊 Comparative Analysis: {t1} vs {t2}\n\n"
                recs = {}
                for t, d in [(t1, d1), (t2, d2)]:
                    if not d:
                        continue
                    quote = d["quote"]
                    q = d["quantitative_indicators"]
                    price = quote.get("current_price", "N/A")
                    change_pct = quote.get("percent_change", "N/A")
                    market_cap = quote.get("market_cap")
                    pe = quote.get("pe_ratio")
                    dividend = quote.get("dividend_yield")
                    rsi = q.get("rsi")
                    sma20 = q.get("sma_20")
                    atr = q.get("atr")
                    recommendation = d.get("recommendation", "N/A")
                    confidence = d.get("confidence", "N/A")
                    recs[t] = {"rec": recommendation, "conf": confidence}
                    response += f"**{t}**\n"
                    response += f"- Price: ${price} ({change_pct}%)\n"
                    if market_cap:
                        response += f"- Market Cap: ${market_cap/1e9:.2f}B\n"
                    if pe:
                        response += f"- P/E Ratio: {pe:.2f}\n"
                    if dividend:
                        response += f"- Dividend Yield: {dividend:.2f}%\n"
                    response += f"- Recommendation: {recommendation} (Confidence: {confidence}%)\n"
                    if isinstance(rsi, (int, float)):
                        response += f"- RSI: {rsi:.2f}\n"
                    if sma20 is not None:
                        response += f"- SMA‑20: {sma20}\n"
                    if atr is not None:
                        response += f"- ATR (risk proxy): {atr}\n"
                    response += "\n"
                def best_stock(rec_dict):
                    buys = [t for t, v in rec_dict.items() if v["rec"] == "BUY"]
                    if len(buys) == 1:
                        return buys[0]
                    sorted_conf = sorted(rec_dict.items(), key=lambda kv: kv[1]["conf"] if isinstance(kv[1]["conf"], (int, float)) else 0, reverse=True)
                    return sorted_conf[0][0] if sorted_conf else None
                winner = best_stock(recs)
                if winner:
                    response += f"**Conclusion:** Based on recommendation and confidence, **{winner}** appears to be the stronger buy candidate.\n"
                else:
                    response += "**Conclusion:** No clear winner could be derived from the available data.\n"
                response += "\n_The above analysis uses real‑time market data and technical indicators. Please consult a qualified financial advisor before making investment decisions._"
                sources.append("Quantitative Comparison Engine")
                return {
                    "message": response,
                    "sources": sources,
                    "timestamp": datetime.utcnow()
                }
        # Determine intent and respond accordingly
        # 1. Comparison is already handled above
        # 2. Educational explanations
        edu_keywords = ["explain", "definition", "what is", "meaning of", "describe"]
        if any(kw in query_lower for kw in edu_keywords) and not target_tickers:
            # Use LLM to explain the concept
            if LLMService.is_available():
                llm_response = LLMService.answer_chat_query(
                    user_query=user_query,
                    ticker_context=None,
                    stock_data=None,
                    portfolio_context=portfolio_context,
                    chat_history=chat_history
                )
                if llm_response:
                    sources.append("Gemini 3.6 Flash Reasoning Engine")
                    return {"message": llm_response, "sources": sources, "timestamp": datetime.utcnow()}
            # Fallback simple message
            response = "I’m ready to explain that concept, but I’m currently unable to retrieve the details."
            return {"message": response, "sources": sources, "timestamp": datetime.utcnow()}

        # 3. Stock‑specific queries (single ticker)
        if target_tickers:
            ticker = target_tickers[0]
            data = stock_data.get(ticker)
            if data:
                quote = data["quote"]
                q = data["quantitative_indicators"]
                price = quote.get("current_price", "N/A")
                change_pct = quote.get("percent_change", "N/A")
                market_cap = quote.get("market_cap")
                pe = quote.get("pe_ratio")
                dividend = quote.get("dividend_yield")
                rsi = q.get("rsi")
                sma20 = q.get("sma_20")
                atr = q.get("atr")
                recommendation = data.get("recommendation", "N/A")
                confidence = data.get("confidence", "N/A")
                response = f"### 📈 Analysis for {ticker}\n"
                response += f"- Price: ${price} ({change_pct}%)\n"
                if market_cap:
                    response += f"- Market Cap: ${market_cap/1e9:.2f}B\n"
                if pe:
                    response += f"- P/E Ratio: {pe:.2f}\n"
                if dividend:
                    response += f"- Dividend Yield: {dividend:.2f}%\n"
                response += f"- Recommendation: {recommendation} (Confidence: {confidence}%)\n"
                if isinstance(rsi, (int, float)):
                    response += f"- RSI: {rsi:.2f}\n"
                if sma20 is not None:
                    response += f"- SMA‑20: {sma20}\n"
                if atr is not None:
                    response += f"- ATR (risk proxy): {atr}\n"
                response += "\n_Data is real‑time; please consult a qualified financial advisor before acting._"
                sources.append("Quantitative Stock Analysis Engine")
                return {"message": response, "sources": sources, "timestamp": datetime.utcnow()}

        # 4. Ambiguous or unclear request – ask for clarification
        response = "I’m not sure what you’re asking. Could you please clarify your request?"
        return {"message": response, "sources": sources, "timestamp": datetime.utcnow()}


        return {
            "message": response,
            "sources": sources,
            "timestamp": datetime.utcnow()
        }
