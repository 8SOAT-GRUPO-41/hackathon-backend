FROM node:20-alpine as builder

ENV NODE_ENV build

WORKDIR /home/node

COPY package.json package-lock.json ./
RUN npm ci


COPY --chown=node:node . .
RUN npx prisma generate
RUN npm run build \
    && npm prune --production

FROM node:20-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package.json ./
COPY --from=builder --chown=node:node /home/node/package-lock.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/entrypoint.sh ./

EXPOSE 3000

CMD ["./entrypoint.sh"]