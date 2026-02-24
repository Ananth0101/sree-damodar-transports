# Sree Damodar Transports - Transport Management System

A full-featured transport management web app that runs entirely in your browser. All data is saved locally on the device using localStorage — no backend or database needed.

## Features
- ✅ Create & manage Lorry Receipts (LR) with PDF download
- ✅ Customer & Driver management
- ✅ Future Bookings / Enquiries
- ✅ Driver Payment Ledger
- ✅ Revenue Reports & CSV Export
- ✅ Works on Mobile & Desktop
- ✅ Data saved locally (no internet needed after load)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Render (Free Hosting)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sree-damodar-transports.git
git push -u origin main
```

### Step 2 — Deploy on Render
1. Go to https://render.com and sign in with GitHub
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repo
4. Settings are auto-detected from `render.yaml`:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Click **"Create Static Site"**
6. Your app will be live at `https://sree-damodar-transports.onrender.com` 🎉

### ⚠️ Important Note on Data
Since this is a static site, data is saved in the **browser's localStorage** on each device.
- Data is **not shared** between different devices/browsers
- Data **persists** across page refreshes on the same browser
- For multi-device sync, a future upgrade to a database backend would be needed

## Build
```bash
npm run build
```
Output is in the `dist/` folder.
