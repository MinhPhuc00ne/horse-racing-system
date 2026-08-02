# --- Build Stage ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Accept build args for Vite environment variables
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build for production
RUN npm run build

# --- Runtime Stage ---
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.js ./server.js

EXPOSE 5173
CMD ["node", "server.js"]
