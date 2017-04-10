FROM docker.io/library/node:6.10.2-alpine

ENV NODE_ENV production
ENV PORT 3000

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm i && npm i --only=dev \
      && npm run build \
      && npm prune

EXPOSE 3000
CMD ["npm", "run", "serve"]
