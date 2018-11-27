# Setting up build dependencies
FROM node:8 as build-deps

ADD package.json /package.json
ADD package-lock.json /package-lock.json

ENV NODE = /node_modules
ENV PATH = $PATH:/node_modules/.bin

RUN npm install


# Building frontend
WORKDIR /app
ADD src/ /app/src
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
ADD public/ /app/public

RUN npm run build


# Production container
FROM keymetrics/pm2:latest-alpine

# Creating production file system
WORKDIR /app
COPY --from=build-deps /app/build build
COPY --from=build-deps /package.json package.json
COPY --from=build-deps /package-lock.json package-lock.json
COPY server server/
COPY public public/
COPY .env .
COPY pm2.json .

# Installing dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Show current folder structure in logs
RUN ls -al

# Running the server
EXPOSE 3000

CMD [ "pm2-runtime", "start", "pm2.json" ]
