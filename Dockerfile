FROM keymetrics/pm2:latest-alpine


# Transferring files over
COPY server server/
COPY build build/
COPY public public/
COPY .env .
COPY package.json .
COPY pm2.json .


# Installing dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production


# Show current folder structure in logs
RUN ls -al


# Running the server
EXPOSE 3000
CMD [ "pm2-runtime", "start", "pm2.json" ]