ARG NODE_VERSION=latest


FROM node:${NODE_VERSION} AS build

WORKDIR /app

ARG APP_ENV=production

COPY ./src ./src
COPY ./public ./public
COPY ./index.html \
     ./vite.config.ts \
     ./tsconfig.json \
     ./package.json \
     ./package-lock.json \
     ./.en[v] \
     ./.env.loca[l] \
     ./

ENV NODE_ENV=APP_ENV
# ENV CI=true
# RUN npm ci
# RUN npm i
# RUN npm run build

# UNCOMMENT FOR DEV USE: and comment out above steps 
COPY ./dist ./dist


# NOTE: mount nginx.conf using compose
FROM nginx:alpine

WORKDIR /app

# Copy to nginx dir
WORKDIR /usr/share/nginx/html
# remove default nginx static assets
RUN rm -rf ./*
COPY --from=build /app/dist .

# run in foreground
ENTRYPOINT ["nginx", "-g", "daemon off;"]