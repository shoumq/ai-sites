# admin-panel — Nuxt 4 SPA (ssr:false). Дев-сборка: контейнер поднимает
# `nuxt dev`, а не статическую сборку — совпадает с командой, которой этот
# образ реально проверялся (см. package.json "dev").
#
# Node 22, не 20: прод-сборка Nuxt 4 (cssnano -> postcss-merge-longhand@8.x)
# использует Set.prototype.isSubsetOf (ES2024), которого нет в Node < 22 —
# `nuxi build` падает на Node 20 с "partsBSet.isSubsetOf is not a function".
#
# ВАЖНО: nuxt.config.ts делает `extends: ['../site-blocks']` — относительный
# путь, рассчитанный на то, что admin-panel и site-blocks лежат рядом друг с
# другом. Внутри контейнера это работает, только если site-blocks реально
# скопирован как СОСЕД admin-panel — поэтому build-контекст здесь корень репо
# (ai-sites/), а не admin-panel/ сам по себе, и layer кладётся в /site-blocks
# (сосед /app на уровне корня контейнера, что и даёт /app + ../ = /site-blocks).
#
# Соответствующая секция docker-compose.yml:
#   admin-panel:
#     build:
#       context: .
#       dockerfile: admin-panel/Dockerfile
#     volumes:
#       - ./admin-panel:/app
#       - ./site-blocks:/site-blocks
#       - /app/node_modules
FROM node:22-slim

WORKDIR /app

COPY admin-panel/package.json admin-panel/package-lock.json ./
RUN npm install

COPY site-blocks /site-blocks
COPY admin-panel .

EXPOSE 3000

ENV NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
ENV NUXT_PUBLIC_WS_BASE=ws://localhost:8000/api/v1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
