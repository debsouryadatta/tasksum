FROM node:lts-alpine AS builder

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Expose the port your app runs on
EXPOSE 12000

# Start command
CMD ["sh", "-c", "pnpm build && pnpm start"]