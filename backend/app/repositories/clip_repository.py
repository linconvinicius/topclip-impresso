from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from app.models.legacy_serialization import Diagramacao, MatchAgrupado, serialize_matches_to_xml, RectangleF
import json
import re

class ClipRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert_materia(
        self,
        titulo: str,
        pagina_str: str,
        data_publicacao: datetime,
        codigo_veiculo: int,
        codigo_secao: int,
        tipo: int = 1,  # 0: Imagem, 1: Texto
        codigo_materia: int = 0
    ) -> int:
        """
        Translated from DadosMateria.GravaMateriaImpresso
        """
        # Truncate page string to 30 chars as per legacy
        safe_pagina = (pagina_str[:29] if len(pagina_str) > 30 else pagina_str).strip()

        if codigo_materia == 0:
            # Insert
            query = text("""
                INSERT INTO TOPCLIPPREPRODUCAO.DBO.MATERIA (
                    MATE_DT_PUBLICACAO, MATE_TX_TITULO, MATE_TX_PAGINA, 
                    VEIC_CD_VEICULO, SECA_CD_SECAO, MATE_IN_TIPO, 
                    MATE_DT_CADASTRO, MATE_IN_PAR_IMPAR, MATE_QN_ARQUIVOS_VINCULADOS, 
                    MATE_IN_STATUS, MATE_TX_NOME_IMAGEM
                ) VALUES (
                    :data, :titulo, :pagina, :veiculo, :secao, :tipo,
                    GETDATE(), 2, 2, 2, 'STREAM'
                );
                SELECT SCOPE_IDENTITY();
            """)
            result = self.db.execute(query, {
                "data": data_publicacao.date(),
                "titulo": titulo,
                "pagina": safe_pagina,
                "veiculo": codigo_veiculo,
                "secao": codigo_secao,
                "tipo": tipo
            })
            new_id = int(result.fetchone()[0])
            self.db.commit()
            return new_id
        else:
            # Update
            query = text("""
                UPDATE TOPCLIPPREPRODUCAO.DBO.MATERIA SET
                    MATE_DT_PUBLICACAO = :data,
                    MATE_TX_TITULO = :titulo,
                    MATE_TX_PAGINA = :pagina,
                    MATE_IN_STATUS = 2,
                    VEIC_CD_VEICULO = :veiculo,
                    SECA_CD_SECAO = :secao,
                    MATE_IN_TIPO = :tipo
                WHERE MATE_CD_MATERIA = :id
            """)
            self.db.execute(query, {
                "data": data_publicacao.date(),
                "titulo": titulo,
                "pagina": safe_pagina,
                "veiculo": codigo_veiculo,
                "secao": codigo_secao,
                "tipo": tipo,
                "id": codigo_materia
            })
            self.db.commit()
            return codigo_materia

    def link_materia_to_page(self, codigo_materia: int, num_pagina: str, codigo_veiculo_pagina: int):
        """
        Translated from DadosMateria.InsertPaginaMateria
        """
        query = text("""
            INSERT INTO TOPCLIPPREPRODUCAO.DBO.MATERIA_PAGINA (
                MATE_CD_MATERIA, VEPA_TX_PAGINA, VEPA_CD_VEICULO_PAGINA
            ) VALUES (:mate, :pag, :vepa)
        """)
        self.db.execute(query, {
            "mate": codigo_materia,
            "pag": num_pagina,
            "vepa": codigo_veiculo_pagina
        })
        self.db.commit()

    def link_materia_to_client_channel(
        self, 
        codigo_materia: int, 
        codigo_cliente: int, 
        codigo_canal: int,
        ordem: int = 0
    ):
        """
        Translated from DadosMateria.InsertMateriaClienteCanal and InsertMateriaCliente
        """
        # Ensure Materia_Cliente exists first
        check_client = text("SELECT COUNT(*) FROM TOPCLIPPREPRODUCAO.DBO.MATERIA_CLIENTE WHERE MATE_CD_MATERIA = :mate AND CLIE_CD_CLIENTE = :clie")
        exists = self.db.execute(check_client, {"mate": codigo_materia, "clie": codigo_cliente}).scalar()
        
        if not exists:
            # Note: CLSC_NR_SERVICO_CONTRATADO is often hardcoded or looked up. Legacy used a passed parameter.
            # We'll default to a common value if unknown, or better yet, look up a default for the client.
            insert_client = text("""
                INSERT INTO TOPCLIPPREPRODUCAO.DBO.MATERIA_CLIENTE (
                    CLIE_CD_CLIENTE, MATE_CD_MATERIA, CLSC_NR_SERVICO_CONTRATADO
                ) VALUES (:clie, :mate, 1)
            """)
            self.db.execute(insert_client, {"clie": codigo_cliente, "mate": codigo_materia})

        # Insert into Virtual Canal table
        insert_virtual = text("""
            IF NOT EXISTS (SELECT 1 FROM TOPCLIPPREPRODUCAO.DBO.Materia_Cliente_Canal_Virtual 
                           WHERE MATE_CD_MATERIA = :mate AND CLIE_CD_CLIENTE = :clie AND CANA_CD_CANAL = :cana)
            BEGIN
                INSERT INTO TOPCLIPPREPRODUCAO.DBO.Materia_Cliente_Canal_Virtual (
                    MATE_CD_MATERIA, CLIE_CD_CLIENTE, CANA_CD_CANAL,
                    MCCV_DT_CADASTRO, MCCV_IN_ORDEM, MCCV_IN_ORDEM_VEICULO,
                    MCCV_IN_GESTAO, MCCV_IN_STATUS
                ) VALUES (
                    :mate, :clie, :cana, GETDATE(), 0, :ordem, 0, 0
                )
            END
        """)
        self.db.execute(insert_virtual, {
            "mate": codigo_materia,
            "clie": codigo_cliente,
            "cana": codigo_canal,
            "ordem": ordem
        })
        self.db.commit()

    def save_ocr_text(self, codigo_materia: int, text_content: str):
        """
        Translated from DadosMateria.SetRegiaoTextoMateria logic
        """
        # Ensure Materia_Adjacente exists
        check_adj = text("SELECT COUNT(*) FROM TOPCLIPPREPRODUCAO.DBO.MATERIA_ADJACENTE WHERE MATE_CD_MATERIA = :mate")
        exists = self.db.execute(check_adj, {"mate": codigo_materia}).scalar()
        
        if not exists:
            insert_adj = text("INSERT INTO TOPCLIPPREPRODUCAO.DBO.MATERIA_ADJACENTE (MATE_CD_MATERIA) VALUES (:mate)")
            self.db.execute(insert_adj, {"mate": codigo_materia})
            
        update_adj = text("""
            UPDATE TOPCLIPPREPRODUCAO.DBO.MATERIA_ADJACENTE SET
                MAAD_TX_TEXTOOCR = :txt,
                MAAD_IN_OCR = 2
            WHERE MATE_CD_MATERIA = :mate
        """)
        self.db.execute(update_adj, {"mate": codigo_materia, "txt": text_content})
        self.db.commit()

    def save_diagramation(self, codigo_materia: int, codigo_titulo: int, codigo_pagina: int, diagram: Diagramacao):
        """
        Translated from DadosLeitura.VeiculoTituloEstrutura
        """
        # Current SisClip standard is JSON
        json_data = diagram.model_dump_json(by_alias=True)
        
        # Check if record exists in VEICULO_MATERIA_ESTRUTURA
        check_struct = text("""
            SELECT COUNT(*) FROM VEICULO_MATERIA_ESTRUTURA 
            WHERE VETI_CD_VEICULO_TITULO = :tit AND VEPA_CD_VEICULO_PAGINA = :pag
        """)
        exists = self.db.execute(check_struct, {"tit": codigo_titulo, "pag": codigo_pagina}).scalar()
        
        if exists:
            update_struct = text("""
                UPDATE VEICULO_MATERIA_ESTRUTURA SET
                    MATE_CD_MATERIA = :mate,
                    VEME_BI_ESTRUTURA = CAST(:json as varbinary(max)),
                    VETI_IN_JSON = 1
                WHERE VETI_CD_VEICULO_TITULO = :tit AND VEPA_CD_VEICULO_PAGINA = :pag
            """)
            self.db.execute(update_struct, {
                "mate": codigo_materia,
                "json": json_data,
                "tit": codigo_titulo,
                "pag": codigo_pagina
            })
        else:
            insert_struct = text("""
                INSERT INTO VEICULO_MATERIA_ESTRUTURA (
                    VEPA_CD_VEICULO_PAGINA, VETI_CD_VEICULO_TITULO, MATE_CD_MATERIA,
                    VETI_IN_JSON, VEME_BI_ESTRUTURA
                ) VALUES (
                    :pag, :tit, :mate, 1, CAST(:json as varbinary(max))
                )
            """)
            self.db.execute(insert_struct, {
                "mate": codigo_materia,
                "json": json_data,
                "tit": codigo_titulo,
                "pag": codigo_pagina
            })
        self.db.commit()

    def save_matches_xml(self, codigo_titulo: int, matches: List[MatchAgrupado]):
        """
        Translated from DadosLeitura.SetVeiculoMateriaTitulo (the XML part)
        Saves to Veiculo_Materia_Titulo.VEMT_BI_CANAL_CLIENTE
        """
        xml_data = serialize_matches_to_xml(matches)
        
        query = text("""
            UPDATE Veiculo_Materia_Titulo SET
                VEMT_BI_CANAL_CLIENTE = CAST(:xml as varbinary(max))
            WHERE VETI_CD_VEICULO_TITULO = :tit
        """)
        self.db.execute(query, {"xml": xml_data, "tit": codigo_titulo})
        self.db.commit()

    @staticmethod
    def format_page_string(pages: List[str]) -> str:
        """
        Implementation of the legacy MakeStringLimitado logic.
        Sorts pages and creates ranges (e.g., ["01", "02", "03", "05"] -> "01 a 03/05")
        """
        if not pages:
            return ""
        
        # Helper to convert page string to comparable int
        def page_to_int(p):
            if p.upper() == "CAPA": return -100 # Far away from numeric pages
            nums = re.findall(r'\d+', p)
            return int(nums[0]) if nums else 999

        sorted_pages = sorted(list(set(pages)), key=page_to_int)
        
        if len(sorted_pages) == 1:
            return sorted_pages[0]

        result = []
        i = 0
        while i < len(sorted_pages):
            start = i
            while i + 1 < len(sorted_pages):
                curr_val = page_to_int(sorted_pages[i])
                next_val = page_to_int(sorted_pages[i+1])
                # Check if sequential. Note: "CAPA" is 0, so "01" (1) is sequential to Capa.
                if curr_val + 1 == next_val:
                    i += 1
                else:
                    break
            
            if i > start:
                result.append(f"{sorted_pages[start]} a {sorted_pages[i]}")
            else:
                result.append(sorted_pages[start])
            i += 1
            
        return "/".join(result)

    def snapping_logic(self, rect: RectangleF, page_id: int) -> RectangleF:
        """
        Translated from DadosCapturaTitulos.Reajuste
        Tightens the clipping area based on actual OCR blocks found inside the rectangle.
        """
        # Query OCR blocks within the rectangle
        query = text("""
            SELECT VPRO_IN_REGIAO_X, VPRO_IN_REGIAO_Y, VPRO_IN_REGIAO_W, VPRO_IN_REGIAO_H
            FROM VEICULO_PAGINA_REGIAO_OCR
            WHERE VEPA_CD_VEICULO_PAGINA = :pag
              AND VPRO_IN_REGIAO_X >= :x1 AND VPRO_IN_REGIAO_X < :x2
              AND VPRO_IN_REGIAO_Y >= :y1 AND VPRO_IN_REGIAO_Y < :y2
        """)
        results = self.db.execute(query, {
            "pag": page_id,
            "x1": rect.X,
            "x2": rect.X + rect.Width,
            "y1": rect.Y,
            "y2": rect.Y + rect.Height
        }).fetchall()

        if not results or len(results) < 5:
            return rect

        # Calculate bounding box of OCR hits
        min_x = min(r[0] for r in results)
        max_r = max(r[0] + r[2] for r in results)
        min_y = min(r[1] for r in results)
        max_b = max(r[1] + r[3] for r in results)

        return RectangleF(
            X=min_x,
            Y=min_y,
            Width=max_r - min_x,
            Height=max_b - min_y
        )
