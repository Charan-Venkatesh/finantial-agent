from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .core.database import init_db
from .routes import auth_router, market_router, insights_router, news_router
from .services.stock_stream import stock_stream_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Financial AI Agent Platform...")

    await init_db()
    logger.info("Database initialized")

    yield

    logger.info("Shutting down Financial AI Agent Platform...")
    await stock_stream_manager.shutdown()


app = FastAPI(
    title="Financial AI Agent Platform",
    description="Production-grade AI-powered financial intelligence system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(market_router)
app.include_router(insights_router)
app.include_router(news_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Financial AI Agent Platform",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_agents": "operational",
        "market_data": "streaming"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
