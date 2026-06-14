# --- Stage 1: Build the React Application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the app (generates the 'dist' or 'build' folder)
# Note: Vite uses 'npm run build' to create a 'dist' folder. Create React App uses 'build'.
RUN npm run build


# --- Stage 2: Serve the assets with Nginx ---
FROM nginx:1.25-alpine

# Copy the static build files from Stage 1 to Nginx's default public folder
# Change "dist" to "build" if you are using an older Create React App setup
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]