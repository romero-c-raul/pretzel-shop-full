#!/usr/bin/env bash

set -euo pipefail;

IP=$(hostname -I | awk '{print $2}')
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
  git clone "$REPO_URL" "$APP_URL"
fi


echo $APP_DIR