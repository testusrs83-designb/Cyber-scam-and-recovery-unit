FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .
CMD ["node", "scripts/row_migration.js", "${SOURCE_DATABASE_URL}", "${TARGET_DATABASE_URL}"]
