# KrakenGaming Frontend Dockerfile
# Multi-stage build for optimized production deployment

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_ENV=production
ARG NEXT_PUBLIC_DOMAIN=krakengaming.org
ARG NEXT_PUBLIC_API_URL=https://api.krakengaming.org
ARG NEXT_PUBLIC_APP_NAME=KrakenGaming
ARG NEXT_PUBLIC_APP_VERSION=0.1.0

ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

# Build the application
RUN npm run build -w @krakengaming/frontend

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Ensure uploads directory exists for file uploads
RUN mkdir -p ./apps/frontend/public/uploads
RUN chown nextjs:nodejs ./apps/frontend/public/uploads

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the application
CMD ["node", "apps/frontend/server.js"]
