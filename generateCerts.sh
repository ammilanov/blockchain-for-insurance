### Orderer
echo "--> Generating certificates for orderer..."
ORDERERPATH=orderer/crypto
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
echo "--> Generating certificates for insurance peer..."
INSURANCEPATH=insurancePeer/crypto
INSURANCEMSP=$INSURANCEPATH/localMspConfig
mkdir -p $INSURANCEMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $INSURANCEMSP/cakey.pem

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=insuranceOrg' \
    -key $INSURANCEMSP/cakey.pem \
    -out $INSURANCEMSP/cacerts/insuranceOrg.pem
cp $INSURANCEMSP/cacerts/insuranceOrg.pem \
    $INSURANCEMSP/admincerts/insuranceOrg.pem

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $INSURANCEMSP/keystore/insuranceOrgSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=insurance' \
    -key $INSURANCEMSP/keystore/insuranceOrgSigner.pem \
    -out $INSURANCEMSP/signcerts/insuranceOrgSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $INSURANCEMSP/cacerts/insuranceOrg.pem \
    -CAkey $INSURANCEMSP/cakey.pem \
    -in $INSURANCEMSP/signcerts/insuranceOrgSigner.csr \
    -out $INSURANCEMSP/signcerts/insuranceOrgSigner.pem

# Cleaning up
rm $INSURANCEMSP/signcerts/insuranceOrgSigner.csr
rm $INSURANCEMSP/cakey.pem

echo
echo

### Shop Peer
echo "--> Generating certificates for shop peer..."
SHOPPATH=shopPeer/crypto
SHOPMSP=$SHOPPATH/localMspConfig
mkdir -p $SHOPMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $SHOPMSP/cakey.pem

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=shopOrg' \
    -key $SHOPMSP/cakey.pem \
    -out $SHOPMSP/cacerts/shopOrg.pem
cp $SHOPMSP/cacerts/shopOrg.pem $SHOPMSP/admincerts/shopOrg.pem

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $SHOPMSP/keystore/shopOrgSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=shop' \
    -key $SHOPMSP/keystore/shopOrgSigner.pem \
    -out $SHOPMSP/signcerts/shopOrgSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $SHOPMSP/cacerts/shopOrg.pem \
    -CAkey $SHOPMSP/cakey.pem \
    -in $SHOPMSP/signcerts/shopOrgSigner.csr \
    -out $SHOPMSP/signcerts/shopOrgSigner.pem

# Cleaning up
rm $SHOPMSP/signcerts/shopOrgSigner.csr
rm $SHOPMSP/cakey.pem

echo
echo

### Repair Service Peer
echo "--> Generating certificates for repair service peer..."
REPAIRSERVICEPATH=repairServicePeer/crypto
REPAIRSERVICEMSP=$REPAIRSERVICEPATH/localMspConfig
mkdir -p $REPAIRSERVICEMSP/{admincerts,cacerts,keystore,signcerts}

echo "> Generating CA private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $REPAIRSERVICEMSP/cakey.pem

echo "> Generating CA certificates"
openssl req -new -x509 -sha256 -days 3650 -nodes -subj '/CN=repairServiceOrg' \
    -key $REPAIRSERVICEMSP/cakey.pem \
    -out $REPAIRSERVICEMSP/cacerts/repairServiceOrg.pem
cp $REPAIRSERVICEMSP/cacerts/repairServiceOrg.pem \
    $REPAIRSERVICEMSP/admincerts/repairServiceOrg.pem

echo "> Generating peer node private key"
openssl ecparam -genkey -name prime256v1 -noout \
    -out $REPAIRSERVICEMSP/keystore/repairServiceOrgSigner.pem

echo "> Generating peer node certificate"
openssl req -new -subj '/CN=repairService' \
    -key $REPAIRSERVICEMSP/keystore/repairServiceOrgSigner.pem \
    -out $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.csr
openssl x509 -req -days 3650 -sha256 -set_serial 1000 \
    -CA $REPAIRSERVICEMSP/cacerts/repairServiceOrg.pem \
    -CAkey $REPAIRSERVICEMSP/cakey.pem \
    -in $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.csr \
    -out $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.pem

# Cleaning up
rm $REPAIRSERVICEMSP/signcerts/repairServiceOrgSigner.csr
rm $REPAIRSERVICEMSP/cakey.pem

echo
echo

sh generateCfgTx.sh

### Copying Certificates to the CLI
echo "--> Copying cryptographic material to cli container definition..."
CLIPATH=cli/peers
mkdir -p $CLIPATH/{orderer,insurancePeer,shopPeer,repairServicePeer}
echo "> Copying orderer certificates"
cp -r $ORDERERPATH/* $CLIPATH/orderer
echo "> Copying insurance peer certificates"
cp -r $INSURANCEPATH/* $CLIPATH/insurancePeer
echo "> Copying shop peer certificates"
cp -r $SHOPPATH/* $CLIPATH/shopPeer
echo "> Copying repair service peer certificates"
cp -r $REPAIRSERVICEPATH/* $CLIPATH/repairServicePeer