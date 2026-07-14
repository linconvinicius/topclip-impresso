import os
import sys
import pandas as pd

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine_producao
from sqlalchemy import text

# Map of legacy methods to new system enums
# Simple heuristic mapping
def guess_method(row_str):
    row_str = row_str.lower()
    if 'goread' in row_str: return 'GOREAD'
    if 'app globo' in row_str or 'globo mais' in row_str: return 'GLOBO_WEB'
    if 'clube de revista' in row_str: return 'CLUBE_REVISTA'
    if 'pressreader' in row_str or 'o globo' in row_str: return 'PRESSREADER'
    if 'f12' in row_str or 'devtools' in row_str: return 'F12_JPEG'
    if 'ftp' in row_str or 'info4' in row_str: return 'FTP_INFO4'
    if 'print' in row_str: return 'PRINT_MANUAL'
    return 'PDF_DIRECT' # Default

def insert_source(conn, name, media_type, method, url='', user='', pwd=''):
    q = """
    INSERT INTO Orquestrador_FontesMedia (name, media_type, download_method, url, login_user, login_password)
    VALUES (:name, :m_type, :method, :url, :user, :pwd)
    """
    conn.execute(text(q), {"name": name[:255], "m_type": media_type, "method": method, "url": url, "user": user, "pwd": pwd})

def import_excel(filepath, media_type):
    print(f"Reading {filepath} ({media_type})...")
    try:
        engine = 'odf' if filepath.endswith('.ods') else 'openpyxl'
        df = pd.read_excel(filepath, engine=engine)
        
        # Flatten everything to string for heuristic analysis
        df = df.astype(str).fillna('')
        
        with engine_producao.begin() as conn:
            for _, row in df.iterrows():
                row_vals = list(row)
                row_str = " | ".join(row_vals)
                
                # Assume column 0 is name, or find the first non-empty string as name
                name = row_vals[0] if len(row_vals) > 0 and row_vals[0].strip() else "Unknown"
                if name.lower() == 'nan' or name == 'Unknown': continue
                
                # Heuristics for missing fields based on row content
                method = guess_method(row_str)
                
                url = ""
                for v in row_vals:
                    if 'http' in v: url = v; break
                
                user = ""
                pwd = ""
                for v in row_vals:
                    if '@' in v: user = v
                if user:
                    # just try to guess password as the cell next to user or something similar
                    pass
                
                insert_source(conn, name, media_type, method, url, user, pwd)
        print(f"Inserted records from {filepath}")
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")

if __name__ == "__main__":
    files = [
        (r'c:\Projects\topclip-impresso\Lista revistas - Para Lincon - Minha lista - 03-03-26.xlsx', 'REVISTA'),
        (r'c:\Projects\topclip-impresso\Lista de jornais - para Lincom.xlsx', 'JORNAL'),
        (r'c:\Projects\topclip-impresso\Fábio TI RJ - DAVI REVISTAS.xlsx', 'REVISTA'),
        (r'c:\Projects\topclip-impresso\Fábio TI RJ - DAVI JORNAIS.ods', 'JORNAL'),
    ]
    
    for f, m_type in files:
        import_excel(f, m_type)
    
    print("FINISHED IMPORTING.")
