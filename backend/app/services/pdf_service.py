import httpx
import os
import aiofiles
from typing import Optional

class PDFService:
    def __init__(self, timeout: int = 60):
        self.timeout = timeout

    async def download_pdf(self, url: str, output_path: str) -> bool:
        """
        Downloads a PDF from a direct URL.
        """
        print(f"Downloading PDF from {url} to {output_path}...")
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                # Check if it's actually a PDF
                content_type = response.headers.get("content-type", "").lower()
                if "application/pdf" not in content_type and not url.lower().endswith(".pdf"):
                    print(f"Warning: Content-type is {content_type}, might not be a PDF.")

                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                async with aiofiles.open(output_path, "wb") as f:
                    await f.write(response.content)
                
                print(f"Successfully downloaded PDF: {output_path}")
                return True
        except Exception as e:
            print(f"Failed to download PDF from {url}: {e}")
            return False
