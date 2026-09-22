FROM node:22.17.1-alpine AS frontend-dev

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]