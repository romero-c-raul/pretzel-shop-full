#!/bin/sh
set -e

echo "Executing Docker entrypoint script..."
npm run migrate

echo "Starting server..."
exec node server.js