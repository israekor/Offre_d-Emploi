# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies if needed for building, e.g., TypeScript)
RUN npm ci

# Copy the rest of your application code
COPY . .


# Prune devDependencies to keep the production image small
RUN npm prune --production


# --- Stage 2: Final Production Image ---
FROM node:20-alpine

# Set environment to production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

# Expose the port your Express app listens on (usually 3000 or 8080)
EXPOSE 5000

# Run the app as a non-root user for security
USER node

# Command to run your app
CMD ["node", "server.js"]