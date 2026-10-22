"""Restore the five existing CECOP PDFs without transmitting large files through the CMS setup tools."""
from pathlib import Path
import hashlib
import json
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def import_books():
    manifest = json.loads((ROOT / 'docs/books-sources.json').read_text(encoding='utf-8'))
    for book in manifest:
        target = ROOT / 'public' / book['file'].lstrip('/')
        expected = book['sha256']
        if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest() == expected:
            print(f"Verified: {book['title']}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix('.pdf.part')
        for attempt in range(3):
            try:
                request = urllib.request.Request(book['source'], headers={'User-Agent': 'CECOP-content-migration/1.0'})
                digest = hashlib.sha256()
                with urllib.request.urlopen(request, timeout=90) as source, temporary.open('wb') as destination:
                    while chunk := source.read(256 * 1024):
                        digest.update(chunk)
                        destination.write(chunk)
                if digest.hexdigest() != expected:
                    raise ValueError(f"Source changed: {book['title']}; review the manifest before importing")
                with temporary.open('rb') as stream:
                    if stream.read(5) != b'%PDF-':
                        raise ValueError(f"Not a PDF: {book['title']}")
                temporary.replace(target)
                print(f"Imported: {book['title']} ({target.stat().st_size} bytes)")
                break
            except Exception:
                temporary.unlink(missing_ok=True)
                if attempt == 2:
                    raise
                time.sleep(2)


if __name__ == '__main__':
    import_books()
