# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=https://api.example.com/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
