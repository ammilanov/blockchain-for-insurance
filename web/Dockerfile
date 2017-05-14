FROM docker.io/library/node:6.10.3-alpine

ENV NODE_ENV production
ENV PORT 3000
ENV DOCKER_SOCKET_PATH /host/var/run/docker.sock
ENV DOCKER_CCENV_IMAGE hyperledger/fabric-ccenv:x86_64-1.0.0-alpha

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN apk update && apk add --update libc6-compat git alpine-sdk python \
      && npm i && npm i --only=dev \
      && npm run build \
      && npm prune \
      && apk del git alpine-sdk python

EXPOSE 3000
CMD ["npm", "run", "serve"]
