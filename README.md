# Sree Damodar Transports v3.0
### Transport Management System · Firebase Cloud · PWA

---

## What's New in v3.0
- ✅ **Google Sign-In** — Staff log in with their Google account
- ✅ **Real-time sync** — All devices see the same data instantly
- ✅ **Installable app** — Works like a native app on Android, iPhone, and Desktop
- ✅ **Works offline** — Opens even without internet after first load
- ✅ **PDF generation** — LR PDFs download automatically on save

---

## STEP 1 — Set up Firebase (takes ~10 minutes, free)

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it: `sree-damodar-transports`
4. Disable Google Analytics (not needed) → Click **"Create project"**

### 1.2 Enable Google Sign-In
1. In your Firebase project, click **"Authentication"** (left sidebar)
2. Click **"Get started"**
3. Click **"Google"** under Sign-in providers
4. Toggle **"Enable"**
5. Enter your support email
6. Click **"Save"**

### 1.3 Create Firestore Database
1. Click **"Firestore Database"** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select region: `asia-south1` (Mumbai) for best speed in India
5. Click **"Enable"**

### 1.4 Set Firestore Security Rules
1. In Firestore, click the **"Rules"** tab
2. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### 1.5 Get your Firebase Config
1. Click the **gear icon** (⚙️) next to "Project Overview" → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **Web icon** (`</>`)
4. App nickname: `sdt-web` → Click **"Register app"**
5. You'll see a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sree-damodar-transports.firebaseapp.com",
  projectId: "sree-damodar-transports",
  storageBucket: "sree-damodar-transports.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Copy these values into `src/firebase.ts` (replace the REPLACE_WITH_... placeholders)

### 1.6 Add your Render domain to Firebase
1. In Firebase → Authentication → **Settings** tab → **Authorized domains**
2. Click **"Add domain"**
3. Enter your Render URL: `sree-damodar-transports.onrender.com`
4. Click **"Add"**

---

## STEP 2 — Update the code

Open `src/firebase.ts` and replace all the `REPLACE_WITH_...` values with your actual Firebase config values from Step 1.5.

---

## STEP 3 — Push to GitHub & Deploy

```bash
git add .
git commit -m "Add Firebase + PWA"
git push
```

Render will automatically redeploy. ✅

---

## How staff install the app

### On Android (Chrome):
1. Open the app URL in Chrome
2. A banner appears: **"Add to Home screen"** → Tap it
3. App installs with the SDT icon, opens full screen

### On iPhone (Safari):
1. Open the app URL in Safari
2. Tap the **Share button** (□ with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**

### On Desktop (Chrome):
1. Open the app URL
2. Look for the **install icon** (⊕) in the address bar → Click it
3. App opens in its own window like a native app

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## How data sharing works

- All staff sign in with **their own Google account**
- All data is stored in **your Firebase project** (one shared database)
- Everyone sees the **same data in real-time** — if one person adds a booking, everyone else sees it within seconds
- Data is stored in Google's cloud servers — **you own your data**
- The free Firebase plan allows **50,000 reads / 20,000 writes per day** — more than enough for a transport business
