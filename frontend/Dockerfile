FROM node:20-alpine

WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Start Vite dev server, binding to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

