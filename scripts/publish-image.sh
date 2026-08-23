#!/usr/bin/env bash
# Build the production image and push it to GitHub Container Registry.
#
# Usage:
#   scripts/publish-image.sh                # tags: latest + git short sha (or date if not a git repo)
#   scripts/publish-image.sh v1.2.0         # tags: latest + v1.2.0
#   PLATFORMS=linux/amd64,linux/arm64 scripts/publish-image.sh   # multi-arch build
#
# Login first (a GitHub token with write:packages):
#   echo "$GITHUB_TOKEN" | docker login ghcr.io -u daspete --password-stdin
#
# Build-time config is read from .env.production (VITE_SITE_URL, VITE_PLAUSIBLE_DOMAIN, VITE_PLAUSIBLE_SRC).
# Override with ENV_FILE=path/to/file.
set -euo pipefail

IMAGE="ghcr.io/daspete/promptdesk"
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env.production}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found — copy .env.production.example and fill it in" >&2
  exit 1
fi
# load only the VITE_* build args from the env file
set -a; source <(grep -E '^(VITE_SITE_URL|VITE_PLAUSIBLE_DOMAIN|VITE_PLAUSIBLE_SRC)=' "$ENV_FILE"); set +a
if [[ -z "${VITE_SITE_URL:-}" ]]; then
  echo "✗ VITE_SITE_URL is not set in $ENV_FILE" >&2
  exit 1
fi

if [[ $# -ge 1 ]]; then
  VERSION_TAG="$1"
elif git rev-parse --short HEAD >/dev/null 2>&1; then
  VERSION_TAG="$(git rev-parse --short HEAD)"
else
  VERSION_TAG="$(date +%Y%m%d-%H%M)"
fi

PLATFORMS="${PLATFORMS:-}"
BUILD_ARGS=(
  --build-arg "VITE_SITE_URL=${VITE_SITE_URL:-}"
  --build-arg "VITE_PLAUSIBLE_DOMAIN=${VITE_PLAUSIBLE_DOMAIN:-}"
  --build-arg "VITE_PLAUSIBLE_SRC=${VITE_PLAUSIBLE_SRC:-}"
  --label "org.opencontainers.image.source=https://github.com/daspete/promptdesk"
  --label "org.opencontainers.image.version=${VERSION_TAG}"
  --label "org.opencontainers.image.created=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  -t "${IMAGE}:latest"
  -t "${IMAGE}:${VERSION_TAG}"
)

echo "→ building ${IMAGE}:${VERSION_TAG} (+ latest)"
if [[ -n "$PLATFORMS" ]]; then
  docker buildx build --platform "$PLATFORMS" "${BUILD_ARGS[@]}" --push .
else
  docker build "${BUILD_ARGS[@]}" .
  echo "→ pushing"
  docker push "${IMAGE}:${VERSION_TAG}"
  docker push "${IMAGE}:latest"
fi

echo "✓ published ${IMAGE}:${VERSION_TAG} and ${IMAGE}:latest"
