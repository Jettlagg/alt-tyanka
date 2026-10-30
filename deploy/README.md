# Размещение на alt-tyanka.ru

Схема: интернет → Nginx на 80/443 → приложение `laura:8080` во внутренней Docker-сети. Порт приложения не публикуется на сервере. Сертификат выпускается Certbot через HTTP-01 и хранится в постоянном Docker volume; Nginx читает его без права записи.

## Домен и сервер

Нужен Linux VPS с публичным IP, Docker Engine и Compose plugin. Настройте у DNS-провайдера:

| Тип | Имя | Значение |
| --- | --- | --- |
| A | @ | публичный IPv4 вашего VPS |

Запись AAAA добавляйте только при наличии работающего публичного IPv6 этого же сервера. Старую AAAA, ведущую на другой сервер, удалите. `www` не используется и в сертификат не включён. Если домен ещё не зарегистрирован или зона не делегирована, сначала завершите это у регистратора.

Разрешите входящие TCP-порты **80** и **443** в firewall VPS и панели хостинга. Для HTTP-01 порт 80 должен оставаться доступным и после перехода на HTTPS. Не закрывайте используемый SSH-порт при настройке firewall.

Проверка DNS:

```sh
dig +short A alt-tyanka.ru
dig +short AAAA alt-tyanka.ru
```

Ожидается IP этого VPS. При NXDOMAIN сертификат выпустить нельзя: сначала нужно исправить DNS.

## Первый запуск

Скопируйте проект в `/opt/classified-laura` на сервере, включая `compose.production.yaml`, каталог `deploy/` и `scripts/`. Можно исключить `node_modules`, `test-results` и `artifacts`. Выполняйте команды от пользователя с доступом к Docker.

```sh
cd /opt/classified-laura

# Если переносите уже собранный образ:
docker load -i classified-laura-image.tar.gz

# Выпуск сертификата без email:
bash scripts/init-https.sh

# Если хотите указать контактный email:
# bash scripts/init-https.sh you@example.com
```

Если локального образа нет, скрипт соберёт его из исходников. Он поднимает HTTP, выпускает сертификат, проверяет конфигурацию Nginx и включает HTTPS с перенаправлением с HTTP. Email необязателен: без аргумента Certbot получает явно пустой адрес и создаёт новую учётную запись без контактного email. Если адрес указан, он передаётся Certbot. Существующая учётная запись используется повторно; её контактный адрес эта команда не удаляет. Команда принимает условия обслуживания Let's Encrypt. При ошибке выпуска сервис остаётся на HTTP, а повторный запуск продолжает установку. При уже имеющемся сертификате повторный запуск сохраняет HTTPS.

После первого успешного запуска сайт доступен по **https://alt-tyanka.ru**.

Дальнейший запуск после остановки:

```sh
docker compose -f compose.production.yaml up -d --no-build laura nginx
```

Не запускайте обычный `compose.yaml` для публичного размещения: он предназначен для локального порта 8080.

## Продление сертификата

Проверка процедуры через тестовую среду Let's Encrypt:

```sh
bash scripts/renew-certificates.sh --dry-run
```

Добавьте в crontab пользователя с доступом к Docker (`crontab -e`) проверку дважды в сутки. Ниже указан путь установки `/opt/classified-laura`; измените его, если проект лежит в другом месте.

```cron
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
17 3,15 * * * /bin/bash /opt/classified-laura/scripts/renew-certificates.sh >> /opt/classified-laura/certbot-renew.log 2>&1
```

Скрипт вызывает `certbot renew` и после успешной проверки перезагружает Nginx без остановки сайта. Расписание использует часовой пояс сервера. Скрипт и crontab должны оставаться на сервере; сертификат сам по себе не продлевается.

## Проверка и обновление

Если контейнер Nginx запущен, но подключения к 80/443 не работают, проверьте наличие `deploy/nginx/active.conf`. Файлы `*.conf.template` сами не загружаются: рабочий конфиг создаёт `bash scripts/init-https.sh`. Запуск одного `docker compose up` до этой инициализации недостаточен. Production Compose проверяет наличие рабочего конфига при старте и в healthcheck.

Если внешний Nginx уже запущен без конфига и нужно сначала проверить HTTP, выполните из каталога проекта:

```sh
cp deploy/nginx/http.conf.template deploy/nginx/active.conf
docker compose -f compose.production.yaml exec -T nginx nginx -t
docker compose -f compose.production.yaml exec -T nginx nginx -s reload
curl -I -H 'Host: alt-tyanka.ru' http://127.0.0.1
```

Эти команды предназначены для случая, когда `active.conf` отсутствует. Для включения HTTPS затем запустите `bash scripts/init-https.sh`. Если контейнер уже остановлен из-за отсутствия конфига, сразу используйте скрипт инициализации.

```sh
docker compose -f compose.production.yaml ps
docker compose -f compose.production.yaml exec -T nginx nginx -t
docker compose -f compose.production.yaml logs --tail=100 nginx
curl -I http://alt-tyanka.ru
curl -I https://alt-tyanka.ru
```

HTTP должен вернуть перенаправление на HTTPS, HTTPS — `200`. Путь `/.well-known/acme-challenge/` обслуживается по HTTP и не перенаправляется.

Обновление приложения из исходников:

```sh
docker compose -f compose.production.yaml build laura
docker compose -f compose.production.yaml up -d --no-build laura nginx
```

Либо загрузите обновлённый архив `docker load -i classified-laura-image.tar.gz` и выполните ту же команду `up`. Nginx повторно разрешает Docker DNS, поэтому смена адреса контейнера приложения не требует ручной правки upstream.

Остановка: `docker compose -f compose.production.yaml down`. Не добавляйте `-v`: тома содержат сертификаты и ключ ACME-учётной записи. Активный `deploy/nginx/active.conf` создаётся скриптом и не хранится в Git; храните его на сервере вместе с каталогом проекта.

Конфигурация проверена по документации [Nginx](https://nginx.org/en/docs/http/ngx_http_ssl_module.html), [Certbot](https://eff-certbot.readthedocs.io/en/stable/using.html#webroot) и [Let's Encrypt HTTP-01](https://letsencrypt.org/docs/challenge-types/#http-01-challenge).
