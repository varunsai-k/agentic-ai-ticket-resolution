FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Run the development server and bind it to host so it's accessible externally from the container
CMD ["npm", "run", "dev", "--", "--host"]
