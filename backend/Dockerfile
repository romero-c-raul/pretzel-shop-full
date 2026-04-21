FROM node:24-alpine as deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY ./config ./config
COPY ./routes ./routes
COPY ./scripts ./scripts
COPY ./docker-entrypoint.sh ./
COPY server.js ./
RUN chmod +x docker-entrypoint.sh
USER appuser
EXPOSE 3001
CMD ["./docker-entrypoint.sh"]