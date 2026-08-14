# site-builder Dockerfile
#
# EXPECTED docker-compose.yml WIRING (documented here for whoever wires the
# integration step — this service needs TWO sibling directories from the repo,
# so the build context must be the REPO ROOT, not site-builder/ itself):
#
#   site-builder:
#     build:
#       context: .                       # repo root (ai-sites/), NOT ./site-builder
#       dockerfile: site-builder/Dockerfile
#     ports:
#       - "4000:4000"
#     environment:
#       BUILDS_DIR: /builds
#     volumes:
#       - builds_data:/builds             # shared with whatever serves the static output
#     healthcheck:
#       test: ["CMD", "node", "-e", "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
#       interval: 10s
#       timeout: 5s
#       retries: 5
#
#   volumes:
#     builds_data:
#
# (add the above `site-builder` service + `builds_data` volume to the repo's
# top-level docker-compose.yml)

# Node 22, не 20: nuxi generate прогоняет прод cssnano-минификацию, а
# postcss-merge-longhand@8.x зовёт Set.prototype.isSubsetOf (ES2024) —
# этого метода нет в Node < 22, сборка падает ("isSubsetOf is not a function").
FROM node:22-slim

WORKDIR /app

# ---- site-renderer (Nuxt app) ------------------------------------------------
COPY site-renderer/package.json site-renderer/package-lock.json ./site-renderer/
RUN npm ci --prefix site-renderer

# ---- site-blocks (Nuxt layer, no package.json — pulled in via `extends`) -----
COPY site-blocks ./site-blocks

COPY site-renderer ./site-renderer

# ---- site-builder (this service) ---------------------------------------------
COPY site-builder/package.json site-builder/package-lock.json ./site-builder/
RUN npm ci --prefix site-builder --omit=dev

COPY site-builder ./site-builder

WORKDIR /app/site-builder

ENV PORT=4000
ENV SITE_RENDERER_DIR=/app/site-renderer
ENV BUILDS_DIR=/builds

EXPOSE 4000

CMD ["node", "server.mjs"]
