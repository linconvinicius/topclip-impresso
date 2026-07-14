from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_leitor_db, get_imagem_db
import io

router = APIRouter()

@router.get("/page/{page_id}")
async def get_page_image(page_id: int, db: Session = Depends(get_leitor_db)):
    """
    Streams the original page scan image from TopClipLeitor.
    """
    query = text("SELECT VEPA_BI_PAGINA FROM VEICULO_PAGINA WHERE VEPA_CD_VEICULO_PAGINA = :page_id")
    result = db.execute(query, {"page_id": page_id}).fetchone()
    
    if not result or not result[0]:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return Response(content=result[0], media_type="image/jpeg")

@router.get("/clip/{clip_id}")
async def get_clip_image(clip_id: int, db: Session = Depends(get_imagem_db)):
    """
    Streams the result clip image from TopClipImagem.
    """
    query = text("SELECT VEIM_BI_IMAGE FROM Veiculo_Imagem WHERE MATE_CD_MATERIA = :clip_id")
    result = db.execute(query, {"clip_id": clip_id}).fetchone()
    
    if not result or not result[0]:
        # Try finding by clip_id if MATE_CD_MATERIA is not direct (some legacy mappings differ)
        raise HTTPException(status_code=404, detail="Clip image not found")
        
    return Response(content=result[0], media_type="image/jpeg")
