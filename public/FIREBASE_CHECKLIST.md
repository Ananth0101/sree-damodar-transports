# 🔍 Firebase Settings Checklist - Fix "Requested Action is Invalid"

## The Problem
You're seeing a white page with "requested action is invalid" after Google sign-in. This happens when Firebase OAuth settings are not configured correctly.

---

## ✅ COMPLETE THIS CHECKLIST (Step by Step)

### Part 1: Check Google Sign-In Provider

1. Go to: https://console.firebase.google.com
2. Click your project: **"sree-damodar-transports"**
3. Click **"Authentication"** in left sidebar
4. Click **"Sign-in method"** tab (at the top)
5. Find **"Google"** in the list
6. Click on **"Google"** (the row, not the toggle)
7. You should see a popup/page with these settings:

**CHECK THESE:**
- [ ] **Status:** Is the toggle at the top turned ON (blue)? ✅
- [ ] **Project support email:** Is an email filled in?
- [ ] **Web SDK configuration:** Do you see a "Web client ID"?

8. Click **"Save"** (even if you didn't change anything)

---

### Part 2: Check Authorized Domains

Still on the Firebase Console:

1. Stay in **"Authentication"** section
2. Click the **"Settings"** tab (next to "Sign-in method" and "Usage")
3. Scroll down to **"Authorized domains"** section
4. Look at the list of domains

**YOU SHOULD SEE THESE THREE DOMAINS:**
- [ ] `localhost` (for local testing)
- [ ] `sree-damodar-transports.firebaseapp.com` (Firebase default)
- [ ] `sree-damodar-transports.onrender.com` (YOUR RENDER DOMAIN) ⭐ MOST IMPORTANT

**If `sree-damodar-transports.onrender.com` is NOT in the list:**

5. Click **"Add domain"**
6. Type EXACTLY: `sree-damodar-transports.onrender.com`
7. Click **"Add"**
8. Wait 2-3 minutes for it to take effect

---

### Part 3: Double-Check OAuth Settings (IMPORTANT!)

This is the part most people miss:

1. In Firebase Console, stay in **"Authentication"** → **"Sign-in method"** tab
2. Click on **"Google"** provider again
3. Look for a section called **"Web client ID"** or **"OAuth 2.0 client ID"**
4. Click **"Web SDK configuration"** (might be collapsed/minimized)

You should see something like:
```
Web client ID: 918174781719-xxxxxxxxxxxxx.apps.googleusercontent.com
```

5. Now, click the link that says **"Google Cloud Console"** or **"Configure OAuth consent screen"**
6. This opens Google Cloud Console
7. Look for **"Authorized redirect URIs"** or **"Redirect URIs"**

**ADD THESE REDIRECT URIs:**
- [ ] `https://sree-damodar-transports.firebaseapp.com/__/auth/handler`
- [ ] `https://sree-damodar-transports.onrender.com/__/auth/handler`

If these are missing, that's your problem!

8. Click **"Save"**

---

### Part 4: Clear and Test

**On your phone:**

1. **Clear browser data:**
   - **iPhone:** Settings → Safari → Clear History and Website Data
   - **Android:** Chrome → Settings → Privacy → Clear browsing data → Check "Cookies" and "Cached images"

2. **Close all browser tabs**

3. **Wait 5 minutes** (for Firebase/Google to sync changes)

4. **Open in INCOGNITO/PRIVATE mode:**
   - iPhone Safari: Tap tabs icon → "Private"
   - Android Chrome: Menu (⋮) → "New incognito tab"

5. Go to: `https://sree-damodar-transports.onrender.com`

6. Click "Sign in with Google"

7. Should work now! ✅

---

## 🚨 STILL NOT WORKING?

### Let me know EXACTLY what you see:

Take screenshots of these and share with me:

1. **Firebase Console** → Authentication → Sign-in method → Google provider settings
2. **Firebase Console** → Authentication → Settings → Authorized domains list
3. **The error page** on your phone (the white page with error)
4. **Your browser's URL** when the error appears (copy the full URL from address bar)

---

## 📸 What Each Screen Should Look Like

### Screen 1: Google Sign-In Provider
```
Google                                                [Toggle ON/Blue]
─────────────────────────────────────────────────────────────────
Status: Enabled
Project support email: your-email@gmail.com
Web SDK configuration: 
  Web client ID: 918174781719-xxxxx.apps.googleusercontent.com
```

### Screen 2: Authorized Domains
```
Authorized domains
──────────────────────────────────────────────────────────
localhost
sree-damodar-transports.firebaseapp.com
sree-damodar-transports.onrender.com          [Add domain]
```

### Screen 3: What You Should See (Success)
```
After clicking "Sign in with Google":
1. Redirects to Google → Shows your Google accounts
2. You pick an account
3. Redirects back to your app
4. You're logged in! ✅
```

---

## 💡 Common Mistakes

❌ **Typo in domain name** - must be EXACT: `sree-damodar-transports.onrender.com`
❌ **Forgetting to click "Save"** after adding domain
❌ **Not waiting** - changes take 2-5 minutes to sync
❌ **Testing in same browser without clearing cache**
❌ **Wrong OAuth redirect URI** in Google Cloud Console

---

## Need Help?

If still stuck, tell me:
1. Did you find the "Authorized domains" section? (Yes/No)
2. Is `sree-damodar-transports.onrender.com` in the list? (Yes/No)
3. What's the exact URL in your browser when error appears? (copy-paste it)
4. Are you testing on phone or computer?
