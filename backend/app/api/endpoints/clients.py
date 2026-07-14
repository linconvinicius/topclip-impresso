from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from app.db.session import get_palavras_db

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_clients(db: Session = Depends(get_palavras_db)) -> List[Dict[str, Any]]:
    """
    Returns active clients from TopClipPalavras.
    """
    query = text("""
        SELECT DISTINCT CLIE_CD_CLIENTE, cliente
        FROM VW_Cliente_Canal_Palavra_Impresso
        ORDER BY cliente
    """)
    results = db.execute(query).fetchall()
    return [{"id": r[0], "name": r[1]} for r in results]
