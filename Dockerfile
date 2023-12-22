# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Excluding unnecessary files and directories during copying
COPY .dockerignore ./

# Expose the port where the app will run
EXPOSE 5000

# Start the Node.js/Express server
CMD ["npm", "start"]
