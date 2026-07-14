from sqlalchemy import Column, Integer, String, Boolean, DateTime, Time, SmallInteger, Numeric, Float
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class Veiculo(Base):
    __tablename__ = "Veiculo"

    veic_cd_veiculo = Column("VEIC_CD_VEICULO", Integer, primary_key=True)
    edit_cd_editora = Column("EDIT_CD_EDITORA", SmallInteger)
    veic_nm_veiculo = Column("VEIC_NM_VEICULO", String(40))
    veic_tx_site = Column("VEIC_TX_SITE", String(80))
    # ... other columns omitted for brevity as we only need reading info ...

class VeiculoDownload(Base):
    __tablename__ = "Veiculo_Download"

    veic_cd_veiculo = Column("VEIC_CD_VEICULO", Integer, primary_key=True)
    vedo_cd_veiculo_download = Column("VEDO_CD_VEICULO_DOWNLOAD", Integer)
    vedo_in_tipo = Column("VEDO_IN_TIPO", SmallInteger)  # e.g., 1 for PDF, etc.
    vedo_in_status = Column("VEDO_IN_STATUS", Boolean)   # 1 = Ativo
    vedo_dt_ult_leitura = Column("VEDO_DT_ULT_LEITURA", DateTime)
    vedo_in_ult_edicao = Column("VEDO_IN_ULT_EDICAO", Integer)
    vedo_dt_busca_inicio = Column("VEDO_DT_BUSCA_INICIO", Time)
    vedo_tx_servidor = Column("VEDO_TX_SERVIDOR", String(100)) # e.g., "DownloadAutoPDF", url, etc
