# Docker DNS resolves the application again after a container is recreated.
resolver 127.0.0.11 valid=30s ipv6=off;
set $laura_backend laura:8080;
proxy_pass http://$laura_backend;
proxy_http_version 1.1;
proxy_set_header Connection "";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_connect_timeout 5s;
proxy_read_timeout 30s;
