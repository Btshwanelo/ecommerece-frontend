# -----------------------------
# ✅ 1️⃣ Base image
# -----------------------------
    FROM node:18-alpine AS base

    # Install any system dependencies
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    # -----------------------------
    # ✅ 2️⃣ Install dependencies
    # -----------------------------
    FROM base AS deps
    COPY package.json package-lock.json* ./
    RUN npm ci
    
    # -----------------------------
    # ✅ 3️⃣ Build with environment variables
    # -----------------------------
    FROM base AS builder
    WORKDIR /app
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    # 🔥 Pass build-time environment variables from docker-compose
    ARG NEXT_PUBLIC_API_BASE_URL
    ARG NEXT_PUBLIC_PAYFAST_MERCHANT_ID
    ARG NEXT_PUBLIC_PAYFAST_MERCHANT_KEY
    ARG NEXT_PUBLIC_PAYFAST_PASSPHRASE
    ARG NEXT_PUBLIC_PAYFAST_SANDBOX
    
    ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
    ENV NEXT_PUBLIC_PAYFAST_MERCHANT_ID=$NEXT_PUBLIC_PAYFAST_MERCHANT_ID
    ENV NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=$NEXT_PUBLIC_PAYFAST_MERCHANT_KEY
    ENV NEXT_PUBLIC_PAYFAST_PASSPHRASE=$NEXT_PUBLIC_PAYFAST_PASSPHRASE
    ENV NEXT_PUBLIC_PAYFAST_SANDBOX=$NEXT_PUBLIC_PAYFAST_SANDBOX
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN npm run build
    
    # -----------------------------
    # ✅ 4️⃣ Create production runtime image
    # -----------------------------
    FROM base AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN addgroup --system --gid 1001 nodejs \
        && adduser --system --uid 1001 nextjs
    
    COPY --from=builder /app/public ./public
    
    # Set permissions for Next.js cache
    RUN mkdir .next && chown nextjs:nodejs .next
    
    # Copy standalone optimized build
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    EXPOSE 3000
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    
    # Start the app
    CMD ["node", "server.js"]
    