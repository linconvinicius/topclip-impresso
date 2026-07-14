"""Core settings module — loads environment variables."""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database - weekday
    db_leitor_host: str = "TOPSQLCLUSTERN"
    db_leitor_name: str = "TopClipLeitor"
    db_producao_host: str = "TOPSQLCLUSTERN"
    db_producao_name: str = "TopClipPreProducao"
    db_palavras_host: str = "TOPSQLCLUSTERN"
    db_palavras_name: str = "TopClipPalavras"
    db_imagem_host: str = "TOPSQLCLUSTERN"
    db_imagem_name: str = "TopClipImagem"
    db_user: str = "UserSystemTopclip"
    db_password: str = "flopflip"

    # Database - weekend override
    db_fds_host: str = "TOPSQLCLUSTER"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # OCR
    tesseract_path: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    # Storage paths
    download_path: str = "./downloads"
    images_path: str = "./images"

    # FTP
    ftp_watch_dir: str = "./ftp_incoming"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def _is_weekend(self) -> bool:
        """Check if today is Saturday or Sunday."""
        from datetime import datetime
        return datetime.now().weekday() >= 5

    def get_db_host(self, base_host: str) -> str:
        """Return weekend host if it's a weekend, otherwise the base host."""
        if self._is_weekend():
            return self.db_fds_host
        return base_host

    def get_connection_string(self, db_name: str, host: str) -> str:
        """Build a SQLAlchemy connection string for SQL Server via pyodbc."""
        actual_host = self.get_db_host(host)
        driver = "SQL+Server"
        return (
            f"mssql+pyodbc://{self.db_user}:{self.db_password}"
            f"@{actual_host}/{db_name}"
            f"?driver={driver}&TrustServerCertificate=yes"
        )

    @property
    def leitor_url(self) -> str:
        # Force primary cluster for the queue as it usually doesn't exist on the weekend cluster
        driver = "SQL+Server"
        return (
            f"mssql+pyodbc://{self.db_user}:{self.db_password}"
            f"@{self.db_leitor_host}/{self.db_leitor_name}"
            f"?driver={driver}&TrustServerCertificate=yes"
        )

    @property
    def producao_url(self) -> str:
        return self.get_connection_string(self.db_producao_name, self.db_producao_host)

    @property
    def palavras_url(self) -> str:
        # Special case: TopClipPalavras seems to only exist on the main host (TOPSQLCLUSTERN) 
        # and not on the weekend cluster (TOPSQLCLUSTER).
        driver = "SQL+Server"
        return (
            f"mssql+pyodbc://{self.db_user}:{self.db_password}"
            f"@{self.db_palavras_host}/{self.db_palavras_name}"
            f"?driver={driver}&TrustServerCertificate=yes"
        )

    @property
    def imagem_url(self) -> str:
        return self.get_connection_string(self.db_imagem_name, self.db_imagem_host)


settings = Settings()
