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
nvm alias default 24 # Makes node 24 the default version

echo $APP_DIR