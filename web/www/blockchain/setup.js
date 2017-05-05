'use strict';

import config, { DEFAULT_CONTRACT_TYPES } from './config';
import { OrganizationClient } from './utils';

var status = 'down';
var statusChangedCallbacks = [];

// Setup clients per organization
var insuranceClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.insuranceOrg.peer,
  config.insuranceOrg.ca
);
var shopClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.shopOrg.peer,
  config.shopOrg.ca
);
var repairServiceClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.repairServiceOrg.peer,
  config.repairServiceOrg.ca
);

function setStatus(s) {
  status = s;

  setTimeout(() => {
    statusChangedCallbacks
      .filter(f => typeof f === 'function')
      .forEach(f => f(s));
  }, 1000);
}

export function subscribeStatus(cb) {
  if (typeof cb === 'function') {
    statusChangedCallbacks.push(cb);
  }
}

export function getStatus() {
  return status;
}

export function isReady() {
  return status === 'ready';
}

(async () => {
  // Initialize clients
  try {
    await Promise.all([
      insuranceClient.initialize(),
      shopClient.initialize(),
      repairServiceClient.initialize()
    ]);
  } catch (e) {
    console.log('Fatal Error initializing blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // Install chaincode on all peers
  let installedOnInsuranceOrg, installedOnShopOrg, installedOnRepairServiceOrg;
  try {
    installedOnInsuranceOrg = await insuranceClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnShopOrg = await shopClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnRepairServiceOrg = await repairServiceClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
  } catch (e) {
    console.log('Fatal error getting installation status of the chaincode!');
    console.log(e);
    process.exit(-1);
  }

  let installed = installedOnInsuranceOrg && installedOnShopOrg && installedOnRepairServiceOrg;
  if (!installed) {
    let installationPromises = [
      insuranceClient.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      shopClient.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      repairServiceClient.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath)
    ];
    try {
      await Promise.all(installationPromises);
      console.log('Successfully installed chaincode on the blockchain network.');
    } catch (e) {
      console.log('Fatal error installing chaincode on the blockchain network!');
      console.log(e);
      process.exit(-1);
    }

    // Instantiate chaincode on all peers
    // Instantiating the chaincode on a single peer should be enough (for now)
    try {
      // Initial contract types
      await insuranceClient.instantiate(config.chaincodeId, config.chaincodeVersion, config.chaincodePath, DEFAULT_CONTRACT_TYPES);
      console.log('Successfully instantiated chaincode on the blockchain network.');
      setStatus('ready');
    } catch (e) {
      console.log('Fatal error instantiating chaincode on the blockchain network!');
      console.log(e);
      process.exit(-1);
    }
  } else {
    console.log('Chaincode already installed on the blockchain network.');
    setStatus('ready');
  }
})();

// Export organization clients
export { insuranceClient, shopClient, repairServiceClient }
