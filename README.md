# Suno Prompt Desk

Structured Suno prompt + track-progression-sheet builder. Vite (vanilla TS) static build, served by a tiny Express server that also stores every saved prompt as a file.

## Run
```bash
npm install
npm run dev       # Vite dev server (http://localhost:5173) + API on :3000
npm run build     # static build to dist/
npm start         # serve dist/ + API on http://localhost:3000
```

## Storage
- **Server:** write-only. `POST /api/prompts` stores `data/prompts/<userId>/<id>.json` (+ a readable `.txt`). There is no endpoint to read or delete prompts.
- **Browser:** history, draft settings and an anonymous user id live in `localStorage` only.

Prompts are capped at 1000 characters. Progression sheets are emitted line by line as `[m:ss-m:ss Section: description, energy]`.

## Analytics & imprint
- `/imprint.html` (also `/imprint`) holds the imprint and privacy notes — contact details are filled in.
- Plausible is loaded **only after** the visitor accepts the consent bar. Set `VITE_PLAUSIBLE_DOMAIN` in `.env` (see `.env.example`); leave it empty to disable analytics and the bar entirely. "Analytics settings" in the footer reopens the bar.

## Docker
```bash
# production: reads .env.production (copy from .env.production.example)
docker compose --env-file .env.production up -d --build

# development: Vite with HMR on :5173 (+ API on :3000), source bind-mounted
docker compose -f docker-compose.dev.yml up --build
```
Production build args (`VITE_SITE_URL` for canonical/sitemap/share links, `VITE_PLAUSIBLE_DOMAIN`, `VITE_PLAUSIBLE_SRC`) come from `.env.production`; `.env` is only used for local development. They are baked into the bundle at build time.

### Publish to GHCR
```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u daspete --password-stdin
scripts/publish-image.sh            # uses .env.production; tags latest + git sha
scripts/publish-image.sh v1.0.0     # tags latest + v1.0.0
PLATFORMS=linux/amd64,linux/arm64 scripts/publish-image.sh   # multi-arch via buildx
```
Deploy elsewhere with `docker compose pull && docker compose up -d` (the compose file references `ghcr.io/daspete/promptdesk:latest`).
