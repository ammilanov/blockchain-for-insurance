#!/bin/bash

set -e

PROJPATH=$(cd $(dirname "$0") && pwd)

### Orderer
echo "--> Generating certificates for orderer..."
ORDERERPATH=$PROJPATH/orderer/crypto
ORDERERMSP=$ORDERERPATH/localMspConfig
mkdir -p $ORDERERMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout -out $ORDERERMSP/cakey.pem

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=ordererOrg' \
    -key $ORDERERMSP/cakey.pem \
    -out $ORDERERMSP/cacerts/ordererOrg.pem
cp $ORDERERMSP/cacerts/ordererOrg.pem $ORDERERMSP/admincerts/ordererOrg.pem

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $ORDERERMSP/keystore/ordererSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=orderer0' \
    -key $ORDERERMSP/keystore/ordererSigner.pem \
    -out $ORDERERMSP/signcerts/ordererSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $ORDERERMSP/cacerts/ordererOrg.pem \
    -CAkey $ORDERERMSP/cakey.pem \
    -in $ORDERERMSP/signcerts/ordererSigner.csr \
    -out $ORDERERMSP/signcerts/orderer0Signer.pem

# Cleaning up
rm $ORDERERMSP/signcerts/ordererSigner.csr
rm $ORDERERMSP/cakey.pem

echo
echo

### Insurance Peer
echo "--> Generating certificates for insurance organization..."
INSURANCEPEERPATH=$PROJPATH/insurancePeer/crypto
INSURANCECAPATH=$PROJPATH/insuranceCA
INSURANCEMSP=$INSURANCEPEERPATH/localMspConfig
mkdir -p $INSURANCECAPATH/{ca,tls}
mkdir -p $INSURANCEMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout \
    | tee $INSURANCECAPATH/ca/key.pem \
        $INSURANCECAPATH/tls/key.pem > /dev/null

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=insuranceOrg' \
    -key $INSURANCECAPATH/ca/key.pem \
    | tee $INSURANCECAPATH/ca/cert.pem \
        $INSURANCECAPATH/tls/cert.pem \
        $INSURANCEMSP/cacerts/insuranceOrg.pem \
        $INSURANCEMSP/admincerts/insuranceOrg.pem > /dev/null

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $INSURANCEMSP/keystore/insuranceOrgSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=insurancePeer' \
    -key $INSURANCEMSP/keystore/insuranceOrgSigner.pem \
    -out $INSURANCEMSP/signcerts/insuranceOrgSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $INSURANCEMSP/cacerts/insuranceOrg.pem \
    -CAkey $INSURANCECAPATH/ca/key.pem \
    -in $INSURANCEMSP/signcerts/insuranceOrgSigner.csr \
    -out $INSURANCEMSP/signcerts/insuranceOrgSigner.pem

# Cleaning up
rm $INSURANCEMSP/signcerts/insuranceOrgSigner.csr

echo
echo

### Shop Peer
echo "--> Generating certificates for shop organization..."
SHOPPEERPATH=$PROJPATH/shopPeer/crypto
SHOPCAPATH=$PROJPATH/shopCA
SHOPMSP=$SHOPPEERPATH/localMspConfig
mkdir -p $SHOPCAPATH/{ca,tls}
mkdir -p $SHOPMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout \
    | tee $SHOPCAPATH/ca/key.pem \
        $SHOPCAPATH/tls/key.pem > /dev/null

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=shopOrg' \
    -key $SHOPCAPATH/ca/key.pem \
    | tee $SHOPCAPATH/ca/cert.pem \
        $SHOPCAPATH/tls/cert.pem \
        $SHOPMSP/cacerts/shopOrg.pem \
        $SHOPMSP/admincerts/shopOrg.pem > /dev/null

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $SHOPMSP/keystore/shopOrgSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=shopPeer' \
    -key $SHOPMSP/keystore/shopOrgSigner.pem \
    -out $SHOPMSP/signcerts/shopOrgSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $SHOPMSP/cacerts/shopOrg.pem \
    -CAkey $SHOPCAPATH/ca/key.pem \
    -in $SHOPMSP/signcerts/shopOrgSigner.csr \
    -out $SHOPMSP/signcerts/shopOrgSigner.pem

# Cleaning up
rm $SHOPMSP/signcerts/shopOrgSigner.csr

echo
echo

### Repair Service Peer
echo "--> Generating certificates for repair service organization..."
REPAIRSERVICEPEERPATH=$PROJPATH/repairServicePeer/crypto
REPAIRSERVICECAPATH=$PROJPATH/repairServiceCA
REPAIRSERVICEMSP=$REPAIRSERVICEPEERPATH/localMspConfig
mkdir -p $REPAIRSERVICECAPATH/{ca,tls}
mkdir -p $REPAIRSERVICEMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout \
    | tee $REPAIRSERVICECAPATH/ca/key.pem \
        $REPAIRSERVICECAPATH/tls/key.pem > /dev/null

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=repairServiceOrg' \
    -key $REPAIRSERVICECAPATH/ca/key.pem \
    | tee $REPAIRSERVICECAPATH/ca/cert.pem \
        $REPAIRSERVICECAPATH/tls/cert.pem \
        $REPAIRSERVICEMSP/cacerts/repairServiceOrg.pem \
        $REPAIRSERVICEMSP/admincerts/repairServiceOrg.pem > /dev/null

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $REPAIRSERVICEMSP/keystore/repairServiceOrgSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=repairServicePeer' \
    -key $REPAIRSERVICEMSP/keystore/repairServiceOrgSigner.pem \
    -out $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $REPAIRSERVICEMSP/cacerts/repairServiceOrg.pem \
    -CAkey $REPAIRSERVICECAPATH/ca/key.pem \
    -in $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.csr \
    -out $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.pem

# Cleaning up
rm $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.csr

echo
echo

### Copying cryptographic material across peers
echo "--> Copying CA certificates across peers"
eval `echo 'cp '$INSURANCEMSP/cacerts/*.pem\ {$SHOPMSP/,$REPAIRSERVICEMSP/}{admincerts,cacerts}';'`
eval `echo 'cp '$SHOPMSP/cacerts/*.pem\ {$INSURANCEMSP/,$REPAIRSERVICEMSP/}{admincerts,cacerts}';'`
eval `echo 'cp '$REPAIRSERVICEMSP/cacerts/*.pem\ {$INSURANCEMSP/,$SHOPMSP/}{admincerts,cacerts}';'`

echo
echo

sh generateCfgTx.sh

### Copying Certificates to the CLI
echo "--> Copying cryptographic material to cli container definition..."
CLIPATH=$PROJPATH/cli/peers
mkdir -p $CLIPATH/{orderer,insurancePeer,shopPeer,repairServicePeer}
echo "> Copying orderer certificates"
cp -r $ORDERERPATH/* $CLIPATH/orderer
echo "> Copying insurance peer certificates"
cp -r $INSURANCEPEERPATH/* $CLIPATH/insurancePeer
echo "> Copying shop peer certificates"
cp -r $SHOPPEERPATH/* $CLIPATH/shopPeer
echo "> Copying repair service peer certificates"
cp -r $REPAIRSERVICEPEERPATH/* $CLIPATH/repairServicePeer