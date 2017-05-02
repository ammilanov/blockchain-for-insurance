import { readFileSync } from 'fs';
import { resolve } from 'path';

let config = {
  channelName: 'default',
  chaincodeId: 'bcins',
  chaincodeVersion: 'v1',
  chaincodePath: 'bcins',
  orderer0: {
    hostname: 'orderer0',
    url: 'grpcs://orderer0:7050',
    pem: ''
  },
  insuranceOrg: {
    peer: {
      hostname: 'insurance-peer',
      url: 'grpcs://insurance-peer:7051',
      pem: '',
      eventHubUrl: 'grpcs://insurance-peer:7053',
    },
    ca: {
      hostname: 'insurance-ca',
      url: 'https://insurance-ca:7054',
      mspId: 'InsuranceOrgMSP'
    }
  },
  shopOrg: {
    peer: {
      hostname: 'shop-peer',
      url: 'grpcs://shop-peer:7051',
      pem: '',
      eventHubUrl: 'grpcs://shop-peer:7053',
    },
    ca: {
      hostname: 'shop-ca',
      url: 'https://shop-ca:7054',
      mspId: 'ShopOrgMSP'
    }
  },
  repairServiceOrg: {
    peer: {
      hostname: 'repairserivce-peer',
      url: 'grpcs://repairservice-peer:7051',
      pem: '',
      eventHubUrl: 'grpcs://repairservice-peer:7053',
    },
    ca: {
      hostname: 'repairservice-ca',
      url: 'https://repairservice-ca:7054',
      mspId: 'RepairServiceOrgMSP'
    }
  }
}

if (process.env.LOCALCONFIG) {
  config.orderer0.url = 'grpcs://localhost:7050';

  config.insuranceOrg.peer.url = 'grpcs://localhost:7051';
  config.shopOrg.peer.url = 'grpcs://localhost:8051';
  config.repairServiceOrg.peer.url = 'grpcs://localhost:9051';

  config.insuranceOrg.peer.eventHubUrl = 'grpcs://localhost:7053';
  config.shopOrg.peer.eventHubUrl = 'grpcs://localhost:8053';
  config.repairServiceOrg.peer.eventHubUrl = 'grpcs://localhost:9053';

  config.insuranceOrg.ca.url = 'https://localhost:7054';
  config.shopOrg.ca.url = 'https://localhost:8054';
  config.repairServiceOrg.ca.url = 'https://localhost:9054';
}

// Setup root certificates
const basePath = resolve(__dirname, '../../certs');
config.orderer0.pem = readFileSync(resolve(basePath, 'ordererOrg.pem')).toString();
config.insuranceOrg.peer.pem = readFileSync(resolve(basePath, 'insuranceOrg.pem')).toString();
config.shopOrg.peer.pem = readFileSync(resolve(basePath, 'shopOrg.pem')).toString();
config.repairServiceOrg.peer.pem = readFileSync(resolve(basePath, 'repairServiceOrg.pem')).toString();

export default config;
