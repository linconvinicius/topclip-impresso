import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionPalavras

class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.keywords = []

    def load_keywords(self):
        """
        Loads all active keywords from the legacy view.
        Cache them in memory for faster matching.
        """
        print("Loading keywords from TopClipPalavras...")
        query = text("""
            SELECT CLIE_CD_CLIENTE, cliente, PACH_CD_PALAVRA_CHAVE, Palavra
            FROM VW_Cliente_Canal_Palavra_Impresso
        """)
        results = self.db.execute(query).fetchall()
        self.keywords = [
            {
                "client_id": r[0],
                "client_name": r[1],
                "keyword_id": r[2],
                "word": r[3].lower() if r[3] else ""
            }
            for r in results if r[3]
        ]
        print(f"Loaded {len(self.keywords)} keywords.")

    def find_matches(self, text_content: str) -> List[Dict[str, Any]]:
        """
        Searches for keywords in the provided text.
        Returns a list of matches with context snippets.
        """
        if not text_content:
            return []
            
        matches = []
        text_lower = text_content.lower()
        
        for kw in self.keywords:
            word = kw['word']
            # Use regex to find whole word matches
            # Escape the word in case it has special regex chars
            pattern = rf"\b{re.escape(word)}\b"
            
            # Simple check first for speed
            if word in text_lower:
                finds = list(re.finditer(pattern, text_lower))
                if finds:
                    for find in finds:
                        start, end = find.span()
                        # Get a snippet of context (e.g., 50 chars before and after)
                        snippet_start = max(0, start - 50)
                        snippet_end = min(len(text_content), end + 50)
                        snippet = text_content[snippet_start:snippet_end]
                        
                        matches.append({
                            "client_id": kw['client_id'],
                            "client_name": kw['client_name'],
                            "keyword_id": kw['keyword_id'],
                            "keyword": word,
                            "snippet": snippet.strip()
                        })
        
        return matches
