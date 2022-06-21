FROM node:14.18.3

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

CMD ["node", "index.js"]