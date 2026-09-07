FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["pnpm", "start"]
