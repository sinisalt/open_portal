# OpenPortal Backend (Development)
# Node image for test backend running in watch mode

FROM node:20-alpine AS dev
WORKDIR /app

# Install dependencies including devDependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and TS config
COPY tsconfig.json ./
COPY src ./src

# Expose port
EXPOSE 4000

# Environment
ENV NODE_ENV=development

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok) process.exit(1)}).catch(()=>process.exit(1))"

# Start dev server with tsx watch
CMD ["npm", "run", "dev"]
