FROM docker.io/library/node:6.11.3

ENV NODE_ENV production
ENV PORT 3000
ENV DOCKER_SOCKET_PATH /host/var/run/docker.sock
ENV DOCKER_CCENV_IMAGE hyperledger/fabric-ccenv:x86_64-1.0.2

ADD https://storage.googleapis.com/golang/go1.9.linux-amd64.tar.gz /go.tar.gz
RUN tar -C /usr/local/ -xzf /go.tar.gz && rm /go.tar.gz
COPY . /app
WORKDIR /app
RUN apt update && apt install -y build-essential \
      && npm i && npm i --only=dev \
      && npm run build \
      && export PATH=$PATH:/usr/local/go/bin \
      && DEFAULT_GOPATH=$(go env GOPATH) \
      && export GOPATH=$DEFAULT_GOPATH:$(pwd)/chaincode \
      && go get -u github.com/golang/dep/cmd/dep \
      && export PATH=$PATH:$DEFAULT_GOPATH/bin \
      && cd /app/chaincode/src/bcins && dep ensure \
      && npm prune \
      && rm -rf $(go env GOROOT) $DEFAULT_GOPATH $ \
      && apt remove -y build-essential

EXPOSE 3000
CMD ["npm", "run", "serve"]
