FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["npm", "start"]
