from typing import List, Optional
from pydantic import BaseModel, Field
import xml.etree.ElementTree as ET
import io

class RectangleF(BaseModel):
    X: float
    Y: float
    Width: float
    Height: float

    @property
    def Right(self) -> float:
        return self.X + self.Width

    @property
    def Bottom(self) -> float:
        return self.Y + self.Height

class PalavraTitulo(BaseModel):
    Codigo: int = 0
    Texto: str = ""
    Pagina: int = 0
    Materia: RectangleF = Field(default_factory=lambda: RectangleF(X=0, Y=0, Width=0, Height=0))
    Limite: RectangleF = Field(default_factory=lambda: RectangleF(X=0, Y=0, Width=0, Height=0))
    Valido: bool = False

class Diagramacao(BaseModel):
    Texto: str = ""
    CodigoTitulo: int = 0
    Materia: RectangleF = Field(default_factory=lambda: RectangleF(X=0, Y=0, Width=0, Height=0))
    Titulo: RectangleF = Field(default_factory=lambda: RectangleF(X=0, Y=0, Width=0, Height=0))
    Colunas: List[RectangleF] = Field(default_factory=list)
    Imagens: List[RectangleF] = Field(default_factory=list)
    Palavras: List[PalavraTitulo] = Field(default_factory=list)
    Notas: List[RectangleF] = Field(default_factory=list)

class MatchAgrupado(BaseModel):
    CLIE_CD_CLIENTE: int
    CANA_CD_CANAL: int
    PACH_CD_PALAVRA_CHAVE: int
    CLIE_NM_CLIENTE: str
    CANA_NM_CANAL: str
    PACH_NM_PALAVRA: str
    AREA_PALAVRA: List[RectangleF] = Field(default_factory=list)
    Setor: str = "Não"
    Selecionado: bool = False
    Exibir: bool = True

def serialize_matches_to_xml(matches: List[MatchAgrupado]) -> str:
    """
    Serializes a list of MatchAgrupado to XML matching the legacy C# XmlSerializer format.
    """
    root = ET.Element("ArrayOfVEICULO_PAGINA_REGIAO_CLIENTE_AGRUPADO")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xmlns:xsd", "http://www.w3.org/2001/XMLSchema")

    for match in matches:
        item = ET.SubElement(root, "VEICULO_PAGINA_REGIAO_CLIENTE_AGRUPADO")
        ET.SubElement(item, "CLIE_CD_CLIENTE").text = str(match.CLIE_CD_CLIENTE)
        ET.SubElement(item, "CANA_CD_CANAL").text = str(match.CANA_CD_CANAL)
        ET.SubElement(item, "PACH_CD_PALAVRA_CHAVE").text = str(match.PACH_CD_PALAVRA_CHAVE)
        ET.SubElement(item, "CLIE_NM_CLIENTE").text = match.CLIE_NM_CLIENTE
        ET.SubElement(item, "CANA_NM_CANAL").text = match.CANA_NM_CANAL
        ET.SubElement(item, "PACH_NM_PALAVRA").text = match.PACH_NM_PALAVRA
        
        areas = ET.SubElement(item, "AREA_PALAVRA")
        for rect in match.AREA_PALAVRA:
            rect_xml = ET.SubElement(areas, "RectangleF")
            ET.SubElement(rect_xml, "X").text = str(rect.X)
            ET.SubElement(rect_xml, "Y").text = str(rect.Y)
            ET.SubElement(rect_xml, "Width").text = str(rect.Width)
            ET.SubElement(rect_xml, "Height").text = str(rect.Height)

        ET.SubElement(item, "Setor").text = match.Setor
        ET.SubElement(item, "Selecionado").text = "true" if match.Selecionado else "false"
        ET.SubElement(item, "Exibir").text = "true" if match.Exibir else "false"

    # Encoding as utf-8 and adding the XML declaration to match C# XmlSerializer
    return ET.tostring(root, encoding="unicode", xml_declaration=True)
