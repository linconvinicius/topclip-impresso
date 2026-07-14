"""Database engine and session management for all 4 SQL Server databases."""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from contextlib import contextmanager
from typing import Generator

from app.core.config import settings


# --- Engines ---
engine_leitor = create_engine(settings.leitor_url, echo=settings.debug, pool_pre_ping=True)
engine_producao = create_engine(settings.producao_url, echo=settings.debug, pool_pre_ping=True)
engine_palavras = create_engine(settings.palavras_url, echo=settings.debug, pool_pre_ping=True)
engine_imagem = create_engine(settings.imagem_url, echo=settings.debug, pool_pre_ping=True)


# --- Session factories ---
SessionLeitor = sessionmaker(bind=engine_leitor)
SessionProducao = sessionmaker(bind=engine_producao)
SessionPalavras = sessionmaker(bind=engine_palavras)
SessionImagem = sessionmaker(bind=engine_imagem)


# --- Base for ORM models ---
class Base(DeclarativeBase):
    pass


# --- Context managers for safe session handling ---
@contextmanager
def get_leitor_session() -> Generator[Session, None, None]:
    session = SessionLeitor()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def get_producao_session() -> Generator[Session, None, None]:
    session = SessionProducao()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def get_palavras_session() -> Generator[Session, None, None]:
    session = SessionPalavras()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def get_imagem_session() -> Generator[Session, None, None]:
    session = SessionImagem()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# --- Dependency for FastAPI ---
def get_leitor_db() -> Generator[Session, None, None]:
    with get_leitor_session() as session:
        yield session


def get_producao_db() -> Generator[Session, None, None]:
    with get_producao_session() as session:
        yield session


def get_palavras_db() -> Generator[Session, None, None]:
    with get_palavras_session() as session:
        yield session


def get_imagem_db() -> Generator[Session, None, None]:
    with get_imagem_session() as session:
        yield session


def test_connections() -> dict[str, bool]:
    """Test connectivity to all 4 databases. Returns dict of db_name: success."""
    results = {}
    for name, engine in [
        ("TopClipLeitor", engine_leitor),
        ("TopClipPreProducao", engine_producao),
        ("TopClipPalavras", engine_palavras),
        ("TopClipImagem", engine_imagem),
    ]:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            results[name] = True
        except Exception as e:
            results[name] = False
    return results
