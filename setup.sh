#!/bin/bash
set -e

echo "=== RoadReady Setup ==="

# Check Node
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org (v20+ recommended) or via:"
  echo "  brew install node"
  exit 1
fi

echo "Node $(node --version) found"

# Install root deps
echo "Installing dependencies..."
npm install

# Install server deps and generate Prisma client
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ..

# Install client deps
cd client
npm install
cd ..

echo ""
echo "=== Setup complete! ==="
echo "Fill in your credentials in .env and client/.env, then run:"
echo "  npm run dev"
