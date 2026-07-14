from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime

from app.models.leitor import VeiculoDownload, Veiculo

class QueueRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_pending_downloads(self) -> List[dict]:
        """
        Fetches download tasks from Veiculo_Download.
        """
        query = """
        SELECT vd.VEIC_CD_VEICULO, v.VEIC_NM_VEICULO, v.VEIC_TX_SITE, 
               vd.VEDO_IN_TIPO, vd.VEDO_DT_BUSCA_INICIO, vd.VEDO_TX_SERVIDOR,
               vd.VEDO_IN_STATUS, vd.VEDO_DT_ULT_LEITURA
        FROM Veiculo_Download vd
        JOIN TopClipPreProducao.dbo.Veiculo v ON vd.VEIC_CD_VEICULO = v.VEIC_CD_VEICULO
        ORDER BY vd.VEDO_DT_ULT_LEITURA DESC
        """
        
        result = self.db.execute(text(query)).fetchall()
        
        pending = []
        for row in result:
            status_val = row[6]
            status_str = "pending" if status_val is True or status_val == 1 else "completed"
            
            uploaded_at_str = ""
            if row[7]:
                if isinstance(row[7], str):
                    try:
                        from datetime import datetime as dt_class
                        clean_dt = row[7].split(".")[0]
                        parsed_dt = dt_class.strptime(clean_dt, "%Y-%m-%d %H:%M:%S")
                        uploaded_at_str = parsed_dt.strftime("%d/%m/%Y %H:%M")
                    except Exception:
                        uploaded_at_str = row[7]
                elif hasattr(row[7], "strftime"):
                    uploaded_at_str = row[7].strftime("%d/%m/%Y %H:%M")
                else:
                    uploaded_at_str = str(row[7])
                
            pending.append({
                "id": row[0],
                "veiculo_id": row[0],
                "name": row[1],
                "original_filename": row[1],
                "url": row[2] if row[2] else "",
                "download_type": row[3],
                "start_time": str(row[4]) if row[4] else None,
                "server": row[5] if row[5] else "",
                "status": status_str,
                "uploaded_at": uploaded_at_str
            })
            
        return pending

    def get_ftp_credentials(self, veiculo_id: int) -> Optional[dict]:
        """
        Fetches FTP credentials from the VEICULO_FTP table for a specific vehicle.
        """
        query = """
        SELECT VEFT_TX_URL, VEFT_TX_USUSARIO, VEFT_TX_SENHA, VEFT_NM_DIRETORIO
        FROM VEICULO_FTP
        WHERE VEIC_CD_VEICULO = :veiculo_id AND VEFT_IN_STATUS = 1
        """
        result = self.db.execute(text(query), {"veiculo_id": veiculo_id}).fetchone()
        if result:
            return {
                "host": result[0],
                "user": result[1],
                "password": result[2],
                "directory": result[3]
            }
        return None

    def update_task_status(self, veiculo_id: int, status: int):
        """
        Updates the status of a download task in Veiculo_Download.
        1: Pending, 2: Done, 3: Error
        """
        query = text("""
            UPDATE Veiculo_Download
            SET VEDO_IN_STATUS = :status,
                VEDO_DT_ULT_LEITURA = GETDATE()
            WHERE VEIC_CD_VEICULO = :veiculo_id
        """)
        self.db.execute(query, {"status": status, "veiculo_id": veiculo_id})
        self.db.commit()
