# MBA Aspirant Portal

**A comprehensive platform for MBA aspirants: GD/PI war room, interview experiences, ROI calculator, and college intelligence.**

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Windows (PowerShell)
.\setup\setup.ps1

# Mac/Linux (Bash)
bash setup/setup.sh
```

Interactive menu guides you through everything.

### Option 2: Manual Setup

```bash
npm install
npm run init-db
npm start
```

Visit: http://localhost:3000

---

## 📚 Documentation

**All documentation is in the `/docs` folder.**

| Need | Read |
|------|------|
| Quick setup (5 min) | [docs/guides/START_HERE.md](docs/guides/START_HERE.md) |
| Environment setup | [docs/guides/SETUP_ENV.md](docs/guides/SETUP_ENV.md) |
| All commands | [docs/guides/QUICK_START.md](docs/guides/QUICK_START.md) |
| Security guide | [docs/security/SECURITY.md](docs/security/SECURITY.md) |
| Architecture | [docs/architecture/ARCHITECTURE_REDESIGN.md](docs/architecture/ARCHITECTURE_REDESIGN.md) |
| Database schema | [docs/architecture/DATABASE_SCHEMAS.md](docs/architecture/DATABASE_SCHEMAS.md) |
| API endpoints | [docs/api/API_ROUTES.md](docs/api/API_ROUTES.md) |
| Which doc to read? | [docs/guides/DOCS_GUIDE.md](docs/guides/DOCS_GUIDE.md) |

---

## 📂 Folder Structure

```
/docs                 - All documentation
  /security          - Security guides & .env template
  /guides            - Quick start & daily reference
  /architecture      - System design documents
  /api               - API specification

/setup                - Automated setup scripts
  setup.ps1          - Windows PowerShell setup
  setup.sh           - Mac/Linux Bash setup
  setup-security.ps1 - Security-only setup
  README.md          - Setup instructions

/config              - Configuration files
/controllers         - Route handlers
/models              - Database models
/routes              - API routes
/scripts             - Utility scripts
/views               - Pug templates
/public              - Static files (CSS, JS)
```

---

## 🔒 Security First

All secrets go in `.env` (not in code). Create it from template:

```bash
cp docs/security/.env.example .env
# Edit .env and add your secrets
```

See [docs/security/SECURITY.md](docs/security/SECURITY.md) for complete security guide.

---

## 📖 For Developers

- **Backend Dev?** → Read [docs/architecture/DATABASE_SCHEMAS.md](docs/architecture/DATABASE_SCHEMAS.md) & [docs/api/API_ROUTES.md](docs/api/API_ROUTES.md)
- **Scraper Dev?** → Read [docs/architecture/SCRAPER_ARCHITECTURE.md](docs/architecture/SCRAPER_ARCHITECTURE.md)
- **Frontend Dev?** → Read [docs/api/API_ROUTES.md](docs/api/API_ROUTES.md)
- **DevOps/Ops?** → Read [docs/security/PRODUCTION_CHECKLIST.md](docs/security/PRODUCTION_CHECKLIST.md)

---

## 🆘 Confused?

→ Check [docs/guides/DOCS_GUIDE.md](docs/guides/DOCS_GUIDE.md) - it tells you which doc to read based on your role.

---

**Status:** Production ready | **Last Updated:** Feb 14, 2026

  - Star ratings and bookmark functionality

### 4. **Interview Experiences**
- User-submitted stories from successful candidates
- Filterable by:
  - College
  - Year
  - Stream/Background
- Tags like #StressInterview, #RapidFire
- Likes, views, and voting system

### 5. **ROI Calculator**
- **Inputs:**
  - Current pre-MBA salary
  - Total tuition fees
  - Education loan amount
  - Loan interest rate
  - Estimated post-MBA salary

- **Calculations:**
  - Total Investment = Fees + (Current Salary × 2) + Loan Interest
  - Annual Salary Increase = Post-MBA Salary - Current Salary
  - Breakeven = Total Investment / Annual Increase
  - 5-Year ROI = ((Post-MBA Salary × 5) - (Current Salary × 5)) / Total Investment

---

## 📁 Directory Structure

```
mba-portal/
├── config/
│   ├── db.js              # Database connection & centralized queries
│   └── emailService.js    # Email sending via Nodemailer
│
├── controllers/
│   ├── authController.js  # OTP login, verification, logout
│   ├── profileController.js
│   ├── gdController.js
│   ├── roiController.js
│   └── experienceController.js
│
├── models/
│   ├── UserModel.js       # User table queries
│   ├── OTPModel.js        # OTP table queries
│   ├── GDTopicModel.js
│   ├── ExperienceModel.js
│   └── ROIModel.js
│
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── profileRoutes.js
│   ├── gdRoutes.js
│   └── experienceRoutes.js
│
├── views/
│   ├── layout.pug         # Master template
│   ├── index.pug          # Home page
│   ├── login.pug          # OTP login form
│   ├── dashboard.pug
│   ├── profile.pug        # User profile with 9/9/9
│   ├── complete-profile.pug
│   ├── gd-war-room.pug
│   ├── experiences.pug
│   ├── roi-calculator.pug
│   ├── 404.pug
│   └── 500.pug
│
├── public/
│   └── style.css          # Custom CSS
│
├── app.js                 # Main Express app
├── package.json
├── .env.example          # Environment template
├── .gitignore
└── README.md             # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v14+ and **npm**
- **MongoDB Atlas Account** (Cloud Database)
- **Gmail Account** (for OTP emails via SMTP)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `pug` - Template engine
- `mongodb` - MongoDB driver
- `nodemailer` - Email sending
- `express-session` - Session management
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

