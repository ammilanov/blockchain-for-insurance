import { readFileSync } from 'fs';
import { resolve } from 'path';

let config = {
  channelName: 'default',
  channelConfig: '../../channel.tx',
  chaincodeId: 'bcins',
  chaincodeVersion: 'v1',
  chaincodePath: 'bcins',
  orderer0: {
    hostname: 'orderer0',
    url: 'grpc://orderer0:7050',
    pem: ''
  },
  insuranceOrg: {
    peer: {
      hostname: 'insurance-peer',
      url: 'grpc://insurance-peer:7051',
      pem: '',
      eventHubUrl: 'grpc://insurance-peer:7053',
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
      url: 'grpc://shop-peer:7051',
      pem: '',
      eventHubUrl: 'grpc://shop-peer:7053',
    },
    ca: {
      hostname: 'shop-ca',
      url: 'https://shop-ca:7054',
      mspId: 'ShopOrgMSP'
    }
  },
  repairServiceOrg: {
    peer: {
      hostname: 'repairservice-peer',
      url: 'grpc://repairservice-peer:7051',
      pem: '',
      eventHubUrl: 'grpc://repairservice-peer:7053',
    },
    ca: {
      hostname: 'repairservice-ca',
      url: 'https://repairservice-ca:7054',
      mspId: 'RepairServiceOrgMSP'
    }
  }
};

if (process.env.LOCALCONFIG) {
  config.orderer0.url = 'grpc://localhost:7050';

  config.insuranceOrg.peer.url = 'grpc://localhost:7051';
  config.shopOrg.peer.url = 'grpc://localhost:8051';
  config.repairServiceOrg.peer.url = 'grpc://localhost:9051';

  config.insuranceOrg.peer.eventHubUrl = 'grpc://localhost:7053';
  config.shopOrg.peer.eventHubUrl = 'grpc://localhost:8053';
  config.repairServiceOrg.peer.eventHubUrl = 'grpc://localhost:9053';

  config.insuranceOrg.ca.url = 'https://localhost:7054';
  config.shopOrg.ca.url = 'https://localhost:8054';
  config.repairServiceOrg.ca.url = 'https://localhost:9054';
}

// // Setup root certificates
// const basePath = resolve(__dirname, '../../certs');
// config.orderer0.pem = readFileSync(resolve(basePath, 'ordererOrg.pem')).toString();
// config.insuranceOrg.peer.pem = readFileSync(resolve(basePath, 'insuranceOrg.pem')).toString();
// config.shopOrg.peer.pem = readFileSync(resolve(basePath, 'shopOrg.pem')).toString();
// config.repairServiceOrg.peer.pem = readFileSync(resolve(basePath, 'repairServiceOrg.pem')).toString();

config.channelConfig = readFileSync(resolve(__dirname, config.channelConfig));
export default config;

export const DEFAULT_CONTRACT_TYPES = [
  {
    uuid: '63ef076a-33a1-41d2-a9bc-2777505b014f',
    shopType: 'B',
    formulaPerDay: 'price * 0.01 + 0.05',
    maxSumInsured: 4300.00,
    theftInsured: true,
    description: 'Contract for Mountain Bikers',
    conditions: 'Contract Terms here',
    minDurationDays: 1,
    maxDurationDays: 7,
    active: true
  },
  {
    uuid: '1d640cf7-9808-4c78-b7f0-55aaad02e9e5',
    shopType: 'B',
    formulaPerDay: 'price * 0.02',
    maxSumInsured: 3500.00,
    theftInsured: false,
    description: 'Insure Your Bike',
    conditions: 'Simple contract terms.',
    minDurationDays: 3,
    maxDurationDays: 10,
    active: true
  },
  {
    uuid: '17210a72-f505-42bf-a238-65c8898477e1',
    shopType: 'P',
    formulaPerDay: 'price * 0.001 + 5.00',
    maxSumInsured: 1500.00,
    theftInsured: true,
    description: 'Phone Insurance Contract',
    conditions: 'Exemplary contract terms here.',
    minDurationDays: 5,
    maxDurationDays: 10,
    active: true
  },
  {
    uuid: '17d773dc-2624-4c22-a478-87544dd0a17f',
    shopType: 'P',
    formulaPerDay: 'price * 0.005 + 10.00',
    maxSumInsured: 2500.00,
    theftInsured: true,
    description: 'Premium SmartPhone Insurance',
    conditions: 'Only for premium phone owners.',
    minDurationDays: 10,
    maxDurationDays: 20,
    active: true
  },
  {
    uuid: 'd804f730-8c77-4583-9247-ec9e753643db',
    shopType: 'S',
    formulaPerDay: '25.00',
    maxSumInsured: 5000.00,
    theftInsured: false,
    description: 'Short-Term Ski Insurance',
    conditions: 'Simple contract terms here.',
    minDurationDays: 3,
    maxDurationDays: 25,
    active: true
  },
  {
    uuid: 'dcee27d7-bf3c-4995-a272-8a306a35e51f',
    shopType: 'S',
    formulaPerDay: 'price * 0.001 + 10.00',
    maxSumInsured: 3000.00,
    theftInsured: true,
    description: 'Insure Ur Ski',
    conditions: 'Just do it.',
    minDurationDays: 1,
    maxDurationDays: 15,
    active: true
  },
  {
    uuid: 'c06f95d6-9b90-4d24-b8cb-f347d1b33ddf',
    shopType: 'BPS',
    formulaPerDay: '50',
    maxSumInsured: 3000.00,
    theftInsured: false,
    description: 'Universal Insurance Contract',
    conditions: 'Universal Contract Terms here. For all types of goods.',
    minDurationDays: 1,
    maxDurationDays: 10,
    active: true
  }
];
