#Gateway/DockerFile
FROM node:20-slim

WORKDIR /app

COPY package.json .
Run npm install --production

COPY . .

CMD ["node", "index.js"]