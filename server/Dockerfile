# Stage 1: Build stage
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY . .
RUN bun install

RUN bun run migrate

# Expose the port

EXPOSE 8080

# Start the application
CMD ["bun", "run", "src/index.ts"]
