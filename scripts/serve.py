#!/usr/bin/env python3
"""Serve the production build locally using only Python's standard library."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import threading
import webbrowser

parser = argparse.ArgumentParser(description="Открыть CLASSIFIED: LAURA локально")
parser.add_argument("--no-open", action="store_true", help="Не открывать браузер автоматически")
parser.add_argument("--port", type=int, default=4173)
args = parser.parse_args()
directory = Path(__file__).resolve().parent.parent / "dist"
if not (directory / "index.html").is_file():
    parser.exit(1, "Сначала выполните npm install и npm run build.\n")
handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
try:
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
except OSError as error:
    parser.exit(1, f"Не удалось запустить сервер: {error}\n")
url = f"http://127.0.0.1:{args.port}"
print(f"\nCLASSIFIED: LAURA // ДЕЛО №001\n{url}\n\nОставьте это окно открытым. Ctrl+C — остановить.\n", flush=True)
if not args.no_open:
    threading.Timer(0.4, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nОперация завершена.")
finally:
    server.server_close()
