#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building..."
npm run build

echo "🚀 Starting with PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

pm2 stop nimeka-tv 2>/dev/null || true
pm2 delete nimeka-tv 2>/dev/null || true
pm2 start dist/boot.js --name nimeka-tv
pm2 save
pm2 startup

echo "✅ Done!"
pm2 status nimeka-tv
