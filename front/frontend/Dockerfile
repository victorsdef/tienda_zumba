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
ENV BACKEND_HOST=sofia-couture-backend.onrender.com
# Puerto por defecto para Render/local; Railway inyecta $PORT dinámico
ENV PORT=80

# Extrae automáticamente el host del BACKEND_URL si BACKEND_HOST no se sobreescribe explícitamente
CMD ["/bin/sh", "-c", "\
  BACKEND_HOST=${BACKEND_HOST:-$(echo $BACKEND_URL | sed -E 's~https?://~~; s~/.*~~')}; \
  export BACKEND_URL BACKEND_HOST PORT; \
  envsubst '${BACKEND_URL} ${BACKEND_HOST} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
  nginx -g 'daemon off;'"]

EXPOSE 80
