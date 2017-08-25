FROM docker.io/library/node:6.11.2

ENV NODE_ENV production
ENV PORT 3000
ENV DOCKER_SOCKET_PATH /host/var/run/docker.sock
ENV DOCKER_CCENV_IMAGE hyperledger/fabric-ccenv:x86_64-1.0.0

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN apt update && apt install -y git build-essential \
      && npm i && npm i --only=dev \
      && git apply block-decoder.patch \
      && npm run build \
      && npm prune \
      && apt remove -y git build-essential \
      && rm block-decoder.patch

EXPOSE 3000
CMD ["npm", "run", "serve"]
