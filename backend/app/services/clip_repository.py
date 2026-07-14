from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import Optional

class ClipRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_materia(self, veiculo_id: int, title: str, pub_date: datetime) -> int:
        """
        Inserts a new record into the Materia table and returns the generated ID.
        """
        query = text("""
            SET NOCOUNT ON;
            INSERT INTO Materia (
                MATE_DT_PUBLICACAO, 
                MATE_TX_TITULO, 
                VEIC_CD_VEICULO, 
                MATE_DT_CADASTRO, 
                MATE_IN_STATUS,
                MATE_IN_TIPO,
                COLA_CD_COLABORADOR_LEITOR,
                COLA_CD_COLABORADOR_CADASTRO
            )
            VALUES (:pub_date, :title, :veiculo_id, GETDATE(), 1, 1, 1, 1);
            SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
        """)
        
        result = self.db.execute(query, {
            "pub_date": pub_date,
            "title": title[:255], # Truncate if needed
            "veiculo_id": veiculo_id
        }).fetchone()
        
        if not result or result[0] is None:
            # Fallback if SCOPE_IDENTITY() fails somehow (e.g. trigger issues)
            # but usually SET NOCOUNT ON fixes it
            res = self.db.execute(text("SELECT CAST(IDENT_CURRENT('Materia') AS BIGINT)")).fetchone()
            materia_id = int(res[0])
        else:
            materia_id = int(result[0])
            
        self.db.commit()
        return materia_id

    def create_clip(self, materia_id: int, client_id: int, snippet: str):
        """
        Inserts a new record into the Materia_Cliente table.
        """
        query = text("""
            INSERT INTO Materia_Cliente (
                MATE_CD_MATERIA, 
                CLIE_CD_CLIENTE, 
                MACL_TX_RESUMO, 
                MACL_IN_APROVADA,
                MACL_IN_STATUS,
                MACL_IN_MATERIA_IMPRESSO
            )
            VALUES (:materia_id, :client_id, :snippet, 0, 1, 1)
        """)
        
        self.db.execute(query, {
            "materia_id": materia_id,
            "client_id": client_id,
            "snippet": snippet
        })
        self.db.commit()
