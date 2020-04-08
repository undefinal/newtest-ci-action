FROM node:10
# Create app directory
WORKDIR /app
COPY . .
RUN npm install
RUN apt-get install adb

ENTRYPOINT node /app/index.js