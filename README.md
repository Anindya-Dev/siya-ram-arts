<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5cd7bab2-8dcb-4902-a18d-bf5d73d6d8ef

## Run Locally

**Prerequisites:** Node.js, Python 3.11+

1. Install frontend dependencies:
   `npm install`
2. Run the frontend:
   `npm run dev`

### Backend Setup (FastAPI)

1. Install Python dependencies:
   `pip install -r requirements.txt`
2. Apply migrations:
   `alembic upgrade head`
3. Run dev server:
   `uvicorn app.main:app --reload --port 8000`

> **Note on WeasyPrint (PDF Invoice Generation):**
> WeasyPrint requires system C-libraries (`libgobject-2.0-0`, Pango, Cairo). These are natively available on Linux systems (Docker/production containers). For local Windows development, you can either run the API inside WSL / a Linux container or manually install GTK3 for Windows runtime. If GTK libraries are not present on Windows, the API will boot cleanly and process all requests, but PDF invoice rendering will log a graceful warning fallback without crashing application startup.

