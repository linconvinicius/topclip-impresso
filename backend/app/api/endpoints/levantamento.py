from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
import calendar

from app.db.session import get_leitor_db

router = APIRouter()


def _build_levantamento(db: Session, ano: int, mes: int) -> List[Dict[str, Any]]:
    """
    Extrai total de paginas por veiculo/dia a partir de VEICULO_PAGINA (TopClipLeitor).
    Cada linha da tabela representa uma pagina digitalizada.
    Nome do veiculo vem via join cross-db com TopClipPreProducao.dbo.Veiculo.
    """
    data_ini = f"{ano}-{mes:02d}-01"
    last_day = calendar.monthrange(ano, mes)[1]
    data_fim = f"{ano}-{mes:02d}-{last_day}"

    # --- Estrategia principal: VEICULO_PAGINA + join cross-db ---
    query_main = text("""
        SELECT
            CAST(vp.VEPA_DT_DATA AS DATE)    AS data,
            v.VEIC_NM_VEICULO                AS veiculo,
            v.VEIC_IN_PERIODICIDADE          AS periodicidade,
            COUNT(vp.VEPA_CD_VEICULO_PAGINA) AS total_paginas
        FROM VEICULO_PAGINA vp
        JOIN TopClipPreProducao.dbo.Veiculo v
            ON vp.VEIC_CD_VEICULO = v.VEIC_CD_VEICULO
        WHERE vp.VEPA_DT_DATA >= :ini
          AND vp.VEPA_DT_DATA <  DATEADD(day, 1, CONVERT(date, :fim))
        GROUP BY
            CAST(vp.VEPA_DT_DATA AS DATE),
            v.VEIC_NM_VEICULO,
            v.VEIC_IN_PERIODICIDADE
        ORDER BY data, veiculo
    """)

    try:
        rows = db.execute(query_main, {"ini": data_ini, "fim": data_fim}).fetchall()
        return [
            {
                "data": str(r[0]),
                "veiculo": r[1],
                # VEIC_IN_PERIODICIDADE: 1=Diário(jornal), outros=revista
                "tipo": "jornal" if r[2] == 1 else "revista",
                "total_paginas": r[3],
            }
            for r in rows
        ]
    except Exception as e_main:
        print(f"[levantamento] query principal falhou: {e_main}")

    # --- Fallback: sem nome do veiculo ---
    query_fallback = text("""
        SELECT
            CAST(vp.VEPA_DT_DATA AS DATE)    AS data,
            CAST(vp.VEIC_CD_VEICULO AS varchar) AS veiculo,
            'revista'                           AS tipo,
            COUNT(vp.VEPA_CD_VEICULO_PAGINA)   AS total_paginas
        FROM VEICULO_PAGINA vp
        WHERE vp.VEPA_DT_DATA >= :ini
          AND vp.VEPA_DT_DATA <  DATEADD(day, 1, CONVERT(date, :fim))
        GROUP BY
            CAST(vp.VEPA_DT_DATA AS DATE),
            vp.VEIC_CD_VEICULO
        ORDER BY data, veiculo
    """)

    try:
        rows = db.execute(query_fallback, {"ini": data_ini, "fim": data_fim}).fetchall()
        return [
            {
                "data": str(r[0]),
                "veiculo": r[1],
                "tipo": r[2],
                "total_paginas": r[3],
            }
            for r in rows
        ]
    except Exception as e_fb:
        print(f"[levantamento] fallback tambem falhou: {e_fb}")
        return []


@router.get("/", response_model=List[Dict[str, Any]])
def get_levantamento(
    mes: str = Query(default="2026-06", description="Mes no formato YYYY-MM"),
    db: Session = Depends(get_leitor_db),
) -> List[Dict[str, Any]]:
    """
    Retorna total de paginas por veiculo por dia para o mes informado.
    Cada registro: { data, veiculo, tipo, total_paginas }
    Exemplo: GET /api/levantamento/?mes=2026-06
    """
    try:
        parts = mes.split("-")
        ano, m = int(parts[0]), int(parts[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Formato invalido. Use YYYY-MM.")

    return _build_levantamento(db, ano, m)


@router.get("/schema")
def explorar_schema(db: Session = Depends(get_leitor_db)) -> Dict[str, Any]:
    """Endpoint auxiliar: inspeciona colunas das tabelas relevantes."""
    result = {}

    # VEICULO_PAGINA no Leitor
    try:
        q = text("""
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'VEICULO_PAGINA'
            ORDER BY ORDINAL_POSITION
        """)
        rows = db.execute(q).fetchall()
        result["VEICULO_PAGINA (Leitor)"] = [{"coluna": r[0], "tipo": r[1]} for r in rows]
    except Exception as e:
        result["VEICULO_PAGINA (Leitor)"] = {"erro": str(e)}

    # Veiculo no PreProducao (cross-db)
    try:
        q2 = text("""
            SELECT COLUMN_NAME, DATA_TYPE
            FROM TopClipPreProducao.INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Veiculo'
            ORDER BY ORDINAL_POSITION
        """)
        rows2 = db.execute(q2).fetchall()
        result["Veiculo (PreProducao)"] = [{"coluna": r[0], "tipo": r[1]} for r in rows2]
    except Exception as e:
        result["Veiculo (PreProducao)"] = {"erro": str(e)}

    return result
