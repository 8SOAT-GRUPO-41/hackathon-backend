FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]