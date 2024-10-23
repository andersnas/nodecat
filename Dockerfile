# syntax=docker/dockerfile:1.2
ARG NODE_IMAGE=node:18-alpine

FROM ${NODE_IMAGE}
ENV NODE_ENV=production
EXPOSE 3000

# Create the /app directory and set permissions
RUN mkdir /app
RUN chown node:node /app

# Set the working directory inside the container
WORKDIR /app

# Copy necessary files and set ownership to 'node' user
COPY --chown=node:node ["package.json", "package-lock.json*", "tsconfig*.json", "./"]
COPY --chown=node:node ["src", "./src"]

# Switch to non-root user
USER node

# Install dependencies
RUN npm install -y

# Run the app, making sure to reference the correct path
CMD [ "node", "src/helloworld.js" ]
