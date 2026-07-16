# ── Etapa 1: build ────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Build args — Render los inyecta desde envVars del render.yaml
ARG VITE_API_URL=/api/nueva-arquitectura
ARG VITE_PAYPHONE_TOKEN
ARG VITE_PAYPHONE_STORE_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PAYPHONE_TOKEN=$VITE_PAYPHONE_TOKEN
ENV VITE_PAYPHONE_STORE_ID=$VITE_PAYPHONE_STORE_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Etapa 2: servir con Nginx ──────────────────────────────────────
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

ENV BACKEND_URL=http://backend:8080

CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

EXPOSE 80
