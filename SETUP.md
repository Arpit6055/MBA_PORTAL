# 🚀 MBA Aspirant Portal - Complete Setup Guide

Follow these steps to get the application running on your local machine.

---

## ✅ Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v14+) and **npm** - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** (Cloud Database) - [Sign Up](https://mongodb.com/cloud/atlas)
- **Git** (optional) - [Download](https://git-scm.com/)
- **A Gmail Account** (for OTP emails)

### Verify Installations
```bash
node --version      # Should be v14+
npm --version       # Should be v6+
```

---

## 📋 Step-by-Step Setup

### Step 1: Extract/Clone Project

```bash
cd "C:\Users\arpit\Desktop\New folder"
```

Or if using git:
```bash
git clone <repository-url>
cd mba-aspirant-portal
```

---

### Step 2: Install Node Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- Express, Pug, MongoDB driver, Nodemailer, etc.

Verify installation:
```bash
npm list | head -20
```

---

### Step 3: Setup MongoDB Database

The application uses **MongoDB Atlas** (Cloud Database). Collections are automatically created on startup.

#### Getting Your MongoDB Connection String:

1. **Sign Up / Log In to MongoDB:**
   - Visit https://mongodb.com/cloud/atlas
   - Create a free cluster or use existing cluster

2. **Get Connection String:**
   - In MongoDB Atlas → Click "Connect"
   - Choose "Drivers" → Select **Node.js**
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxx.mongodb.net/?appName=Cluster0`

3. **Replace Credentials:**
   - Replace `username` and `password` with your MongoDB Atlas username/password
   - Save this - you'll add it to `.env` in next step

**Important:** The application will automatically create all required collections on first run. No manual database initialization needed!

---

### Step 4: Configure Environment Variables

**1. Create `.env` file in project root:**

```bash
# Windows (PowerShell)
New-Item -Name ".env" -ItemType File

# OR macOS/Linux
touch .env
```

**2. Copy and modify `.env.example`:**

```bash
# Windows (PowerShell)
Copy-Item ".env.example" ".env"

# OR macOS/Linux
cp .env.example .env
```

**3. Edit `.env` with your credentials:**

**For MongoDB:**
- Use the connection string obtained from MongoDB Atlas in Step 3

**For Gmail SMTP:**

1. **Enable 2-Step Verification** on your Google Account:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

3. **Add to `.env`:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx    # 16-char password from Google
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Other Settings:**
```env
NODE_ENV=development
PORT=3000
SECRET_KEY=mba_portal_secret_2024
```

**Complete `.env` Example:**
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/?appName=Cluster0

# Gmail SMTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# App Config
NODE_ENV=development
PORT=3000
SECRET_KEY=mba_portal_secret_key_2024
```

---

### Step 5: Test Email Configuration

Before running the app, test if emails will send:

```bash
node -e "require('./config/emailService').testEmailConfiguration()"
```

**Expected Output:**
```
✓ Email configuration verified successfully
```

If you get an error, verify:
- Gmail credentials in `.env`
- 2-Step verification is enabled
- App password is correctly copied (no spaces)

---

### Step 6: Start the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     🎓 MBA Aspirant Portal - Server Started            ║
╠════════════════════════════════════════════════════════╣
║ Server Running on: http://localhost:3000
║ Environment: development
║ Database: MongoDB Atlas
║ Status: Connected ✓
╚════════════════════════════════════════════════════════╝
```

Open browser and visit: **http://localhost:3000**

---

## 🧪 Testing the Application

### Test 1: Home Page
- **URL:** `http://localhost:3000`
- **Expected:** Hero section with "Get Started" button

### Test 2: Login Flow
1. Click "Login with OTP"
2. Enter any email (e.g., `test@example.com`)
3. Click "Send OTP"
4. Check your email for 6-digit OTP
5. Enter OTP and submit
6. Should redirect to "Complete Profile" page

### Test 3: Profile Completion
1. Fill academic details (e.g., 10th: 90, 12th: 85, Grad: 80)
2. Verify 9/9/9 badge updates (9/8/8)
3. Fill work experience
4. Select target colleges
5. Click "Complete Profile"
6. Should redirect to dashboard

### Test 4: ROI Calculator
1. Click "ROI Calculator" in nav
2. Fill sample data:
   - Current Salary: ₹500,000
   - Tuition Fees: ₹2,000,000
   - Loan Amount: ₹1,500,000
   - Interest Rate: 8.5%
   - Post-MBA Salary: ₹1,500,000
3. Click "Calculate ROI"
4. Should display results

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'mongodb'"
**Solution:**
```bash
npm install mongodb --save
```

### Issue 2: "Database connection refused"
**Solution:**
- Verify your MONGODB_URI in `.env` is correct
- Ensure MongoDB Atlas cluster is accessible from your network
- Check username and password are URL-encoded (special characters like @ must be encoded)
- Whitelist your IP address in MongoDB Atlas → Network Access

### Issue 3: "ENOENT: no such file or directory, open '.env'"
**Solution:**
```bash
# Create .env file
touch .env  # macOS/Linux
# OR
New-Item -Name ".env" -ItemType File  # Windows PowerShell
```

### Issue 4: "Email not being sent"
**Solution:**
1. Check Gmail app password is correct (16 chars with spaces)
2. Verify 2-Step authentication is enabled
3. Try with a different Gmail account
4. Check spam/promotions folder

### Issue 5: "Port 3000 already in use"
**Solution:**
```bash
# Use different port
PORT=3001 npm run dev

# OR kill process using port 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000 | kill -9 <PID>
```

### Issue 6: "Collections already created"
**Solution:** Collections are auto-created on first startup if missing. This is normal and expected behavior.

---

## 📁 Project Structure Explanation

```
mba-portal/
├── config/
│   ├── db.js              # Database connection pool & helpers
│   └── emailService.js    # Email sending service via Nodemailer
│
├── models/
│   ├── UserModel.js       # All user-related database queries
│   └── OTPModel.js        # All OTP-related database queries
│
├── controllers/
│   └── authController.js  # Handles login, OTP verification
│
├── routes/
│   └── authRoutes.js      # API endpoints for authentication
│
├── views/                 # Pug templates
│   ├── layout.pug         # Master template
│   ├── login.pug          # OTP login form
│   ├── profile.pug        # User profile with 9/9/9
│   └── ...other pages
│
├── public/
│   └── style.css          # Custom CSS
│
├── scripts/
│   └── init-db.js         # Database initialization
│
├── app.js                 # Express app entry point
├── package.json          # Dependencies
├── .env                  # (Create this) Environment variables
├── .env.example          # Template for .env
└── README.md             # Full documentation
```

---

## 🔑 Key Features to Explore

### OTP Login (No Passwords)
- Secure email-based authentication
- 10-minute OTP expiry
- Rate limiting (max 3 attempts per 15 mins)

### Academic Profile 9/9/9
- Marks (10th/12th/Graduation) converted to single-digit grade
- Professional badge on profile
- Example: 92%/88%/75% = Badge "9/8/7"

### GD/PI War Room
- Group discussion topics with arguments
- Data points and statistics
- Category-based filtering

### ROI Calculator
- Calculate MBA investment returns
- Breakeven timeline
- 5-year financial projections

### Interview Experiences
- Real stories from successful candidates
- Filterable by college, year, stream
- Community voting system

---

## 📝 Next Steps (After Setup)

1. **Explore the codebase:**
   - Read `config/db.js` to understand data layer
   - Check `models/` for database queries
   - Review `controllers/` for business logic

2. **Extend functionality:**
   - Add profile update endpoints
   - Implement GD topics CRUD
   - Build experience submission form
   - Create admin panel

3. **Improve UI/UX:**
   - Add more Pug templates
   - Enhance CSS with animations
   - Build mobile app with React Native

4. **Production deployment:**
   - Set `NODE_ENV=production`
   - Use a hosting service (Heroku, AWS, Digital Ocean)
   - Configure HTTPS with SSL certificate
   - Set up database backups

---

## 💡 Tips & Best Practices

### Database Queries (MongoDB)
- Use the MongoDB Node.js driver for all database operations
- Always validate and sanitize user input before database queries
- Group related queries in model files
- Use `db.findOne()` for single documents, `db.findMany()` for multiple
- Leverage MongoDB's built-in security features (indexes, validation rules)

### Email Sending
- Use App Passwords with Gmail (not your actual password)
- Test email configuration before deployment
- Monitor email service for failures

### Session Security
- Keep `SECRET_KEY` strong and unique
- Use HTTPS in production (with `secure` cookie flag)
- Implement CSRF protection for forms

---

## 📚 Additional Resources

- [Express.js Guide](https://expressjs.com/)
- [Pug Template Docs](https://pugjs.org/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Nodemailer Docs](https://nodemailer.com/)
- [TailwindCSS Docs](https://tailwindcss.com/)

---

## ✨ You're All Set!

Your MBA Aspirant Portal should now be running. Visit **http://localhost:3000** and start exploring!

For any issues, check the troubleshooting section above or review the main `README.md` file.

**Happy coding! 🎓**
