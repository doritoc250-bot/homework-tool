FROM node:20-alpine
ENV NODE_ENV=production
EXPOSE 8080/tcp
WORKDIR /app
COPY package.json ./
RUN apk add --upgrade --no-cache python3 make g++ curl
RUN npm install -g pnpm
RUN pnpm install --prod
# Download UV files directly
RUN mkdir -p uv && \
    curl -L https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@latest/dist/uv.bundle.js -o uv/uv.bundle.js && \
    curl -L https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@latest/dist/uv.config.js -o uv/uv.config.js && \
    curl -L https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@latest/dist/uv.sw.js -o uv/uv.sw.js && \
    curl -L https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@latest/dist/uv.handler.js -o uv/uv.handler.js
COPY . .
ENTRYPOINT ["node"]
CMD ["src/index.js"]
