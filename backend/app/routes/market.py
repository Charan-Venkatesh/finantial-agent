from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
import logging
import json

from ..core.database import get_db
from ..core.security import get_current_active_user
from ..models.user import User
from ..models.watchlist import Watchlist
from ..schemas.market import (
    WatchlistCreate,
    WatchlistResponse,
    TickerSubscription,
    StockPrice,
    BatchQuoteRequest
)
import asyncio
from ..services.stock_stream import stock_stream_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/market", tags=["Market Data"])


@router.get("/quote/{ticker}", response_model=StockPrice)
async def get_stock_quote(
    ticker: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current quote for a ticker.

    Args:
        ticker: Stock ticker symbol
        current_user: Authenticated user

    Returns:
        Current stock price data
    """
    quote = await stock_stream_manager.get_quote(ticker.upper())

    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote not found for ticker: {ticker}"
        )

    return quote


@router.post("/quotes", response_model=List[StockPrice])
async def get_batch_quotes(
    request: BatchQuoteRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current quotes for multiple tickers.

    Args:
        request: List of tickers
        current_user: Authenticated user

    Returns:
        List of stock price data
    """
    # Fetch quotes concurrently
    tasks = [stock_stream_manager.get_quote(ticker.upper()) for ticker in request.tickers]
    quotes = await asyncio.gather(*tasks)

    # Filter out None values (failed fetches)
    valid_quotes = [quote for quote in quotes if quote is not None]

    return valid_quotes


@router.post("/watchlist", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    watchlist_item: WatchlistCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a ticker to user's watchlist.

    Args:
        watchlist_item: Watchlist item to add
        current_user: Authenticated user
        db: Database session

    Returns:
        Created watchlist item
    """
    result = await db.execute(
        select(Watchlist).where(
            (Watchlist.user_id == current_user.id) &
            (Watchlist.ticker == watchlist_item.ticker.upper())
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticker already in watchlist"
        )

    new_watchlist = Watchlist(
        user_id=current_user.id,
        ticker=watchlist_item.ticker.upper(),
        company_name=watchlist_item.company_name,
        notes=watchlist_item.notes,
        alert_threshold=watchlist_item.alert_threshold
    )

    db.add(new_watchlist)
    await db.commit()
    await db.refresh(new_watchlist)

    logger.info(f"User {current_user.username} added {watchlist_item.ticker} to watchlist")

    return new_watchlist


@router.get("/watchlist", response_model=List[WatchlistResponse])
async def get_watchlist(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's watchlist.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        List of watchlist items
    """
    result = await db.execute(
        select(Watchlist).where(Watchlist.user_id == current_user.id)
    )
    watchlist_items = result.scalars().all()

    return watchlist_items


@router.delete("/watchlist/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(
    watchlist_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a ticker from watchlist.

    Args:
        watchlist_id: ID of watchlist item to remove
        current_user: Authenticated user
        db: Database session
    """
    result = await db.execute(
        select(Watchlist).where(
            (Watchlist.id == watchlist_id) &
            (Watchlist.user_id == current_user.id)
        )
    )
    watchlist_item = result.scalar_one_or_none()

    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )

    await db.execute(
        delete(Watchlist).where(Watchlist.id == watchlist_id)
    )
    await db.commit()

    logger.info(f"User {current_user.username} removed watchlist item {watchlist_id}")


@router.websocket("/ws/stream/{user_id}")
async def websocket_stock_stream(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time stock price updates.

    Args:
        websocket: WebSocket connection
        user_id: User identifier
    """
    await websocket.accept()
    logger.info(f"WebSocket connected: user {user_id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            action = message.get("action")
            tickers = message.get("tickers", [])

            if action == "subscribe":
                await stock_stream_manager.subscribe_user(user_id, tickers)
                await websocket.send_json({
                    "status": "subscribed",
                    "tickers": tickers
                })
                logger.info(f"User {user_id} subscribed to {tickers}")

            elif action == "unsubscribe":
                await stock_stream_manager.unsubscribe_user(user_id, tickers)
                await websocket.send_json({
                    "status": "unsubscribed",
                    "tickers": tickers
                })
                logger.info(f"User {user_id} unsubscribed from {tickers}")

            elif action == "get_quotes":
                quotes = {}
                for ticker in tickers:
                    quote = await stock_stream_manager.get_quote(ticker)
                    if quote:
                        quotes[ticker] = {
                            "price": quote.price,
                            "volume": quote.volume,
                            "change": quote.change,
                            "change_percent": quote.change_percent,
                            "timestamp": quote.timestamp.isoformat()
                        }

                await websocket.send_json({
                    "action": "quotes",
                    "data": quotes
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: user {user_id}")
        await stock_stream_manager.unsubscribe_user(user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        await websocket.close()
