FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production
ENV PORT=7860

# Expose the standard port for Hugging Face
EXPOSE 7860

# Start the application
CMD ["npm", "start"]
