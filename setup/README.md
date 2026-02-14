# 🔧 Setup Scripts

Automated setup scripts for different operating systems.

---

## 📖 Choose Your Platform

### 🪟 Windows (PowerShell)

```powershell
.\setup.ps1
```

**What it does:**
- ✅ Create .env file (from template)
- ✅ Install npm packages
- ✅ Initialize database
- ✅ Interactive menu (choose what to do)

### 🐧 Mac/Linux (Bash)

```bash
bash setup.sh
```

**What it does:**
- ✅ Create .env file
- ✅ Install npm dependencies
- ✅ Setup MongoDB locally
- ✅ Initialize database

---

## 🔒 Security Setup

If you want ONLY security setup (no full installation):

```powershell
# Windows
.\setup-security.ps1
```

**What it does:**
- ✅ Create .env from template
- ✅ Verify .gitignore protection
- ✅ Check security packages installed
- ✅ Generate strong secrets
- ✅ Interactive menu per step

---

## ⚡ Quick Manual Setup

**If you prefer to do it yourself:**

```bash
# 1. Copy environment template
cp ../docs/security/.env.example .env

# 2. Edit with your secrets (use any editor)
nano .env

# 3. Install packages
npm install

# 4. Initialize database
npm run init-db

# 5. Start development
npm start
```

---

## 🆘 Troubleshooting

**"Permission denied" on setup.sh?**
```bash
chmod +x setup.sh
./setup.sh
```

**"Cannot run scripts" on setup.ps1?**
```powershell
# PowerShell as Administrator, then run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

**Missing npm?**
- Download Node.js from https://nodejs.org
- Restart terminal
- Run: `npm --version`

---

## ✅ Next Steps

After setup:
1. Read: `../docs/guides/START_HERE.md`
2. Create: `.env` file with your secrets
3. Run: `npm start`

---

**Location:** `/setup/` (these are automation scripts)
