FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV PORT=8000

EXPOSE 8000

CMD ["npm", "run", "dev"]
