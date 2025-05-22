FROM node:lts-alpine

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

# Prisma generate
RUN npx prisma generate

# TypeScript compile
RUN tsc -b

# Expose the port your app runs on
EXPOSE 12000

# Start command
CMD ["node", "dist/index.js"]