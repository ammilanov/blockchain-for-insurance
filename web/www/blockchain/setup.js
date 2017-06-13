'use strict';

import config, { DEFAULT_CONTRACT_TYPES } from './config';
import { OrganizationClient } from './utils';
import Docker from 'dockerode';

let status = 'down';
let statusChangedCallbacks = [];

// Setup clients per organization
let insuranceClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.insuranceOrg.peer,
  config.insuranceOrg.ca
);
let shopClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.shopOrg.peer,
  config.shopOrg.ca
);
let repairServiceClient = new OrganizationClient(
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
  // Login
  try {
    await Promise.all([
      insuranceClient.login(),
      shopClient.login(),
      repairServiceClient.login()
    ]);
  } catch (e) {
    console.log('Fatal error logging into blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // Bootstrap blockchain network
  try {
    if (!(await insuranceClient.checkChannelMembership())) {
      const createChannelResponse =
        await insuranceClient.createChannel(config.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('Successfully created a new channel.');
        await Promise.all([
          insuranceClient.joinChannel(),
          shopClient.joinChannel(),
          repairServiceClient.joinChannel()
        ]);
        await new Promise(resolve => { setTimeout(resolve, 10000); });
      }
    }
  } catch (e) {
    console.log('Fatal error bootstrapping the blockchain network!');
    console.log(e);
    process.exit(-1);
  }

  // Initialize network
  try {
    await Promise.all([
      insuranceClient.initialize(),
      shopClient.initialize(),
      repairServiceClient.initialize()
    ]);
  } catch (e) {
    console.log('Fatal error initializing blockchain organization clients!');
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
    // Pull chaincode environment base image
    console.log('Chaincode is not installed, attempting installation...');
    try {
      const socketPath = process.env.DOCKER_SOCKET_PATH
        || '/var/run/docker.sock';
      const ccenvImage = process.env.DOCKER_CCENV_IMAGE
        || 'hyperledger/fabric-ccenv:x86_64-1.0.0-alpha';
      const docker = new Docker({ socketPath });
      const images = await docker.listImages();
      const imageExists = images.some(
        i => i.RepoTags && i.RepoTags.some(tag => tag === ccenvImage));
      if (!imageExists) {
        console.log('Base container image not present, pulling from Docker Hub...');

        await new Promise((resolve, reject) => {
          docker.pull(ccenvImage, (err, stream) => {
            if (err) {
              reject(err); return;
            }
            docker.modem.followProgress(stream, (err, output) => {
              if (err) {
                reject(err); return;
              }
              resolve();
            }, ()=>{});
          });
        });

      } else {
        console.log('Base container image present.');
      }
    } catch (e) {
      console.log('Fatal error pulling docker images.');
      console.log(e);
      process.exit(-1);
    }
    let installationPromises = [
      insuranceClient.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      shopClient.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      repairServiceClient.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath)
    ];
    try {
      await Promise.all(installationPromises);
      await new Promise(resolve => { setTimeout(resolve, 10000); });
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
export { insuranceClient, shopClient, repairServiceClient };
