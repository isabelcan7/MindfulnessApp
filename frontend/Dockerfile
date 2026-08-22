FROM node:22-slim AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .


FROM base AS dev

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM base AS build

ARG VITE_API_URL=/api
ARG VITE_MEDIA_URL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_MEDIA_URL=$VITE_MEDIA_URL
RUN npm run build


FROM nginx:1.27-alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
