#!/bin/bash

# Time Tracker Setup Script
echo "🚀 Setting up Time Tracker with Daily Logs feature..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Please create it with the following variables:"
    echo ""
    echo "# NextAuth Configuration"
    echo "NEXTAUTH_URL=http://localhost:3000"
    echo "NEXTAUTH_SECRET=your-secret-here"
    echo ""
    echo "# Google OAuth Credentials"
    echo "GOOGLE_CLIENT_ID=your-google-client-id"
    echo "GOOGLE_CLIENT_SECRET=your-google-client-secret"
    echo ""
    echo "# MongoDB Configuration"
    echo "MONGODB_URI=mongodb://localhost:27017/time-tracker"
    echo ""
    exit 1
fi

# Check if MongoDB is available
echo "🗄️  Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB tools found. Make sure MongoDB is running."
elif command -v mongo &> /dev/null; then
    echo "✅ MongoDB tools found. Make sure MongoDB is running."
else
    echo "⚠️  MongoDB tools not found. For local development:"
    echo "   - Install MongoDB: https://www.mongodb.com/try/download/community"
    echo "   - Or use MongoDB Atlas: https://www.mongodb.com/atlas"
    echo "   - Update MONGODB_URI in .env.local accordingly"
fi

echo ""
echo "🎉 Setup complete! To start the application:"
echo "   npm run dev"
echo ""
echo "📝 Features included:"
echo "   ✅ Time tracking with clock in/out"
echo "   ✅ Daily statistics and progress tracking"
echo "   ✅ Save daily logs to database"
echo "   ✅ View historical logs with pagination"
echo "   ✅ Google OAuth authentication"
echo "   ✅ Responsive UI with theme switching"
echo ""
echo "📖 For more information, see DAILY_LOGS_FEATURE.md"
