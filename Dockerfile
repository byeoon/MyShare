# Stage 1: Build
FROM node:22-bullseye AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build-css

# Stage 2: Runtime
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy package and install production dependencies
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

# Copy only necessary files from build stage
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node
EXPOSE 3010
CMD ["node", "src/index.js"]
