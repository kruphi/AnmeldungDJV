FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY prisma/ ./prisma/
COPY src/ ./src/
RUN npx prisma generate

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
