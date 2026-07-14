"""FastAPI application — Levantamento Diario de Paginas."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.core.config import settings
from app.db.session import test_connections
from app.api.endpoints import levantamento


app = FastAPI(
    title="Levantamento Impresso API",
    description="API para levantamento diario de paginas de revistas e jornais.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(levantamento.router, prefix="/api/levantamento", tags=["levantamento"])


@app.get("/")
def read_root() -> Dict[str, str]:
    return {"message": "Levantamento Impresso API — OK"}


@app.get("/health", tags=["system"])
def health_check() -> Dict[str, Any]:
    db_status = test_connections()
    all_ok = all(db_status.values())
    return {
        "status": "healthy" if all_ok else "degraded",
        "databases": db_status,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.api_host, port=settings.api_port, reload=settings.debug)
