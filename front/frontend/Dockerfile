# ── Etapa 1: build ────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Etapa 2: servir con Nginx ──────────────────────────────────────
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Al iniciar el contenedor, sustituye variables y arranca nginx
ENV BACKEND_URL=http://backend:8080
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

EXPOSE 80
