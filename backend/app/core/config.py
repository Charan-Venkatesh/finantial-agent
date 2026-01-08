from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path
import os


# Get the project root directory (3 levels up from this file)
ROOT_DIR = Path(__file__).parent.parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""

    # Database (optional for testing with mock data)
    DATABASE_URL: Optional[str] = "sqlite+aiosqlite:///./test.db"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API Keys
    GEMINI_API_KEY: str
    MARKET_DATA_API_KEY: str  # Finnhub API Key
    NEWS_API_KEY: str

    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:8501"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:8501", 
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://frontend-react",
        "http://frontend-react:80"
    ]

    class Config:
        env_file = str(ENV_FILE)
        case_sensitive = True


settings = Settings()

# Set GOOGLE_API_KEY environment variable for Google Generativeai library
# This is required because google.generativeai checks os.environ directly
os.environ['GOOGLE_API_KEY'] = settings.GEMINI_API_KEY
