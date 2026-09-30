"""Verify all remote edition covers, with bounded concurrency and retries.
Usage: python3 scripts/verify-classic-covers.py /tmp/agora-cover-report.json [prior-report.json]
The report is a verification artifact, not user data.
"""
import concurrent.futures
import datetime
import json
from pathlib import Path
import sys
import time
import urllib.request

books = json.loads((Path(__file__).resolve().parents[1] / 'src/data/classicBooks.json').read_text())
cached = {}
if len(sys.argv) > 2:
    prior = json.loads(Path(sys.argv[2]).read_text())
    cached = {result['id']: {**result, 'checkedAt': result.get('checkedAt', prior['checkedAt'])} for result in prior['results'] if result['ok']}

def check(book):
    if book['id'] in cached:
        return cached[book['id']]
    for attempt in range(3):
        try:
            request = urllib.request.Request(book['cover'], headers={'User-Agent': 'AgoraCatalogValidation/1.0'})
            with urllib.request.urlopen(request, timeout=25) as response:
                data = response.read()
                if response.status != 200 or not response.headers.get('Content-Type', '').startswith('image/') or len(data) < 500:
                    raise ValueError('Missing or empty cover')
                return {'id': book['id'], 'ok': True, 'bytes': len(data), 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
        except Exception as error:
            problem = str(error)
            time.sleep(attempt + 1)
    return {'id': book['id'], 'ok': False, 'error': problem}

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(check, books):
        results.append(result)
        if len(results) % 50 == 0:
            print(f'{len(results)}/{len(books)} checked; failures: {sum(not r["ok"] for r in results)}', flush=True)
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'results': results}
Path(sys.argv[1]).write_text(json.dumps(report, indent=2) + '\n')
print('Failed:', [r for r in results if not r['ok']], flush=True)
sys.exit(1 if any(not r['ok'] for r in results) else 0)
