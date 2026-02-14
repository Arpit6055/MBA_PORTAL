#!/usr/bin/env powershell
# ============================================================
# SECURITY SETUP AUTOMATION FOR WINDOWS
# ============================================================
# 
# This script automates all security setup tasks
# Run: .\setup-security.ps1
#

param(
    [switch]$Full = $false
)

# Colors for output
$colors = @{
    Success = 'Green'
    Error = 'Red'
    Warning = 'Yellow'
    Info = 'Cyan'
}

function Write-Header {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  🔒 SECURITY SETUP - MBA Portal" -ForegroundColor Cyan
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-FileExists {
    param([string]$FilePath)
    return Test-Path $FilePath -PathType Leaf
}

function Verify-EnvFile {
    if (Test-FileExists ".env") {
        Write-Success ".env file exists"
        
        # Check for placeholder values
        $content = Get-Content ".env" -Raw
        if ($content -match "your-" -or $content -match "XXX") {
            Write-Warning "⚠️  .env contains placeholder values - MUST UPDATE BEFORE PRODUCTION"
            Write-Info "Edit .env and replace all 'your-' and 'XXX' values with real secrets"
            return $false
        }
        Write-Success ".env has been updated with real values"
        return $true
    } else {
        Write-Error-Custom ".env file not found"
        Write-Info "Creating .env from template..."
        Copy-Item "docs/security/.env.example" ".env" -Force
        Write-Warning "⚠️  IMPORTANT: Edit .env and replace placeholder values"
        return $false
    }
}

function Generate-Secret {
    param([int]$Bytes = 32)
    $secret = [System.Convert]::ToBase64String((Get-Random -Count $Bytes -InputObject (0..255)))
    return $secret
}

function Verify-Gitignore {
    if (Test-FileExists ".gitignore") {
        $content = Get-Content ".gitignore" -Raw
        if ($content -match "\.env") {
            Write-Success ".env is in .gitignore"
            return $true
        }
    }
    Write-Error-Custom ".env not in .gitignore"
    return $false
}

function Check-SecurityPackages {
    Write-Info "Checking security packages..."
    
    $requiredPackages = @(
        "helmet",
        "express-rate-limit",
        "bcrypt",
        "express-mongo-sanitize",
        "validator",
        "hpp",
        "jsonwebtoken"
    )
    
    $missing = @()
    
    foreach ($package in $requiredPackages) {
        if (Test-Path "node_modules/$package") {
            Write-Success "  $package ✅"
        } else {
            $missing += $package
            Write-Warning "  $package ❌ (missing)"
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Warning "Missing packages: $($missing -join ', ')"
        Write-Info "Run: npm install"
        return $false
    }
    
    Write-Success "All security packages installed"
    return $true
}

function Generate-SecretsGuide {
    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host "🔐 GENERATE STRONG SECRETS" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "For production, use these commands to generate strong secrets:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "SESSION_SECRET:" -ForegroundColor White
    Write-Host 'node -e "console.log(require(''crypto'').randomBytes(32).toString(''hex''))"' -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "JWT_SECRET:" -ForegroundColor White
    Write-Host 'node -e "console.log(require(''crypto'').randomBytes(32).toString(''hex''))"' -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "ENCRYPTION_KEY:" -ForegroundColor White
    Write-Host 'node -e "console.log(require(''crypto'').randomBytes(16).toString(''hex''))"' -ForegroundColor Gray
    Write-Host ""
}

function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Cyan
    Write-Host "1. Check security status"
    Write-Host "2. Create/update .env file"
    Write-Host "3. Verify .gitignore"
    Write-Host "4. Install security packages"
    Write-Host "5. Generate secret keys"
    Write-Host "6. Full security setup"
    Write-Host "7. Exit"
    Write-Host ""
}

function Full-Security-Setup {
    Write-Host ""
    Write-Header
    
    Write-Info "Starting full security setup..."
    Write-Host ""
    
    # Step 1: .env
    Write-Info "Step 1: Environment file"
    if (-not (Verify-EnvFile)) {
        Write-Warning "Please edit .env and add real values"
    }
    Write-Host ""
    
    # Step 2: .gitignore
    Write-Info "Step 2: Git ignore file"
    if (Verify-Gitignore) {
        Write-Success "Git protection configured"
    }
    Write-Host ""
    
    # Step 3: Packages
    Write-Info "Step 3: Installing packages"
    if (-not (Check-SecurityPackages)) {
        Write-Warning "Installing missing packages..."
        npm install
    }
    Write-Host ""
    
    # Step 4: Generate secrets
    Write-Info "Step 4: Secret generation guide"
    Generate-SecretsGuide
    
    Write-Host ""
    Write-Success "Security setup complete!"
    Write-Info "Next steps:"
    Write-Host "  1. Edit .env file with real values"
    Write-Host "  2. Generate secrets (see commands above)"
    Write-Host "  3. Run: npm start"
}

function Main {
    Write-Header
    
    if ($Full) {
        Full-Security-Setup
    } else {
        do {
            Show-Menu
            $choice = Read-Host "Enter your choice (1-7)"
            
            switch ($choice) {
                "1" {
                    Write-Info "Checking security status..."
                    Write-Host ""
                    Verify-EnvFile | Out-Null
                    Verify-Gitignore | Out-Null
                    Check-SecurityPackages | Out-Null
                }
                "2" {
                    Write-Info "Setting up .env file..."
                    Verify-EnvFile | Out-Null
                }
                "3" {
                    Write-Info "Checking .gitignore..."
                    Verify-Gitignore | Out-Null
                }
                "4" {
                    Write-Info "Installing security packages..."
                    npm install
                }
                "5" {
                    Generate-SecretsGuide
                }
                "6" {
                    Full-Security-Setup
                }
                "7" {
                    Write-Info "Goodbye!"
                    exit 0
                }
                default {
                    Write-Error-Custom "Invalid choice"
                }
            }
            
            Write-Host ""
            Read-Host "Press Enter to continue"
            Clear-Host
        } while ($true)
    }
}

# Run
Main
