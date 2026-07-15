"""
Exporta os dados de levantamento de junho 2026 para um arquivo JSON estático.
Rode: python export_static_data.py
O arquivo gerado vai para ../public/data/levantamento-2026-06.json
"""
import pyodbc
import json
import os
import calendar

LEITOR = "Driver={SQL Server};Server=TOPSQLCLUSTERN;Database=TopClipLeitor;UID=UserSystemTopclip;PWD=flopflip"

def exportar(ano: int, mes: int, destino: str):
    data_ini = f"{ano}-{mes:02d}-01"
    last_day = calendar.monthrange(ano, mes)[1]
    data_fim = f"{ano}-{mes:02d}-{last_day}"

    conn = pyodbc.connect(LEITOR, timeout=10)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            CAST(vp.VEPA_DT_DATA AS DATE)    AS data,
            v.VEIC_NM_VEICULO                AS veiculo,
            v.VEIC_IN_PERIODICIDADE          AS periodicidade,
            COUNT(vp.VEPA_CD_VEICULO_PAGINA) AS total_paginas
        FROM VEICULO_PAGINA vp
        JOIN TopClipPreProducao.dbo.Veiculo v
            ON vp.VEIC_CD_VEICULO = v.VEIC_CD_VEICULO
        WHERE vp.VEPA_DT_DATA >= ? AND vp.VEPA_DT_DATA <= ?
        GROUP BY
            CAST(vp.VEPA_DT_DATA AS DATE),
            v.VEIC_NM_VEICULO,
            v.VEIC_IN_PERIODICIDADE
        ORDER BY data, veiculo
    """, data_ini, data_fim)

    rows = cursor.fetchall()
    resultado = [
        {
            "data": str(r[0]),
            "veiculo": r[1],
            "tipo": "jornal" if r[2] == 1 else "revista",
            "total_paginas": r[3],
        }
        for r in rows
    ]

    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(f"Exportado {len(resultado)} registros para {destino}")
    conn.close()

if __name__ == "__main__":
    saida = os.path.join(
        os.path.dirname(__file__),
        "..", "public", "data", "levantamento-2026-06.json"
    )
    exportar(2026, 6, os.path.normpath(saida))
