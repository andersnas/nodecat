ARG NODE_IMAGE=node:18-alpine

FROM ${NODE_IMAGE}

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Create the /app directory and set permissions
RUN mkdir /app && chown node:node /app

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json before other files for caching
COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies (as root user)
RUN npm install --production

# Copy the application source files and set ownership to the 'node' user
COPY --chown=node:node ["src", "./src"]

# Switch to a non-root user
USER node

# Run the app
CMD ["node", "src/tokenManager.js"]
