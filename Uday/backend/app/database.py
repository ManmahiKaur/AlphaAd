from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import logging

logger = logging.getLogger("uvicorn")

def get_engine_args():
    db_url = settings.DATABASE_URL
    if not db_url:
        return settings.SQLITE_FALLBACK, {}

    # Handle Vercel/Neon connection string format for asyncpg
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    connect_args = {}
    # Neon PostgreSQL requires SSL
    if "neon.tech" in db_url:
        connect_args["ssl"] = "require"

    return db_url, connect_args

db_url, connect_args = get_engine_args()

try:
    engine = create_async_engine(db_url, echo=False, future=True, connect_args=connect_args)
except Exception as e:
    logger.warning(f"Failed to create engine with provided DATABASE_URL: {e}")
    engine = create_async_engine(settings.SQLITE_FALLBACK, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    pass

async def init_db():
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully with PostgreSQL.")
    except Exception as e:
        # If in production with a configured database, do not silently fallback to SQLite
        if settings.DATABASE_URL:
            logger.error(f"Production database connection failed: {e}")
            raise e
            
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite database.")
        engine = create_async_engine(settings.SQLITE_FALLBACK, echo=False, future=True)
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("SQLite database tables initialized successfully.")

    # Seed demo user and admin accounts
    try:
        from app.seed import seed_initial_data
        async with AsyncSessionLocal() as session:
            await seed_initial_data(session)
    except Exception as seed_err:
        logger.error(f"Seeding failed: {seed_err}")

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
