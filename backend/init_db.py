import os
import sys

# Add backend dir to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine_producao
from sqlalchemy import text

def init_db():
    print("Checking if Orquestrador_FontesMedia table exists in TopClipPreProducao...")
    
    check_sql = """
    SELECT 1 FROM sys.tables WHERE name = 'Orquestrador_FontesMedia'
    """
    
    create_sql = """
    CREATE TABLE Orquestrador_FontesMedia (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        media_type VARCHAR(50) NOT NULL,
        download_method VARCHAR(50) NOT NULL,
        url NVARCHAR(MAX) NULL,
        login_user NVARCHAR(255) NULL,
        login_password NVARCHAR(255) NULL,
        frequency NVARCHAR(100) NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME NULL
    );
    CREATE INDEX IX_Orquestrador_FontesMedia_name ON Orquestrador_FontesMedia(name);
    """
    
    try:
        with engine_producao.connect() as conn:
            exists = conn.execute(text(check_sql)).scalar()
            
        if exists:
            print("Table already exists. Skipping creation.")
        else:
            print("Table does not exist. Creating...")
            with engine_producao.begin() as conn:
                conn.execute(text(create_sql))
            print("SUCCESS! Table Orquestrador_FontesMedia created successfully.")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    init_db()
