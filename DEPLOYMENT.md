# Deploying FinPaluse to Render.com

This guide provides step-by-step instructions to deploy the entire **FinPaluse** stack (FastAPI Backend + React Frontend) to **[Render.com](https://render.com)**.

---

## Method 1: Automated Deployment via Render Blueprint (Recommended)

Render Blueprints let you deploy the backend and frontend together automatically using the included `render.yaml` configuration.

### Steps:
1. Go to **[dashboard.render.com](https://dashboard.render.com)**.
2. Click **New +** → Select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/httpsghsthakur/FinPaluse`.
4. Render will automatically detect `render.yaml` and create two services:
   - **`finpaluse-backend`** (Python Web Service)
   - **`finpaluse-frontend`** (Static Site)
5. Click **Apply**.
6. Render will automatically build the backend, install Python ML dependencies, start the FastAPI server, build the React SPA, and configure routing.

---

## Method 2: Manual Dashboard Setup

If you prefer to configure each service manually in the Render dashboard:

### Step A: Deploy the Backend (Web Service)

1. Go to **Render Dashboard** → Click **New +** → Select **Web Service**.
2. Connect your repo: `https://github.com/httpsghsthakur/FinPaluse`.
3. Configure settings:
   - **Name**: `finpaluse-backend`
   - **Region**: Select closest to you (e.g., `Oregon (US West)`)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Add **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` |
   | `ENVIRONMENT` | `production` |
   | `DEBUG` | `false` |
   | `SEED_DEMO_DATA` | `true` |
   | `CORS_ORIGINS` | `*` |
   | `DATABASE_URL` | `sqlite+aiosqlite:///./finpilot.db` |
   | `DATABASE_URL_SYNC` | `sqlite:///./finpilot.db` |
   | `SECRET_KEY` | *(Generate a random 32+ char secret)* |
5. Click **Create Web Service**.
6. Copy your backend URL once live (e.g., `https://finpaluse-backend.onrender.com`).

---

### Step B: Deploy the Frontend (Static Site)

1. Go to **Render Dashboard** → Click **New +** → Select **Static Site**.
2. Connect the same repo: `https://github.com/httpsghsthakur/FinPaluse`.
3. Configure settings:
   - **Name**: `finpaluse-frontend`
   - **Root Directory**: Leave blank (root of repo)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Redirect / Rewrite Rules** (Under Settings → Redirects/Rewrites):
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Add **Environment Variable**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://finpaluse-backend.onrender.com/api/v1` *(replace with your backend URL)* |
6. Click **Create Static Site**.

---

## Verifying the Deployment

1. Open your backend health URL:
   ```
   https://finpaluse-backend.onrender.com/health
   # Returns: {"status": "healthy"}
   ```
2. Open interactive Swagger API documentation:
   ```
   https://finpaluse-backend.onrender.com/docs
   ```
3. Open the frontend URL in your browser:
   ```
   https://finpaluse-frontend.onrender.com
   ```

---

## Free-Tier Note: Spin-Down Behavior
On Render's Free tier, web services spin down after 15 minutes of inactivity. When a new request arrives, it may take 30–50 seconds for the backend instance to spin back up.
