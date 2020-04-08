FROM node:10
# Create app directory
WORKDIR /app
COPY . .
RUN npm install

ENTRYPOINT node /app/index.js