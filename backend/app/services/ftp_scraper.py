import ftplib
import os
from app.services.browser_service import BaseScraper, BrowserService

class FTPScraper(BaseScraper):
    def __init__(self, browser_service: BrowserService):
        super().__init__(browser_service)

    async def run(self, host: str, user: str, password: str, directory: str, output_dir: str):
        print(f"Connecting to FTP {host}...")
        try:
            with ftplib.FTP(host) as ftp:
                ftp.login(user=user, passwd=password)
                if directory:
                    ftp.cwd(directory)
                
                os.makedirs(output_dir, exist_ok=True)
                
                files = ftp.nlst()
                print(f"Found {len(files)} files on FTP.")
                
                for filename in files:
                    local_path = os.path.join(output_dir, filename)
                    with open(local_path, "wb") as f:
                        ftp.retrbinary(f"RETR {filename}", f.write)
                    print(f"Downloaded: {filename}")
                    
        except Exception as e:
            print(f"FTP Error on {host}: {e}")
