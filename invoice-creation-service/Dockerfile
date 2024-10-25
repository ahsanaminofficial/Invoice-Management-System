FROM node:21

WORKDIR /app2

COPY . .

RUN npm install

RUN npm run build

CMD ["npm", "run", "start:prod"]
