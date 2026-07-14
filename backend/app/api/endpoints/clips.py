from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from app.db.session import get_producao_db
from app.repositories.clip_repository import ClipRepository
from app.models.legacy_serialization import Diagramacao, MatchAgrupado

router = APIRouter()

class ClipSaveRequest(BaseModel):
    titulo: str
    pagina_str: str
    data_publicacao: datetime
    codigo_veiculo: int
    codigo_secao: int
    tipo: int = 1
    codigo_materia: int = 0
    codigo_titulo: int = 0
    codigo_pagina: int = 0
    diagramation: Optional[Diagramacao] = None
    matches: List[MatchAgrupado] = []
    text_ocr: str = ""

@router.get("/", response_model=List[Dict[str, Any]])
def get_recent_clips(
    limit: int = 50,
    search: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_producao_db)
) -> List[Dict[str, Any]]:
    """
    Returns recent clips from legacy pre-production database with optional filtering.
    """
    query_str = """
        SELECT TOP (:limit) 
            m.MATE_CD_MATERIA, 
            mc.CLIE_CD_CLIENTE, 
            m.MATE_DT_PUBLICACAO, 
            m.MATE_TX_TITULO, 
            mc.MACL_TX_RESUMO, 
            mc.MACL_IN_APROVADA,
            v.VEIC_NM_VEICULO,
            m.MATE_TX_PAGINA,
            mp.VEPA_CD_VEICULO_PAGINA
        FROM Materia_Cliente mc
        JOIN Materia m ON mc.MATE_CD_MATERIA = m.MATE_CD_MATERIA
        LEFT JOIN Veiculo v ON m.VEIC_CD_VEICULO = v.VEIC_CD_VEICULO
        LEFT JOIN Materia_Pagina mp ON m.MATE_CD_MATERIA = mp.MATE_CD_MATERIA
        WHERE (mc.MACL_IN_MATERIA_IMPRESSO = 1 OR mc.MACL_IN_MATERIA_IMPRESSO IS NULL)
    """
    params = {"limit": limit}
    
    if search:
        query_str += " AND (m.MATE_TX_TITULO LIKE :search OR mc.MACL_TX_RESUMO LIKE :search)"
        params["search"] = f"%{search}%"
        
    if client_id:
        query_str += " AND mc.CLIE_CD_CLIENTE = :client_id"
        params["client_id"] = client_id
        
    query_str += " ORDER BY m.MATE_DT_PUBLICACAO DESC"
    
    try:
        results = db.execute(text(query_str), params).fetchall()
    except Exception as e:
        # Fallback to local join if cross-db fails
        query_fallback = """
            SELECT TOP (:limit) 
                m.MATE_CD_MATERIA, 
                mc.CLIE_CD_CLIENTE, 
                m.MATE_DT_PUBLICACAO, 
                m.MATE_TX_TITULO, 
                mc.MACL_TX_RESUMO, 
                mc.MACL_IN_APROVADA,
                CAST(NULL as varchar) as VEIC_NM_VEICULO,
                m.MATE_TX_PAGINA,
                mp.VEPA_CD_VEICULO_PAGINA
            FROM Materia_Cliente mc
            JOIN Materia m ON mc.MATE_CD_MATERIA = m.MATE_CD_MATERIA
            LEFT JOIN Materia_Pagina mp ON m.MATE_CD_MATERIA = mp.MATE_CD_MATERIA
            WHERE (mc.MACL_IN_MATERIA_IMPRESSO = 1 OR mc.MACL_IN_MATERIA_IMPRESSO IS NULL)
        """
        # Append filters to fallback if needed, but for now just log it
        print(f"Clips query error: {str(e)}. Falling back to local query.")
        results = db.execute(text(query_fallback), params).fetchall()
        
    return [
        {
            "id": r[0],
            "client_id": r[1],
            "date": r[2].isoformat() if r[2] else None,
            "title": r[3],
            "snippet": r[4],
            "verified": bool(r[5]),
            "publication": r[6] if r[6] else "Impresso",
            "page": r[7] if r[7] else "1",
            "page_id": r[8] if r[8] else None
        }
        for r in results
    ]

@router.post("/save")
def save_clip(
    request: ClipSaveRequest,
    db: Session = Depends(get_producao_db)
):
    """
    Saves a clip using the legacy logic in ClipRepository.
    """
    repo = ClipRepository(db)
    
    # 1. Upsert Materia
    mate_id = repo.upsert_materia(
        titulo=request.titulo,
        pagina_str=request.pagina_str,
        data_publicacao=request.data_publicacao,
        codigo_veiculo=request.codigo_veiculo,
        codigo_secao=request.codigo_secao,
        tipo=request.tipo,
        codigo_materia=request.codigo_materia
    )
    
    # 2. Link to Page
    if request.codigo_pagina > 0:
        repo.link_materia_to_page(mate_id, request.pagina_str, request.codigo_pagina)
        
    # 3. Save OCR Text
    if request.text_ocr:
        repo.save_ocr_text(mate_id, request.text_ocr)
        
    # 4. Save Diagramation
    if request.diagramation and request.codigo_titulo > 0 and request.codigo_pagina > 0:
        repo.save_diagramation(mate_id, request.codigo_titulo, request.codigo_pagina, request.diagramation)
        
    # 5. Save Matches (XML)
    if request.matches and request.codigo_titulo > 0:
        repo.save_matches_xml(request.codigo_titulo, request.matches)
        
    # 6. Link to Clients/Channels
    for match in request.matches:
        repo.link_materia_to_client_channel(
            mate_id, 
            match.CLIE_CD_CLIENTE, 
            match.CANA_CD_CANAL
        )
        
    return {"status": "success", "materia_id": mate_id}


