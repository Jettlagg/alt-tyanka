#!/bin/zsh
set -eu
cd -- "${0:A:h}"
if ! command -v python3 >/dev/null 2>&1; then
  print 'Для этого способа запуска нужен Python 3. Альтернатива: Node.js 22, npm install, npm run dev.'
  read 'reply?Нажмите Enter, чтобы закрыть окно.'
  exit 1
fi
exec python3 scripts/serve.py
