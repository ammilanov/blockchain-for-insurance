#!/bin/bash
set -e

CORE_PEER_MSPCONFIGPATH=/peers/orderer/localMspConfig CORE_PEER_LOCALMSPID="OrdererMSP" peer channel create -o orderer0:7050 -c default -f /peers/orderer/channel.tx --tls true --cafile /peers/orderer/localMspConfig/cacerts/ordererOrg.pem

CORE_PEER_MSPCONFIGPATH=/peers/insurancePeer/localMspConfig CORE_PEER_ADDRESS=insurance-peer:7051 CORE_PEER_LOCALMSPID=InsuranceOrgMSP CORE_PEER_TLS_ROOTCERT_FILE=/peers/insurancePeer/localMspConfig/cacerts/insuranceOrg.pem peer channel join -b default.block

CORE_PEER_MSPCONFIGPATH=/peers/shopPeer/localMspConfig CORE_PEER_ADDRESS=shop-peer:7051 CORE_PEER_LOCALMSPID=ShopOrgMSP CORE_PEER_TLS_ROOTCERT_FILE=/peers/shopPeer/localMspConfig/cacerts/shopOrg.pem peer channel join -b default.block

CORE_PEER_MSPCONFIGPATH=/peers/repairServicePeer/localMspConfig CORE_PEER_ADDRESS=repairservice-peer:7051 CORE_PEER_LOCALMSPID=RepairServiceOrgMSP CORE_PEER_TLS_ROOTCERT_FILE=/peers/repairServicePeer/localMspConfig/cacerts/repairServiceOrg.pem peer channel join -b default.block