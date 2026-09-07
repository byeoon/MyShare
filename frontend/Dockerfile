FROM node:24-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
