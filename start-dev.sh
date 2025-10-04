#!/bin/bash

# Carry Laundry Development Server Startup Script
# This script ensures a clean start of the development server

echo "🚀 Starting Carry Laundry Development Server..."
echo "================================================"

# Navigate to project directory
cd ~/carry-laundry

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the carry-laundry directory."
    exit 1
fi

# Kill any existing processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Found existing process on port 3000. Killing it..."
    lsof -ti:3000 | xargs kill -9
    sleep 2
fi

# Clear Next.js cache if it exists
if [ -d ".next" ]; then
    echo "🧹 Clearing Next.js cache..."
    rm -rf .next
fi

# Start the development server
echo "🌟 Starting development server..."
echo "================================================"
echo "📱 Your app will be available at:"
echo "   • http://localhost:3000"
echo "   • http://localhost:3001 (if 3000 is busy)"
echo "   • http://localhost:3002 (if 3001 is busy)"
echo ""
echo "💡 Tips:"
echo "   • Keep this terminal open while developing"
echo "   • Use Cursor for editing (hot-reload will work automatically)"
echo "   • Press Ctrl+C to stop the server"
echo "================================================"
echo ""

npm run dev