### Step 2: Database Setup

**MongoDB Atlas Cluster:**
The application automatically connects to MongoDB and creates collections on startup if they don't exist.

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.l1mmskm.mongodb.net/?appName=Cluster0

# Gmail SMTP (Using App Password)
# Docs: https://myaccount.google.com/apppasswords
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Application
NODE_ENV=development
PORT=3000
SECRET_KEY=mba_portal_secret_2024
```

### Step 4: Start the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

---

## 📊 Database Schema Overview

**MongoDB Collections** (auto-created on startup):

### users
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "is_verified": true,
  "acad_10th": 8.5,
  "acad_12th": 8.2,
  "acad_grad": 7.8,
  "acad_stream": "Engineering",
  "current_company": "TCS",
  "work_ex_months": 24,
  "target_colleges": ["IIM-A", "XLRI"],
  "profile_complete": true,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### otps
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "otp_code": "123456",
  "expires_at": ISODate,
  "is_used": false,
  "created_at": ISODate
}
```

### gdTopics
```json
{
  "_id": ObjectId,
  "title": "Climate Change Impact",
  "category": "Current Affairs",
  "context": "Discussion about climate policies",
  "for_arguments": ["Point 1", "Point 2"],
  "against_arguments": ["Counter 1", "Counter 2"],
  "data_points": ["Stat 1", "Stat 2"],
  "created_by": ObjectId,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### experiences
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "college_name": "IIM-A",
  "experience_year": 2024,
  "stream": "Engineering",
  "content": "My interview experience...",
  "tags": ["Stress", "Rapid-Fire"],
  "is_approved": true,
  "likes": 42,
  "views": 120,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### rois
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "current_salary": 700000,
  "tuition_fees": 2500000,
  "loan_amount": 1500000,
  "interest_rate": 7.5,
  "estimated_post_mba_salary": 1800000,
  "breakeven_months": 36,
  "created_at": ISODate
}
```

---

## 🔒 Authentication Flow

```
1. User visits /login
   ↓
2. Enters email → POST /api/auth/request-otp
   ↓
3. Email validation & rate limiting check
   ↓
4. OTP generated, stored, and sent via email
   ↓
5. User enters 6-digit OTP
   ↓
6. POST /api/auth/verify-otp
   ↓
7. OTP validation & user verification
   ↓
8. Session created, user logged in
   ↓
9. Redirect to /complete-profile (new user) or /dashboard (existing)
```

---

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Copy the 16-character password to `.env` as `EMAIL_PASSWORD`

### Other SMTP Providers
Update `SMTP_HOST` and `SMTP_PORT` in `.env`:

**Outlook:**
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Zoho:**
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
```

---

## 🎓 The 9/9/9 Academic Format

Marks are converted from percentage to 0-9 scale:

| Percentage | Grade |
|-----------|-------|
| 90-100%   | 9     |
| 80-89%    | 8     |
| 70-79%    | 7     |
| 60-69%    | 6     |
| 50-59%    | 5     |
| 40-49%    | 4     |
| 30-39%    | 3     |
| 20-29%    | 2     |
| 10-19%    | 1     |
| 0-9%      | 0     |

**Example:**
- 10th: 92% → 9
- 12th: 88% → 8
- Grad: 75% → 7
- **Badge Display: 9/8/7**

---

## 🛠️ Implementation Notes

### Single Source of Truth (Database)
All SQL queries are centralized in `/models` directory. Controllers call model methods, never execute raw SQL. This ensures:
- ✅ Consistent query structure
- ✅ Easy to audit database operations
- ✅ Simple to add logging/caching
- ✅ Reusable query patterns

### Example (Auth Flow):
```javascript
// Controller calls model
const user = await UserModel.findByEmail(email);
const otpRecord = await OTPModel.createOTP(email, 10);
await sendOTPEmail(email, otpRecord.otp_code);

