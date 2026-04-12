#!/usr/bin/env bash

set -euo pipefail

VM_IP=$(hostname -I | awk '{print $2}')
REPO_URL=${1:?Usage: bootstrap.sh <repository-url>}
APP_DIR="/home/$(whoami)/pretzel-shop-full"

echo "=== Updating system packages ==="
sudo apt update && sudo apt upgrade -y

# Creating variable for nvm home
export NVM_DIR="$HOME/.nvm"

# If NVM does not exist, install it
if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

# If nvm.sh exists, add it to the current shell (so we can execute the command)
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 24
nvm alias default 24 

# Install and setup postgresql
echo "=== Installing Postgresql ==="
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

sudo -u postgres psql -c "CREATE ROLE pretzel_user WITH LOGIN PASSWORD 'pretzel_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE pretzel_shop OWNER pretzel_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pretzel_shop TO pretzel_user;" 2>/dev/null || true

# Install redis
echo "=== Installing Redis ==="
sudo apt install -y redis-server
sudo systemctl enable --now redis-server

# Install NGINX
echo "=== Installing NGINX ==="
sudo apt install -y nginx
sudo systemctl enable --now nginx

# Clone repo
if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "=== Backend setup ==="
cd "$APP_DIR"/backend/
npm install

cat > .env << EOF
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pretzel_shop
DB_USER=pretzel_user
DB_PASSWORD=pretzel_password
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=https://${VM_IP}
EOF

echo "=== Running database migrations ==="
npm run migrate

echo "=== Frontend setup ==="
cd "$APP_DIR"/frontend/
npm install
echo "VITE_API_BASE_URL=https://${VM_IP}" > .env.local
npm run build

# Deploy frontend files to nginx
sudo mkdir -p /var/www/pretzel-shop
sudo cp -r dist/* /var/www/pretzel-shop/
sudo chown -R www-data:www-data /var/www/pretzel-shop

echo "=== Configuring NGINX ==="

# Generate self-signed SSL certificate
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/pretzel-shop.key \
  -out /etc/nginx/ssl/pretzel-shop.crt \
  -subj "/C=US/ST=State/L=City/O=PretzelShop/CN=pretzel-shop.local"

# Configure NGINX
sudo rm -f /etc/nginx/sites-enabled/default
sudo tee /etc/nginx/sites-available/pretzel-shop > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/pretzel-shop.crt;
    ssl_certificate_key /etc/nginx/ssl/pretzel-shop.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/pretzel-shop;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

# Enable the NGINX site and reload the configuration
sudo ln -sf /etc/nginx/sites-available/pretzel-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo tee /etc/systemd/system/pretzel-api.service >/dev/null << SYSTEMD
[Unit]
Description=Pretzel Shop API
After=network.target postgresql.service redis-server.service
Wants=postgresql.service redis-server.service

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$APP_DIR/backend
ExecStart=/bin/bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && exec node server.js'
Restart=on-failure
RestartSec=5
EnvironmentFile=$APP_DIR/backend/.env
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pretzel-api

[Install]
WantedBy=multi-user.target
SYSTEMD


echo "=== Starting Pretzel API service ==="
sudo systemctl daemon-reload
sudo systemctl enable --now pretzel-api

echo "=== Configuring UFW firewall ==="
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status

echo "=== Bootstrap complete ==="
echo "Pretzel Shop is running at https://${VM_IP}"
echo "Accept the self-signed certificate warning in your browser."