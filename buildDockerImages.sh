#!/bin/bash

docker build -t registry.ng.bluemix.net/bcins/orderer orderer/
docker build -t registry.ng.bluemix.net/bcins/insurance insurancePeer/
docker build -t registry.ng.bluemix.net/bcins/shop shopPeer/
docker build -t registry.ng.bluemix.net/bcins/repairservice repairServicePeer/
docker build -t registry.ng.bluemix.net/bcins/cli cli/
docker build -t registry.ng.bluemix.net/bcins/web web/
docker push registry.ng.bluemix.net/bcins/orderer
docker push registry.ng.bluemix.net/bcins/insurance
docker push registry.ng.bluemix.net/bcins/shop
docker push registry.ng.bluemix.net/bcins/repairservice
docker push registry.ng.bluemix.net/bcins/cli
docker push registry.ng.bluemix.net/bcins/web
