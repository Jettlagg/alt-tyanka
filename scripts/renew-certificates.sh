#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose() { docker compose -f "$PROJECT_DIR/compose.production.yaml" "$@"; }

compose run --rm --no-deps certbot renew --quiet "$@"
# Reload after every successful renewal check, including checks where no
# certificate was due. This also loads a certificate after an earlier reload failed.
compose exec -T nginx nginx -t
compose exec -T nginx nginx -s reload
