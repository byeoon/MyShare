FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=development
ENV PORT=8000

EXPOSE 8000

CMD ["pnpm", "run", "dev"]
