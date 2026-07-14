import asyncio
import os
import sys

# Add backend dir to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLeitor, SessionProducao, SessionPalavras
from app.services.queue_repository import QueueRepository
from app.services.browser_service import BrowserService
from app.services.scraper_factory import ScraperFactory
from app.services.ftp_scraper import FTPScraper
from app.services.pdf_service import PDFService
from app.services.ocr_service import OCRService, PDFProcessor
from app.services.search_service import SearchService
from app.services.clip_repository import ClipRepository
from datetime import datetime

async def main_loop():
    print("=== TOPCLIP MODERN DOWNLOADER WORKER ===")
    
    # Initialize services
    browser_service = BrowserService()
    await browser_service.start()
    factory = ScraperFactory(browser_service)
    ftp_service = FTPScraper(browser_service)
    pdf_service = PDFService()
    
    ocr_service = OCRService()
    pdf_processor = PDFProcessor(ocr_service)
    
    # DB Sessions
    db_leitor = SessionLeitor()
    db_producao = SessionProducao()
    db_palavras = SessionPalavras()
    
    try:
        repo = QueueRepository(db_leitor)
        search_service = SearchService(db_palavras)
        search_service.load_keywords()
        clip_repo = ClipRepository(db_producao)
        
        while True:
            print(f"\n[{os.getpid()}] Checking for pending downloads...")
            tasks = repo.get_pending_downloads()
            
            if not tasks:
                print("No pending tasks. Sleeping for 60 seconds...")
                await asyncio.sleep(60)
                continue
                
            for task in tasks:
                veiculo_id = task['veiculo_id']
                print(f"Processing task: {task['name']} (ID: {veiculo_id})")
                
                output_dir = f"downloads/{veiculo_id}_{int(asyncio.get_event_loop().time())}"
                pdf_path = f"{output_dir}/edicao.pdf"
                download_success = False
                
                try:
                    # 1. Download Stage
                    if "ftp" in task['server'].lower():
                        print(f"FTP detected for {task['name']}. Fetching credentials...")
                        creds = repo.get_ftp_credentials(veiculo_id)
                        if creds:
                            await ftp_service.run(
                                host=creds['host'], user=creds['user'], password=creds['password'],
                                directory=creds['directory'], output_dir=output_dir
                            )
                            download_success = os.path.exists(output_dir) and os.listdir(output_dir)
                        else:
                            print(f"Error: No FTP credentials found for {task['name']}")
                    else:
                        scraper = factory.get_scraper_for_type(task['download_type'], task['name'])
                        if scraper:
                            await scraper.run(task['url'], output_dir)
                            download_success = True
                        elif task['url'] and task['url'].lower().startswith("http"):
                            os.makedirs(output_dir, exist_ok=True)
                            await pdf_service.download_pdf(task['url'], pdf_path)
                            download_success = os.path.exists(pdf_path)
                        else:
                            print(f"Warning: No automated download method for {task['name']}")

                    # 2. Processing Stage (OCR + Search + Clip)
                    if download_success:
                        print(f"Download successful for {task['name']}. Starting OCR...")
                        if not os.path.exists(pdf_path) and os.path.exists(output_dir):
                            pdfs = [f for f in os.listdir(output_dir) if f.lower().endswith(".pdf")]
                            if pdfs:
                                pdf_path = os.path.join(output_dir, pdfs[0])
                        
                        if os.path.exists(pdf_path):
                            extracted_text = await pdf_processor.process_pdf(pdf_path, f"{output_dir}/ocr")
                            
                            if extracted_text:
                                matches = search_service.find_matches(extracted_text)
                                if matches:
                                    print(f"Found {len(matches)} matches for {task['name']}. Saving clips...")
                                    materia_id = clip_repo.create_materia(
                                        veiculo_id=veiculo_id,
                                        title=f"Edição {task['name']} - {datetime.now().strftime('%d/%m/%Y')}",
                                        pub_date=datetime.now()
                                    )
                                    
                                    saved_clients = set()
                                    for match in matches:
                                        if match['client_id'] not in saved_clients:
                                            clip_repo.create_clip(
                                                materia_id=materia_id,
                                                client_id=match['client_id'],
                                                snippet=match['snippet']
                                            )
                                            saved_clients.add(match['client_id'])
                        
                        repo.update_task_status(veiculo_id, 2)
                        print(f"Task {task['name']} completed successfully.")
                    else:
                        repo.update_task_status(veiculo_id, 3)
                        print(f"Task {task['name']} failed.")

                except Exception as e:
                    print(f"Error processing task {task['name']}: {e}")
                    repo.update_task_status(veiculo_id, 3)
            
            await asyncio.sleep(60)
            
    finally:
        db_leitor.close()
        db_producao.close()
        db_palavras.close()
        await browser_service.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
    except KeyboardInterrupt:
        print("Worker stopped by user.")
