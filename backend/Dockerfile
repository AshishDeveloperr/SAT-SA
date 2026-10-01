# Multi-stage production build for SAT-SA Backend
FROM node:22-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

EXPOSE 5000

CMD ["node", "server.js"]
