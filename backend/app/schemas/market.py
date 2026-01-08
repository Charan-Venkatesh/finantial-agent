from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class TickerSubscription(BaseModel):
    """Schema for subscribing to ticker updates."""
    tickers: List[str] = Field(..., min_items=1, max_items=20)


class BatchQuoteRequest(BaseModel):
    """Schema for requesting multiple stock quotes."""
    tickers: List[str] = Field(..., min_items=1, max_items=20)


class StockPrice(BaseModel):
    """Real-time stock price data."""
    ticker: str
    price: float
    volume: int
    timestamp: datetime
    change: Optional[float] = None
    change_percent: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None


class WatchlistCreate(BaseModel):
    """Schema for creating a watchlist item."""
    ticker: str = Field(..., min_length=1, max_length=20)
    company_name: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)
    alert_threshold: Optional[Dict[str, Any]] = None


class WatchlistResponse(WatchlistCreate):
    """Schema for watchlist response."""
    id: int
    user_id: int
    added_at: datetime

    class Config:
        from_attributes = True


class QueryType(str, Enum):
    """Types of AI queries."""
    MARKET_ANALYSIS = "market_analysis"
    NEWS_SENTIMENT = "news_sentiment"
    RISK_ASSESSMENT = "risk_assessment"
    DECISION_SYNTHESIS = "decision_synthesis"


class AIQueryRequest(BaseModel):
    """Request for AI agent analysis."""
    tickers: List[str] = Field(..., min_items=1, max_items=10)
    query_type: QueryType
    additional_context: Optional[str] = None


class AgentInsight(BaseModel):
    """Individual agent insight."""
    agent_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    summary: str
    details: Dict[str, Any]
    reasoning: str


class AIQueryResponse(BaseModel):
    """Response from AI agent analysis."""
    query_id: int
    query_type: QueryType
    tickers: List[str]
    insights: List[AgentInsight]
    synthesis: str
    risk_level: str  # low, medium, high
    execution_time_ms: int
    timestamp: datetime