// Model contains SQL
// models/UserModel.js
static async findByEmail(email) {
  return await db.getOne('SELECT * FROM users WHERE email = $1', [email]);
}
```

### Session Management
- Uses `express-session` middleware
- Sessions persist in database (`sessions` table)
- HTTP-only cookies prevent XSS attacks
- 24-hour session expiry (configurable)

### Security Features
- ✅ OTP-based auth (no passwords)
- ✅ Rate limiting on OTP requests
- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Session validation for protected routes
- ✅ Email verification before account access
- ✅ HTTPS support in production (secure cookies)

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/request-otp      - Request OTP
POST   /api/auth/verify-otp       - Verify OTP & login
POST   /api/auth/resend-otp       - Resend OTP
GET    /api/auth/logout           - Logout
GET    /api/auth/me               - Get current user
```

### Profile (To be implemented)
```
GET    /api/profile               - Get user profile
PUT    /api/profile               - Update profile
POST   /api/profile/colleges      - Save target colleges
```

### GD Topics (To be implemented)
```
GET    /api/gd-topics             - List topics
GET    /api/gd-topics/:id         - Get single topic
POST   /api/gd-topics/:id/vote    - Vote on arguments
```

### Experiences (To be implemented)
```
GET    /api/experiences           - List experiences  (filterable)
POST   /api/experiences           - Create experience
```

---

## 🎨 Frontend (Pug Templating)

### Template Hierarchy
```
layout.pug (Master template with nav/footer)
├── index.pug (Home)
├── login.pug (OTP login)
├── dashboard.pug
├── profile.pug (9/9/9 implementation)
├── gd-war-room.pug
├── experiences.pug
└── roi-calculator.pug
```

### TailwindCSS Integration
Uses Tailwind CDN for utility-first CSS:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Gradients, spacing, and responsive design achieved with Tailwind classes.

---

## 📱 Responsive Design

- Mobile-first approach
- Grid layouts adapt from 1 column (mobile) to 3 columns (desktop)
- Touch-friendly OTP input boxes
- Responsive navigation menu
- Tested on all major devices and browsers

---

## 🧪 Testing Credentials

After setup, you can test with:
- Email: `test@example.com`
- OTP: Check email (valid for 10 minutes)

---

## 🚢 Deployment

### Local Production Build
```bash
NODE_ENV=production npm start
```

### Cloud Deployment (Heroku, AWS, Railway, etc.)
1. Set up your cloud hosting account
2. Configure environment variables (especially `MONGODB_URI`)
3. Ensure your MongoDB Atlas cluster allows connections from your cloud provider's IP
4. Deploy using your hosting provider's deployment method

**Example with Heroku:**
```bash
heroku create mba-aspirant-portal
git push heroku main
heroku config:set MONGODB_URI=your_atlas_uri
heroku open
```

**Example with Railway:**
```bash
railway up
# Set environment variables in Railway dashboard
```

---

## 📚 Future Enhancements

- [ ] Mock GD/PI sessions with AI coaching
- [ ] Video interview tutorial library
- [ ] Discussion forum for aspirants
- [ ] Performance analytics dashboard
- [ ] SMS OTP option
- [ ] Social login (Google, LinkedIn)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Payment integration for premium features
- [ ] Admin panel for content management

---

## 🐛 Troubleshooting

### Email not sending?
```bash
# Test email configuration
node -e "require('./config/emailService').testEmailConfiguration()"
```

### Database connection refused?
```bash
# Verify MONGODB_URI in .env is correct
# Ensure MongoDB Atlas allows your IP address
# Check connection string format
```

### OTP expired too quickly?
Change expiry in `models/OTPModel.js`:
```javascript
createOTP(email, 15) // 15 minutes instead of 10
```

---

## 📞 Support

For issues or questions:
1. Check MongoDB Atlas connection
2. Verify `.env` file configuration
3. Review application logs
4. Check server startup output for connection status

---

## 📄 License

MIT License - Feel free to modify and use for educational purposes.

---

**Built with ❤️ for MBA Aspirants**

Last Updated: February 2024
