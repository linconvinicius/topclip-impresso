from app.services.browser_service import BrowserService, BaseScraper
from app.services.goread_scraper import GoReadScraper
from app.services.globomais_scraper import GloboMaisScraper
from typing import Optional

class ScraperFactory:
    def __init__(self, browser_service: BrowserService):
        self.browser_service = browser_service
        self.scrapers = {
            "GOREAD": GoReadScraper(browser_service),
            "GLOBOMAIS": GloboMaisScraper(browser_service),
            # Add more as they are implemented
        }

    def get_scraper_for_type(self, download_type: int, vehicle_name: str) -> Optional[BaseScraper]:
        """
        Maps legacy VEDO_IN_TIPO or vehicle name to a scraper.
        This is a heuristic mapping that will grow.
        """
        # Heuristic 1: By name
        name_lower = vehicle_name.lower()
        if any(x in name_lower for x in ['veja', 'exame', 'claudia', 'quatro rodas']):
            return self.scrapers.get("GOREAD")
            
        if any(x in name_lower for x in ['época', 'quem', 'globo rural', 'vogue']):
            return self.scrapers.get("GLOBOMAIS")

        # Heuristic 2: By type code (to be refined with user observation)
        # if download_type == 5: return self.scrapers.get("GOREAD")
        
        return None
