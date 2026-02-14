#!/bin/bash
# MBA Portal - Setup & Run Script (Bash version)
# Usage: bash setup.sh

echo "================================"
echo "MBA Portal Setup & Run Script"
echo "================================"
echo ""

# Function to run commands
run_command() {
    echo ""
    echo "⏳ Running: $1"
    eval $1
    if [ $? -eq 0 ]; then
        echo "✓ Success: $2"
    else
        echo "✗ Failed: $2"
        exit 1
    fi
}

# Menu
echo "What do you want to do?"
echo ""
echo "1. Install dependencies (first time only)"
echo "2. Setup database & seed colleges"
echo "3. Start development server"
echo "4. Run all scrapers"
echo "5. Test entire app"
echo "6. Full setup (1+2+3)"
echo "7. Reset everything"
echo "8. Exit"
echo ""

read -p "Enter number (1-8): " choice

case $choice in
    1)
        run_command "npm install" "Dependencies installed"
        ;;
    
    2)
        run_command "npm run init-db" "Database initialized"
        echo "✓ Database ready with 60 colleges"
        ;;
    
    3)
        echo ""
        echo "🚀 Starting development server..."
        echo "Visit: http://localhost:3000"
        echo "Press Ctrl+C to stop"
        echo ""
        npm run dev
        ;;
    
    4)
        echo ""
        echo "⏳ Running all scrapers (Reddit + News)..."
        npm run scrape
        if [ $? -eq 0 ]; then
            echo "✓ Scraping completed"
            echo "Check http://localhost:3000/api/news for articles"
        fi
        ;;
    
    5)
        echo ""
        echo "🧪 Testing all endpoints..."
        npm run test-api
        ;;
    
    6)
        echo ""
        echo "🔧 Full Setup"
        
        echo ""
        echo "Step 1: Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            echo "✗ Installation failed"
            exit 1
        fi
        echo "✓ Dependencies installed"
        
        echo ""
        echo "Step 2: Initializing database..."
        npm run init-db
        if [ $? -ne 0 ]; then
            echo "✗ Database setup failed"
            exit 1
        fi
        echo "✓ Database initialized"
        
        echo ""
        echo "Step 3: Starting server..."
        echo "Visit: http://localhost:3000"
        echo "Press Ctrl+C to stop"
        echo ""
        npm start
        ;;
    
    7)
        echo ""
        echo "⚠️  WARNING: This will delete all data!"
        read -p "Are you sure? (y/n) " confirm
        if [ "$confirm" = "y" ]; then
            echo ""
            echo "Resetting database..."
            npm run reset-db
            npm run init-db
            echo "✓ Database reset and re-seeded"
        else
            echo "Cancelled"
        fi
        ;;
    
    8)
        echo "Goodbye!"
        exit 0
        ;;
    
    *)
        echo "Invalid choice. Please enter 1-8"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "Done!"
echo "================================"
