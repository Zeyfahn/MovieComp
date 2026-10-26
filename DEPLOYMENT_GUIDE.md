# 🎬 MovieComp — Deployment Guide

> Deploy the **frontend** on **Vercel** and the **backend** on **Render** for free.

---

## 📋 Prerequisites

| Tool | Purpose |
|------|---------|
| [GitHub Account](https://github.com) | Host your code for CI/CD |
| [Vercel Account](https://vercel.com) | Host the React frontend (free) |
| [Render Account](https://render.com) | Host the Express backend (free) |
| [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) | Cloud MongoDB database (free tier) |
| [TMDB API Key](https://www.themoviedb.org/settings/api) | Live movie data (free) |

---

## 🗂️ Step 0 — Push Your Code to GitHub

If you haven't already, create a GitHub repository and push:

```bash
# From the project root: c:\Users\zohai\OneDrive\Desktop\Movie_Comp
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/movie-comp.git
git push -u origin main
```

> **Important:** Ensure your `.gitignore` excludes `node_modules/`, `.env`, and `server/.env` — these are already configured in the project.

---

## 🗄️ Step 1 — Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Click **"Build a Database"** → Choose the **Free (M0)** tier → Select your nearest region.
3. Set a **username** and **password** for your database user. Save these.
4. Under **Network Access**, click **"Add IP Address"** → choose **"Allow Access from Anywhere"** (`0.0.0.0/0`). This is required for Render.
5. Click **Connect** → **"Connect your application"** → Copy the connection string.  
   It will look like:  
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your Atlas credentials.
7. Add a database name at the end, e.g.:  
   ```
   mongodb+srv://zohaib:mypassword@cluster0.xxxxx.mongodb.net/movie_comp?retryWrites=true&w=majority
   ```

---

## 🎬 Step 2 — Get a TMDB API Key (Optional but Recommended)

Without a TMDB API key, the app uses a **built-in fallback catalog of 40+ curated movies** — this works perfectly for demos. For live data:

1. Go to [TMDB API Settings](https://www.themoviedb.org/settings/api).
2. Create an account → request an API key → choose **Developer**.
3. Copy the **API Key (v3 auth)**.

---

## 🚀 Step 3 — Deploy the Backend on Render

### 3.1 Create a New Web Service

1. Go to [render.com](https://render.com) → Click **"New"** → **"Web Service"**.
2. Connect your GitHub account and select your `movie-comp` repository.

### 3.2 Configure the Service

| Field | Value |
|-------|-------|
| **Name** | `movie-comp-api` (or any name) |
| **Region** | Closest to your users |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 3.3 Set Environment Variables

In the Render dashboard, go to your service → **"Environment"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your full Atlas connection string from Step 1 |
| `JWT_SECRET` | A long random string (e.g. `movie_comp_prod_jwt_secret_2026_abc123xyz`) |
| `TMDB_API_KEY` | Your TMDB API key (leave blank to use fallback catalog) |
| `CLIENT_URL` | Your Vercel URL (e.g. `https://movie-comp.vercel.app`) — **set after Step 4** |

### 3.4 Deploy

Click **"Create Web Service"**. Render will build and deploy automatically. Wait ~2-3 minutes.

Once deployed, your backend URL will be something like:
```
https://movie-comp-api.onrender.com
```

> **Note:** On the free Render plan, services "spin down" after 15 minutes of inactivity and take ~30 seconds to wake up on the first request. This is normal.

---

## ⚡ Step 4 — Deploy the Frontend on Vercel

### 4.1 Create a New Project

1. Go to [vercel.com](https://vercel.com) → Click **"Add New"** → **"Project"**.
2. Import your GitHub repository.

### 4.2 Configure the Project

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |
| **Install Command** | `npm install` (default) |

### 4.3 Set Environment Variables

In Vercel project settings → **"Environment Variables"**:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://movie-comp-api.onrender.com/api` (your Render backend URL + `/api`) |

### 4.4 Deploy

Click **"Deploy"**. Vercel will build and deploy automatically. After ~1-2 minutes, you'll get a URL like:
```
https://movie-comp.vercel.app
```

---

## 🔗 Step 5 — Connect Frontend ↔ Backend (CORS Fix)

Go back to your **Render backend** service → **Environment** → Update:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://movie-comp.vercel.app` (your actual Vercel URL) |

Click **"Save Changes"**. Render will automatically redeploy.

---

## ✅ Step 6 — Verify Everything Works

Open your Vercel URL and test:

- [ ] Home page loads with movie cards
- [ ] Mood filter chips work (movies reorder)
- [ ] Register a new account
- [ ] Log in with your account
- [ ] Add movies to watchlist
- [ ] Open Movie Comp Arena → select 2 movies → run comparison
- [ ] Open Recommendations page
- [ ] Backend health check: `https://movie-comp-api.onrender.com/api/health`

---

## 🛠️ Troubleshooting

### ❌ Frontend shows "Unable to reach movie data service"

- Check your Render backend is running. Visit `https://YOUR_BACKEND.onrender.com/api/health`
- On the **free Render plan**, the first request after inactivity takes ~30 seconds. Wait and retry.
- Verify `VITE_API_BASE_URL` is set correctly in Vercel environment variables.

### ❌ Authentication / Watchlist doesn't work

- Check `MONGODB_URI` is correct in Render environment variables.
- Check MongoDB Atlas network access allows `0.0.0.0/0`.
- If MongoDB connection fails, the server falls back to **in-memory storage** (data is lost on restart). This is expected behavior without Atlas.

### ❌ CORS error in browser console

- Verify `CLIENT_URL` in Render matches your exact Vercel URL (including `https://`).
- Redeploy the Render service after updating the environment variable.

### ❌ Vercel build fails

- Ensure the Vercel **Root Directory** is set to `client`.
- Run `npm run build` locally in `client/` to check for build errors first.

### ❌ No movies showing up (only loading spinner)

- The app uses a **built-in fallback catalog** of 40+ movies even without TMDB API.
- If still failing, check your browser console for network errors and verify the backend URL.

---

## 📁 Project Structure Reference

```
Movie_Comp/
├── client/           ← React + Vite frontend (deploy to Vercel)
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── server/           ← Express.js backend (deploy to Render)
│   ├── src/
│   │   ├── server.js
│   │   ├── services/
│   │   ├── controllers/
│   │   └── routes/
│   └── package.json
└── package.json      ← Root (dev convenience scripts only)
```

---

## 🔄 Continuous Deployment

Both Vercel and Render automatically redeploy when you push to the `main` branch on GitHub. Your workflow:

```bash
# Make changes, then:
git add .
git commit -m "your change description"
git push origin main
# Both frontend and backend redeploy automatically ✨
```

---

## 💰 Cost Summary

| Service | Free Tier Limits |
|---------|-----------------|
| **Vercel** | Unlimited deployments, 100GB bandwidth/month |
| **Render** | 750 hours/month (enough for 1 service), spins down after 15min |
| **MongoDB Atlas** | 512MB storage, shared cluster |
| **TMDB API** | Unlimited requests (rate limited) |

All services above are **completely free** for a personal/academic project of this scale.

---

*Built for End-Term Software Project — Mohammed Zohaib*
