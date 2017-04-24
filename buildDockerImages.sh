#!/bin/bash
set -e

if [ $# -eq 0 ]
    then
        BUILD=1
        PUSH=1
else
    for arg in "$@"
        do
            if [ $arg == "build" ]
                then BUILD=1
            fi
            if [ $arg == "push" ]
                then PUSH=1
            fi
    done
fi

if [ $BUILD ]
    then
        echo '############################################################'
        echo '#                 BUILDING CONTAINER IMAGES                #'
        echo '############################################################'
        docker build -t registry.ng.bluemix.net/bcins/orderer:latest orderer/
        docker build -t registry.ng.bluemix.net/bcins/insurance:latest insurancePeer/
        docker build -t registry.ng.bluemix.net/bcins/shop:latest shopPeer/
        docker build -t registry.ng.bluemix.net/bcins/repairservice:latest repairServicePeer/
        docker build -t registry.ng.bluemix.net/bcins/cli:latest cli/
        docker build -t registry.ng.bluemix.net/bcins/web:latest web/
        docker build -t registry.ng.bluemix.net/bcins/insurance-ca:latest insuranceCA/
        docker build -t registry.ng.bluemix.net/bcins/shop-ca:latest shopCA/
        docker build -t registry.ng.bluemix.net/bcins/repairservice-ca:latest repairServiceCA/
fi
if [ $PUSH ]
    then
        echo '############################################################'
        echo '#                UPLOADING CONTAINER IMAGES                #'
        echo '############################################################'
        docker push registry.ng.bluemix.net/bcins/orderer:latest
        docker push registry.ng.bluemix.net/bcins/insurance:latest
        docker push registry.ng.bluemix.net/bcins/shop:latest
        docker push registry.ng.bluemix.net/bcins/repairservice:latest
        docker push registry.ng.bluemix.net/bcins/cli:latest
        docker push registry.ng.bluemix.net/bcins/web:latest
        docker push registry.ng.bluemix.net/bcins/insurance-ca:latest
        docker push registry.ng.bluemix.net/bcins/shop-ca:latest
        docker push registry.ng.bluemix.net/bcins/repairservice-ca:latest
fi