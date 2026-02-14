# ⚡ Quick Start Guide - MBA Aspirant Portal

Get the application running in **5 minutes**.

---

## 1️⃣ Install Dependencies
```bash
npm install
```

---

## 2️⃣ Configure MongoDB

Collections are automatically created on startup. Just ensure your MongoDB URI is set correctly in `.env`.

---

## 3️⃣ Configure Email (.env)

1. Go to https://myaccount.google.com/apppasswords
2. Generate an App Password (16 characters)
3. Create `.env` file in project root:

```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.l1mmskm.mongodb.net/?appName=Cluster0

EMAIL_USER=YOUR_EMAIL@gmail.com
EMAIL_PASSWORD=YOUR_16_CHAR_PASSWORD
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

NODE_ENV=development
PORT=3000
SECRET_KEY=mba_portal_secret_2024
```

---

## 4️⃣ Start Application
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 5️⃣ Test Login Flow

1. Click **"Login with OTP"**
2. Enter email: `test@example.com`
3. Click **"Send OTP"**
4. Check your email for 6-digit OTP
5. Enter OTP → Logged in! ✅

---

## 🎯 What's Inside?

✅ **OTP-Based Login** - No passwords needed
✅ **User Profile** - Academics with 9/9/9 badge
✅ **GD/PI War Room** - Discussion topics database
✅ **Interview Experiences** - Real success stories
✅ **ROI Calculator** - Financial ROI analysis
✅ **Professional UI** - TailwindCSS + Responsive Design
✅ **Secure Database** - MongoDB with auto-collection creation
✅ **Email Service** - Gmail SMTP integration

---

## 📖 Full Documentation

- **Detailed Setup:** See `SETUP.md`
- **Architecture & Features:** See `README.md`

---

## 🆘 Common Issues

**"Email not sending?"**
- Verify Gmail app password (not regular password)
- Check 2-Step verification is enabled
- Confirm `.env` has correct `EMAIL_PASSWORD`

**"Database connection error?"**
- Verify MongoDB URI in `.env` is correct
- Ensure MongoDB Atlas cluster is accessible

**"Port 3000 in use?"**
- Use different port: `PORT=3001 npm run dev`

---

**Ready to code? Start exploring the files! 🚀**
