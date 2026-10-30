#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose() { docker compose -f "$PROJECT_DIR/compose.production.yaml" "$@"; }
CONFIG_DIR="$PROJECT_DIR/deploy/nginx"

if [[ $# -ne 1 || -z "$1" ]]; then
    printf 'Использование: %s EMAIL_ДЛЯ_LETS_ENCRYPT\n' "$0" >&2
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    printf 'Не найден Docker. Установите Docker Engine и Compose plugin.\n' >&2
    exit 1
fi

docker info >/dev/null
compose config --quiet

if ! docker image inspect classified-laura:latest >/dev/null 2>&1; then
    compose build laura
fi

# Inspect the persistent certificate volume before choosing the initial config.
# An existing HTTPS installation stays on HTTPS when this script is rerun.
compose pull nginx certbot
if compose run --rm --no-deps --entrypoint sh nginx -c \
    'test -s /etc/letsencrypt/live/alt-tyanka.ru/fullchain.pem && test -s /etc/letsencrypt/live/alt-tyanka.ru/privkey.pem'; then
    initial_template=https.conf.template
else
    initial_template=http.conf.template
fi

cp "$CONFIG_DIR/$initial_template" "$CONFIG_DIR/active.conf.tmp"
mv "$CONFIG_DIR/active.conf.tmp" "$CONFIG_DIR/active.conf"
compose up -d --no-build --wait --wait-timeout 90 laura nginx
compose exec -T nginx nginx -t
compose exec -T nginx nginx -s reload

printf '\nВыпускаем сертификат для alt-tyanka.ru. DNS должен указывать на этот сервер, порт 80 должен быть доступен извне.\n'
compose run --rm --no-deps certbot certonly \
    --webroot --webroot-path /var/www/certbot \
    --cert-name alt-tyanka.ru --domain alt-tyanka.ru \
    --email "$1" --agree-tos --non-interactive --keep-until-expiring

cp "$CONFIG_DIR/active.conf" "$CONFIG_DIR/active.conf.previous"
cp "$CONFIG_DIR/https.conf.template" "$CONFIG_DIR/active.conf.tmp"
mv "$CONFIG_DIR/active.conf.tmp" "$CONFIG_DIR/active.conf"
if ! compose exec -T nginx nginx -t; then
    mv "$CONFIG_DIR/active.conf.previous" "$CONFIG_DIR/active.conf"
    printf 'Новая конфигурация не прошла проверку. Восстановлена предыдущая.\n' >&2
    exit 1
fi
compose exec -T nginx nginx -s reload
rm -f "$CONFIG_DIR/active.conf.previous"
printf '\nГотово: https://alt-tyanka.ru\nНастройте периодический запуск scripts/renew-certificates.sh по инструкции в deploy/README.md.\n'
