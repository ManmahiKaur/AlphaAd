from typing import Any, List
from fastapi import APIRouter
from app.schemas.schemas import RecommendationResponse
from app.ai.agent import StockAnalysisAgent

router = APIRouter(prefix="/analysis", tags=["AI Recommendation Engine"])

from datetime import datetime

def _ensure_list(val: Any, delim: str = "\n") -> List[str]:
    if isinstance(val, list):
        return [str(item).strip() for item in val if str(item).strip()]
    if isinstance(val, str):
        return [item.strip() for item in val.split(delim) if item.strip()]
    return []

@router.get("/recommendation/{ticker}", response_model=RecommendationResponse)
async def get_ai_recommendation(ticker: str):
    analysis_dict = await StockAnalysisAgent.run_analysis(ticker)
    analysis_dict.setdefault("created_at", datetime.utcnow().isoformat())
    analysis_dict["reasons"] = _ensure_list(analysis_dict.get("reasons", []), "\n")
    analysis_dict["supporting_indicators"] = _ensure_list(analysis_dict.get("supporting_indicators", []), "\n")
    analysis_dict["potential_risks"] = _ensure_list(analysis_dict.get("potential_risks", []), ",")
    analysis_dict["alternative_stocks"] = _ensure_list(analysis_dict.get("alternative_stocks", []), ",")
    return RecommendationResponse(**analysis_dict)
