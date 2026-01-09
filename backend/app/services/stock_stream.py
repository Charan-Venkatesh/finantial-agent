from typing import Dict, Set, Callable, Optional, List
import asyncio
import json
from datetime import datetime
import logging
import aiohttp
import ssl

from ..core.config import settings
from ..schemas.market import StockPrice

logger = logging.getLogger(__name__)


class FinnhubProvider:
    """Finnhub WebSocket and REST API provider implementation."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.ws = None
        self.connected = False
        self._subscribed_tickers: Set[str] = set()
        self.base_url = "https://finnhub.io/api/v1"
        self.session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Lazily create and return the client session."""
        if self.session is None or self.session.closed:
            # Create SSL context that doesn't verify certificates (for development)
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE

            connector = aiohttp.TCPConnector(ssl=ssl_context)
            self.session = aiohttp.ClientSession(connector=connector)
        return self.session

    async def close_session(self):
        """Close the client session."""
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None
            logger.info("Closed Finnhub REST session")

    async def connect(self):
        """Connect to Finnhub WebSocket."""
        try:
            import websockets

            url = f"wss://ws.finnhub.io?token={self.api_key}"
            self.ws = await websockets.connect(url)
            self.connected = True
            logger.info("Connected to Finnhub WebSocket")

        except Exception as e:
            logger.error(f"Failed to connect to Finnhub: {e}")
            raise

    async def disconnect(self):
        """Disconnect from Finnhub WebSocket."""
        if self.ws:
            await self.ws.close()
            self.connected = False
            logger.info("Disconnected from Finnhub WebSocket")

    async def subscribe(self, tickers: List[str]):
        """Subscribe to ticker updates."""
        if not self.connected:
            await self.connect()

        for ticker in tickers:
            subscribe_message = json.dumps({"type": "subscribe", "symbol": ticker})
            await self.ws.send(subscribe_message)
            self._subscribed_tickers.add(ticker)

        logger.info(f"Subscribed to tickers: {tickers}")

    async def unsubscribe(self, tickers: List[str]):
        """Unsubscribe from ticker updates."""
        for ticker in tickers:
            unsubscribe_message = json.dumps({"type": "unsubscribe", "symbol": ticker})
            await self.ws.send(unsubscribe_message)
            self._subscribed_tickers.discard(ticker)

        logger.info(f"Unsubscribed from tickers: {tickers}")

    async def get_latest_quote(self, ticker: str) -> Optional[StockPrice]:
        """Get the latest quote for a ticker using REST API."""
        try:
            url = f"{self.base_url}/quote"
            params = {"symbol": ticker, "token": self.api_key}

            session = await self._get_session()
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()

                    # Check if data is valid (not empty response)
                    if not data.get("c"):
                        logger.error(f"No data returned for ticker: {ticker}")
                        return None

                    return StockPrice(
                        ticker=ticker,
                        price=float(data.get("c") or 0),  # Current price
                        volume=int(data.get("v") or 0),  # Volume
                        timestamp=datetime.utcnow(),
                        change=float(data.get("d") or 0),  # Change
                        change_percent=float(data.get("dp") or 0),  # Change percent
                        open=float(data.get("o") or 0),  # Open
                        high=float(data.get("h") or 0),  # High
                        low=float(data.get("l") or 0),  # Low
                        close=float(data.get("pc") or 0)  # Previous close
                    )
                else:
                    logger.error(f"Finnhub API error: {response.status}")
                    return None

        except Exception as e:
            logger.error(f"Error fetching quote from Finnhub: {e}")
            return None

    async def listen(self, callback: Callable[[StockPrice], None]):
        """Listen to WebSocket messages and invoke callback."""
        while self.connected:
            try:
                message = await self.ws.recv()
                data = json.loads(message)

                if data.get("type") == "trade":
                    for trade in data.get("data", []):
                        stock_price = StockPrice(
                            ticker=trade.get("s"),
                            price=float(trade.get("p")),
                            volume=int(trade.get("v", 0)),
                            timestamp=datetime.fromtimestamp(trade.get("t", 0) / 1000)
                        )
                        await callback(stock_price)

            except Exception as e:
                logger.error(f"Error in Finnhub WebSocket listener: {e}")
                break


class StockStreamManager:
    """Manager for handling real-time stock data streams using Finnhub."""

    def __init__(self):
        self.provider: FinnhubProvider = None
        self.active_subscriptions: Dict[str, Set[str]] = {}  # user_id -> set of tickers
        self._initialize_provider()

    def _initialize_provider(self):
        """Initialize the Finnhub market data provider."""
        self.provider = FinnhubProvider(api_key=settings.MARKET_DATA_API_KEY)
        logger.info("Initialized Finnhub provider")

    async def shutdown(self):
        """Shutdown the provider and cleanup resources."""
        if self.provider:
            await self.provider.disconnect()
            await self.provider.close_session()
            logger.info("StockStreamManager shut down")

    async def subscribe_user(self, user_id: str, tickers: List[str]):
        """Subscribe a user to ticker updates."""
        if user_id not in self.active_subscriptions:
            self.active_subscriptions[user_id] = set()

        new_tickers = set(tickers) - self.active_subscriptions[user_id]

        if new_tickers:
            await self.provider.subscribe(list(new_tickers))
            self.active_subscriptions[user_id].update(new_tickers)

    async def unsubscribe_user(self, user_id: str, tickers: Optional[List[str]] = None):
        """Unsubscribe a user from ticker updates."""
        if user_id not in self.active_subscriptions:
            return

        if tickers is None:
            tickers = list(self.active_subscriptions[user_id])

        await self.provider.unsubscribe(tickers)
        self.active_subscriptions[user_id].difference_update(tickers)

        if not self.active_subscriptions[user_id]:
            del self.active_subscriptions[user_id]

    async def get_quote(self, ticker: str) -> Optional[StockPrice]:
        """Get the latest quote for a ticker."""
        return await self.provider.get_latest_quote(ticker)


# Global instance
stock_stream_manager = StockStreamManager()
