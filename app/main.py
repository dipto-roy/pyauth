"""
FastAPI Application Entry Point

Main application module that configures and creates the FastAPI app instance.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.protected import router as protected_router
from app.schemas import Message

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting PyAuth application...")
    yield
    # Shutdown
    logger.info("Shutting down PyAuth application...")


# Create FastAPI application
app = FastAPI(
    title="PyAuth API",
    description="FastAPI Authentication & Authorization API with JWT, SQLAlchemy, and PostgreSQL",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(protected_router)


@app.get(
    "/public",
    response_model=Message,
    tags=["Public"],
    summary="Public endpoint",
    description="A public endpoint that requires no authentication.",
)
async def public_endpoint() -> Message:
    """
    Public endpoint accessible without authentication.
    
    Returns:
        A simple welcome message
    """
    return Message(message="Welcome to PyAuth API! This is a public endpoint.")


@app.get(
    "/health",
    response_model=Message,
    tags=["Health"],
    summary="Health check",
    description="Health check endpoint for monitoring.",
)
async def health_check() -> Message:
    """
    Health check endpoint.
    
    Returns:
        Health status message
    """
    return Message(message="OK")
