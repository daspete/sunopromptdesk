# ---- build stage: compile the Vite static bundle ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SITE_URL
ARG VITE_PLAUSIBLE_DOMAIN
ARG VITE_PLAUSIBLE_SRC
ENV VITE_SITE_URL=$VITE_SITE_URL VITE_PLAUSIBLE_DOMAIN=$VITE_PLAUSIBLE_DOMAIN VITE_PLAUSIBLE_SRC=$VITE_PLAUSIBLE_SRC
RUN npm run build

# ---- runtime stage: express serving dist/ + the prompt API ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY shared ./shared
COPY --from=build /app/dist ./dist
RUN mkdir -p data/prompts && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/ >/dev/null || exit 1
CMD ["node", "server/index.ts"]
