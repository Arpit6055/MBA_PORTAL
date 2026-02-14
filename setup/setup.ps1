# MBA Portal - Setup & Run Script
# Usage: .\setup.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "MBA Portal Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "What do you want to do?" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Install dependencies" -ForegroundColor Cyan
Write-Host "2. Setup database" -ForegroundColor Cyan
Write-Host "3. Start dev server" -ForegroundColor Cyan
Write-Host "4. Run scrapers" -ForegroundColor Cyan
Write-Host "5. Test app" -ForegroundColor Cyan
Write-Host "6. Full setup (1+2+3)" -ForegroundColor Cyan
Write-Host "7. Reset database" -ForegroundColor Yellow
Write-Host "8. Exit" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter number (1-8)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
        npm install
        Write-Host "Done!" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "Initializing database..." -ForegroundColor Cyan
        npm run init-db
        Write-Host "Done!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "Starting development server..." -ForegroundColor Cyan
        Write-Host "Visit: http://localhost:3000" -ForegroundColor Green
        Write-Host ""
        npm run dev
    }
    "4" {
        Write-Host ""
        Write-Host "Running scrapers..." -ForegroundColor Cyan
        npm run scrape
        Write-Host "Done!" -ForegroundColor Green
    }
    "5" {
        Write-Host ""
        Write-Host "Testing application..." -ForegroundColor Cyan
        npm run test-api
        Write-Host "Done!" -ForegroundColor Green
    }
    "6" {
        Write-Host ""
        Write-Host "Full Setup" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Step 1: Installing..." -ForegroundColor Cyan
        npm install
        Write-Host "Done!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Step 2: Database..." -ForegroundColor Cyan
        npm run init-db
        Write-Host "Done!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Step 3: Starting server..." -ForegroundColor Cyan
        Write-Host "Visit: http://localhost:3000" -ForegroundColor Green
        Write-Host ""
        npm start
    }
    "7" {
        Write-Host ""
        Write-Host "WARNING: Delete all data?" -ForegroundColor Yellow
        $confirm = Read-Host "Type 'yes' to confirm"
        if ($confirm -eq "yes") {
            Write-Host ""
            Write-Host "Resetting database..." -ForegroundColor Cyan
            npm run reset-db
            npm run init-db
            Write-Host "Done!" -ForegroundColor Green
        }
        else {
            Write-Host "Cancelled" -ForegroundColor Cyan
        }
    }
    "8" {
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Finished" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
