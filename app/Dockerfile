FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 19000
CMD [\"npx\", \"expo\", \"start\", \"--web\"]
