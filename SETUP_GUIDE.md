# ChordBook — Complete Setup & Hosting Guide

---

## FOLDER STRUCTURE

```
chordbook-backend/
├── server.js              ← Main backend file
├── package.json           ← Dependencies
├── .env                   ← MongoDB URL (secret!)
├── .gitignore             ← .env aur node_modules ignore karo
└── chord_app_with_backend.html  ← Frontend (browser wali file)
```

---

## STEP 1 — MongoDB Atlas Setup (FREE Cloud Database)

### 1.1 Account banao
1. Jao: https://www.mongodb.com/atlas
2. "Try Free" click karo
3. Email se signup karo

### 1.2 Free Cluster banao
1. "Build a Database" → **M0 FREE** select karo
2. Provider: AWS, Region: Mumbai (ap-south-1) — India ke liye fast
3. Cluster name: `ChordBook` → "Create" click karo

### 1.3 Database User banao
1. Left menu → "Database Access" → "Add New Database User"
2. Username: `chordbook_user`
3. Password: kuch strong (yaad rakhna!) e.g. `Chord@2024`
4. Role: "Read and write to any database"
5. "Add User" click karo

### 1.4 Network Access (IP Allow)
1. Left menu → "Network Access" → "Add IP Address"
2. "ALLOW ACCESS FROM ANYWHERE" click karo → 0.0.0.0/0 add hoga
3. Confirm karo

### 1.5 Connection String lo
1. Left menu → "Database" → "Connect"
2. "Connect your application" → Driver: Node.js
3. Copy karo — kuch aisa dikhega:
   ```
   mongodb+srv://chordbook_user:Chord@2024@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
4. Isme `/` ke baad database name add karo:
   ```
   mongodb+srv://chordbook_user:Chord@2024@cluster0.abc123.mongodb.net/chordbook?retryWrites=true&w=majority
   ```

---

## STEP 2 — Backend Local Setup

### 2.1 Node.js install karo
- Download: https://nodejs.org → LTS version (20.x)
- Install karo, restart terminal

### 2.2 Project folder setup
```bash
# Folder banao aur usme jao
mkdir chordbook-backend
cd chordbook-backend

# Saari files yahan copy karo (server.js, package.json, .env)
```

### 2.3 Dependencies install karo
```bash
npm install
```
Yeh install hoga: express, mongoose, cors, dotenv, nodemon

### 2.4 .env file update karo
```
MONGO_URI=mongodb+srv://chordbook_user:Chord@2024@cluster0.abc123.mongodb.net/chordbook?retryWrites=true&w=majority
PORT=3001
```
⚠️ APNA actual connection string daalna!

### 2.5 Server start karo
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

### 2.6 Test karo
Browser mein jao: http://localhost:3001/api/health
```json
{
  "success": true,
  "message": "ChordBook API chal raha hai! 🎸",
  "dbStatus": "Connected"
}
```
Agar yeh aaya — ✅ Backend ready hai!

---

## STEP 3 — Frontend Connect Karo

1. `chord_app_with_backend.html` browser mein kholo (double-click)
2. "Add Song" tab mein jao
3. Backend URL box mein type karo: `http://localhost:3001`
4. Header mein green dot aayega — ✅ Connected!
5. Ab gana add karo — directly MongoDB mein jayega!

---

## STEP 4 — HOSTING (Free mein!)

### Option A: Render.com (RECOMMENDED — Bilkul Free!)

**Backend host karo:**

1. GitHub pe account banao: https://github.com
2. Repository banao: "New" → Name: `chordbook-backend`
3. Files upload karo (server.js, package.json) — .env mat karo!
4. Render.com pe jao: https://render.com → Sign up with GitHub
5. "New Web Service" → GitHub repo connect karo
6. Settings:
   ```
   Name: chordbook-backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
7. "Environment Variables" mein:
   ```
   MONGO_URI = (apni MongoDB Atlas URL)
   PORT = 3001
   ```
8. "Create Web Service" → Deploy hoga
9. URL milegi: `https://chordbook-backend.onrender.com`

⚠️ Free plan mein 15 min baad server "sleep" ho jaata hai.
   Pehli request mein 30-60 sec lag sakta hai wake up mein.

---

**Frontend host karo (Netlify — Free!):**

1. Jao: https://netlify.com → Sign up
2. "Add new site" → "Deploy manually"
3. `chord_app_with_backend.html` drag & drop karo
4. Deploy hoga — URL milegi: `https://amazing-chordbook.netlify.app`
5. Site mein jao → Add Song → Backend URL: `https://chordbook-backend.onrender.com`

---

### Option B: Railway.app (Easier, $5/month credit free)

1. https://railway.app → GitHub se login
2. "New Project" → "Deploy from GitHub repo"
3. Environment variables add karo (MONGO_URI)
4. Automatically deploy hoga with HTTPS URL

---

### Option C: Local Network (Ghar/Church mein use ke liye)

Agar sirf apne WiFi network pe use karna hai:

```bash
# Apna computer ka IP pata karo
# Windows:
ipconfig   → "IPv4 Address" e.g. 192.168.1.5

# MacOS/Linux:
ifconfig   → inet address
```

Server chalao, phir kisi bhi phone/tablet mein:
`http://192.168.1.5:3001/api/health`

Frontend file mein API URL: `http://192.168.1.5:3001`

---

## QUICK REFERENCE — API Endpoints

| Method | URL | Kya karta hai |
|--------|-----|----------------|
| GET | /api/songs | Saare songs lo |
| GET | /api/songs?search=grace | Search karo |
| GET | /api/songs/:id | Ek song lo (lyrics ke saath) |
| POST | /api/songs | Naya song save karo |
| PUT | /api/songs/:id | Song update karo |
| DELETE | /api/songs/:id | Song delete karo |
| GET | /api/health | Server status check |

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Cannot connect to MongoDB" | .env mein MONGO_URI check karo |
| "CORS error" browser mein | server.js mein origin: '*' hai, theek hai |
| Render pe deploy nahi hua | package.json mein "start": "node server.js" check karo |
| Songs dikh nahi rahe | API URL correct hai? /api/health test karo |
| .env gitignore mein daalna | `.gitignore` file mein `.env` likhna |
