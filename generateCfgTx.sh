#!/bin/bash

CHANNEL_NAME="default"

echo "Creating genesis block for channel "$CHANNEL_NAME
echo

# Make project path GOPATH
PROJPATH=$(cd $(dirname "$0") && pwd)
export GOPATH=$PROJPATH

echo "Building configtxgen"
go get -d github.com/hyperledger/fabric
FABRICPATH=$GOPATH/src/github.com/hyperledger/fabric
cd $FABRICPATH
make configtxgen
cd $PROJPATH

echo "Generating genesis block"
cp configtx.yaml $FABRICPATH/common/configtx/tool/configtx.yaml
$FABRICPATH/build/bin/configtxgen -profile ThreeOrgs -outputBlock $PROJPATH/orderer/crypto/orderer.block

echo "Generating channel configuration transaction"
$FABRICPATH/build/bin/configtxgen -profile ThreeOrgs -outputCreateChannelTx $PROJPATH/orderer/crypto/channel.tx -channelID $CHANNEL_NAME

echo "Cleaning up"
rm -rf $PROJPATH/src/
rm -rf $PROJPATH/pkg/
rm -rf $PROJPATH/bin/