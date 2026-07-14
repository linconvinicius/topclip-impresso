from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, Text
from sqlalchemy.sql import func
import enum
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class DownloadMethod(str, enum.Enum):
    PDF_DIRECT = "PDF_DIRECT"
    F12_JPEG = "F12_JPEG"
    GOREAD = "GOREAD"
    GLOBO_WEB = "GLOBO_WEB"
    CLUBE_REVISTA = "CLUBE_REVISTA"
    FTP_INFO4 = "FTP_INFO4"
    PRINT_MANUAL = "PRINT_MANUAL"

class MediaType(str, enum.Enum):
    REVISTA = "REVISTA"
    JORNAL = "JORNAL"

class MediaSource(Base):
    __tablename__ = "Orquestrador_FontesMedia"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    media_type = Column(Enum(MediaType), nullable=False)
    download_method = Column(Enum(DownloadMethod), nullable=False)
    
    # Connection / Access info
    url = Column(Text, nullable=True)
    login_user = Column(String(255), nullable=True)
    login_password = Column(String(255), nullable=True)
    
    # Metadata
    frequency = Column(String(100), nullable=True) # e.g., "Diário", "Semanal", "Mensal"
    is_active = Column(Boolean, default=True)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
