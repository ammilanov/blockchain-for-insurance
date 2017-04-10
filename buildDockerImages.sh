#!/bin/bash

docker build -t bc-insurance-orderer orderer/
docker build -t bc-insurance-insurance insurancePeer/
docker build -t bc-insurance-shop shopPeer/
docker build -t bc-insurance-repairservice repairServicePeer/
docker build -t bc-insurance-cli cli/
docker build -t bc-insurance-web web/