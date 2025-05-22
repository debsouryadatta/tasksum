FROM node:lts-alpine AS builder

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install TypeScript globally
RUN npm install -g typescript

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Creating the directories
RUN mkdir -p src/lib/generated
RUN mkdir -p dist/lib/generated

# TypeScript compile
RUN tsc -b

# Prisma generate
RUN npx prisma generate

# Copy the generated Prisma client
COPY src/lib/generated dist/lib/generated

# Expose the port your app runs on
EXPOSE 12000

# Start command
CMD ["node", "dist/index.js"]