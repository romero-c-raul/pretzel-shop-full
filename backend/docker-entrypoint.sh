#!/bin/sh
set -e

echo "Executing Docker entrypoint script..."
npm run migrate

echo "Starting server..."
exec npm server.js