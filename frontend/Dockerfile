# Build
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_APP_TITLE=JagdSchießen
ENV VITE_APP_TITLE=$VITE_APP_TITLE
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
