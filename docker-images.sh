#!/bin/bash
set -eu

dockerFabricPull() {
  local FABRIC_TAG=$1
  for IMAGES in peer orderer couchdb ccenv javaenv kafka zookeeper; do
      echo "==> FABRIC IMAGE: $IMAGES"
      echo
      docker pull hyperledger/fabric-$IMAGES:$FABRIC_TAG
      docker tag hyperledger/fabric-$IMAGES:$FABRIC_TAG hyperledger/fabric-$IMAGES
  done
}

dockerCaPull() {
      local CA_TAG=$1
      echo "==> FABRIC CA IMAGE"
      echo
      docker pull hyperledger/fabric-ca:$CA_TAG
      docker tag hyperledger/fabric-ca:$CA_TAG hyperledger/fabric-ca
}

BUILD=
PUSH=
DOWNLOAD=
if [ $# -eq 0 ]; then
    BUILD=true
    PUSH=true
    DOWNLOAD=true
else
    for arg in "$@"
        do
            if [ $arg == "build" ]; then
                BUILD=true
            fi
            if [ $arg == "push" ]; then
                PUSH=true
            fi
            if [ $arg == "download" ]; then
                DOWNLOAD=true
            fi
    done
fi

if [ $DOWNLOAD ]; then
    : ${CA_TAG:="x86_64-1.0.0-alpha"}
    : ${FABRIC_TAG:="x86_64-1.0.0-alpha"}

    echo "===> Pulling fabric Images"
    dockerFabricPull ${FABRIC_TAG}

    echo "===> Pulling fabric ca Image"
    dockerCaPull ${CA_TAG}
    echo
    echo "===> List out hyperledger docker images"
    docker images | grep hyperledger*
fi

if [ $BUILD ];
    then
    echo '############################################################'
    echo '#                 BUILDING CONTAINER IMAGES                #'
    echo '############################################################'
    docker build -t registry.ng.bluemix.net/bcins/orderer:latest orderer/
    docker build -t registry.ng.bluemix.net/bcins/insurance-peer:latest insurancePeer/
    docker build -t registry.ng.bluemix.net/bcins/shop-peer:latest shopPeer/
    docker build -t registry.ng.bluemix.net/bcins/repairservice-peer:latest repairServicePeer/
    docker build -t registry.ng.bluemix.net/bcins/cli:latest cli/
    docker build -t registry.ng.bluemix.net/bcins/web:latest web/
    docker build -t registry.ng.bluemix.net/bcins/insurance-ca:latest insuranceCA/
    docker build -t registry.ng.bluemix.net/bcins/shop-ca:latest shopCA/
    docker build -t registry.ng.bluemix.net/bcins/repairservice-ca:latest repairServiceCA/
fi
if [ $PUSH ]; then
    echo '############################################################'
    echo '#                UPLOADING CONTAINER IMAGES                #'
    echo '############################################################'
    docker push registry.ng.bluemix.net/bcins/orderer:latest
    docker push registry.ng.bluemix.net/bcins/insurance-peer:latest
    docker push registry.ng.bluemix.net/bcins/shop-peer:latest
    docker push registry.ng.bluemix.net/bcins/repairservice-peer:latest
    docker push registry.ng.bluemix.net/bcins/cli:latest
    docker push registry.ng.bluemix.net/bcins/web:latest
    docker push registry.ng.bluemix.net/bcins/insurance-ca:latest
    docker push registry.ng.bluemix.net/bcins/shop-ca:latest
    docker push registry.ng.bluemix.net/bcins/repairservice-ca:latest
fi