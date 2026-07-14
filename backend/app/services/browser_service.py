import asyncio
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from typing import Optional, Dict, Any
import os
import json

from app.core.config import settings

class BrowserService:
    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None
        
    async def start(self):
        if not self.playwright:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=not settings.debug,
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )
            
    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
            
    async def get_context(self, storage_state: Optional[str] = None) -> BrowserContext:
        """
        Creates a new browser context. 
        If storage_state is provided (path to JSON), it loads cookies/session.
        """
        if not self.browser:
            await self.start()
            
        state = None
        if storage_state and os.path.exists(storage_state):
            state = storage_state
            
        context = await self.browser.new_context(
            storage_state=state,
            viewport={'width': 1920, 'height': 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        return context

    async def save_state(self, context: BrowserContext, path: str):
        """Saves current session state to a file."""
        await context.storage_state(path=path)
        print(f"Session state saved to {path}")

# Interface for specific site workers
class BaseScraper:
    def __init__(self, browser_service: BrowserService):
        self.browser_service = browser_service
        
    async def run(self, **kwargs):
        raise NotImplementedError("Subclasses must implement run()")
