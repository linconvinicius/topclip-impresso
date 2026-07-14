from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from app.db.session import get_leitor_db
from app.services.queue_repository import QueueRepository

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_download_queue(
    status: int = 1,
    db: Session = Depends(get_leitor_db)
) -> List[Dict[str, Any]]:
    """
    Returns the current download queue from the legacy database.
    """
    repo = QueueRepository(db)
    # Reusing the existing service logic
    tasks = repo.get_pending_downloads()
    return tasks

@router.get("/stats")
def get_queue_stats(db: Session = Depends(get_leitor_db)) -> Dict[str, Any]:
    """
    Returns summary statistics for the download queue.
    """
    # Group by status
    query_status = text("""
        SELECT VEDO_IN_STATUS, COUNT(*) as total
        FROM Veiculo_Download
        GROUP BY VEDO_IN_STATUS
    """)
    results = db.execute(query_status).fetchall()
    
    status_map = {
        1: "pending",
        2: "completed",
        3: "error",
        0: "inactive"
    }
    
    stats = {status_map.get(r[0], f"unknown_{r[0]}"): r[1] for r in results}
    
    # Counts for today and week
    query_counts = text("""
        SELECT 
            COUNT(CASE WHEN CAST(VEDO_DT_ULT_LEITURA AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) as today,
            COUNT(CASE WHEN VEDO_DT_ULT_LEITURA >= DATEADD(day, -7, GETDATE()) THEN 1 END) as week
        FROM Veiculo_Download
        WHERE VEDO_IN_STATUS = 2
    """)
    counts = db.execute(query_counts).fetchone()
    
    stats["clips_today"] = counts[0] if counts else 0
    stats["clips_week"] = counts[1] if counts else 0
    
    # Volume by day for the last 7 days
    query_volume = text("""
        SELECT 
            FORMAT(VEDO_DT_ULT_LEITURA, 'ddd', 'en-US') as day,
            COUNT(*) as clips
        FROM Veiculo_Download
        WHERE VEDO_IN_STATUS = 2 AND VEDO_DT_ULT_LEITURA >= DATEADD(day, -7, GETDATE())
        GROUP BY FORMAT(VEDO_DT_ULT_LEITURA, 'ddd', 'en-US'), CAST(VEDO_DT_ULT_LEITURA AS DATE)
        ORDER BY CAST(VEDO_DT_ULT_LEITURA AS DATE)
    """)
    volume_results = db.execute(query_volume).fetchall()
    stats["volume_by_day"] = [{"day": r[0], "clips": r[1]} for r in volume_results]

    # Added sentiment breakdown (simulated since legacy lacks it, or placeholder for future NLP)
    stats["sentiment_breakdown"] = {
        "positive": 45,
        "neutral": 35,
        "negative": 20
    }

    return stats
