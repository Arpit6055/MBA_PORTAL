#!/usr/bin/env pwsh
# MBA Portal - Setup & Run Script
# Usage: .\setup.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "MBA Portal Setup & Run Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Colors
$Success = "Green"
$Error = "Red"
$Info = "Cyan"
$Warning = "Yellow"

# Menu
Write-Host "`nWhat do you want to do?`n" -ForegroundColor $Info
Write-Host "1. Install dependencies (first time only)" -ForegroundColor $Info
Write-Host "2. Setup database & seed colleges" -ForegroundColor $Info
Write-Host "3. Start development server" -ForegroundColor $Info
Write-Host "4. Run all scrapers" -ForegroundColor $Info
Write-Host "5. Test entire app" -ForegroundColor $Info
Write-Host "6. Full setup (1+2+3)" -ForegroundColor $Info
Write-Host "7. Reset everything" -ForegroundColor $Warning
Write-Host "8. Exit" -ForegroundColor $Info

$choice = Read-Host "`nEnter number (1-8)"

switch ($choice) {
    "1" {
        Write-Host "`n⏳ Installing dependencies..." -ForegroundColor $Info
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependencies installed successfully" -ForegroundColor $Success
        } else {
            Write-Host "✗ Installation failed" -ForegroundColor $Error
            exit 1
        }
        break
    }
    
    "2" {
        Write-Host "`n⏳ Initializing database..." -ForegroundColor $Info
        npm run init-db
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database initialized with 60 colleges" -ForegroundColor $Success
        } else {
            Write-Host "✗ Database setup failed" -ForegroundColor $Error
            exit 1
        }
        break
    }
    
    "3" {
        Write-Host "`n🚀 Starting development server..." -ForegroundColor $Info
        Write-Host "Visit: http://localhost:3000" -ForegroundColor $Success
        Write-Host "Press Ctrl+C to stop`n" -ForegroundColor $Warning
        npm run dev
        break
    }
    
    "4" {
        Write-Host "`n⏳ Running all scrapers (Reddit + News)..." -ForegroundColor $Info
        npm run scrape
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Scraping completed" -ForegroundColor $Success
            Write-Host "Check http://localhost:3000/api/news for articles" -ForegroundColor $Success
        } else {
            Write-Host "✗ Scraping failed" -ForegroundColor $Error
        }
        break
    }
    
    "5" {
        Write-Host "`n🧪 Testing all endpoints..." -ForegroundColor $Info
        npm run test-api
        break
    }
    
    "6" {
        Write-Host "`n🔧 Full Setup: Installing + Database + Server..." -ForegroundColor $Info
        
        Write-Host "`nStep 1: Installing dependencies..." -ForegroundColor $Info
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Installation failed" -ForegroundColor $Error
            exit 1
        }
        Write-Host "✓ Dependencies installed" -ForegroundColor $Success
        
        Write-Host "`nStep 2: Initializing database..." -ForegroundColor $Info
        npm run init-db
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Database setup failed" -ForegroundColor $Error
            exit 1
        }
        Write-Host "✓ Database initialized" -ForegroundColor $Success
        
        Write-Host "`nStep 3: Starting server..." -ForegroundColor $Info
        Write-Host "Visit: http://localhost:3000" -ForegroundColor $Success
        Write-Host "Press Ctrl+C to stop`n" -ForegroundColor $Warning
        npm start
        break
    }
    
    "7" {
        Write-Host "`n⚠️ WARNING: This will delete all data!" -ForegroundColor $Warning
        $confirm = Read-Host "Are you sure? (y/n)"
        if ($confirm -eq "y") {
            Write-Host "`nResetting database..." -ForegroundColor $Info
            npm run reset-db
            npm run init-db
            Write-Host "✓ Database reset and re-seeded" -ForegroundColor $Success
        } else {
            Write-Host "Cancelled" -ForegroundColor $Info
        }
        break
    }
    
    "8" {
        Write-Host "Goodbye!" -ForegroundColor $Info
        exit 0
    }
    
    default {
        Write-Host "Invalid choice. Please enter 1-8" -ForegroundColor $Error
        exit 1
    }
}

Write-Host "`n================================" -ForegroundColor $Success
Write-Host "Done!" -ForegroundColor $Success
Write-Host "================================" -ForegroundColor $Success
