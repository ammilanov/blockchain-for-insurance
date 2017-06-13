'use strict';

import { resolve } from 'path';
import EventEmitter from 'events';

import { load as loadProto } from 'grpc';
import Long from 'long';
import hfc from 'fabric-client';
import utils from 'fabric-client/lib/utils';
import Orderer from 'fabric-client/lib/Orderer';
import Peer from 'fabric-client/lib/Peer';
import EventHub from 'fabric-client/lib/EventHub';
import User from 'fabric-client/lib/User';
import CAClient from 'fabric-ca-client';
import { snakeToCamelCase, camelToSnakeCase } from 'json-style-converter';

process.env.GOPATH = resolve(__dirname, '../../chaincode');
const INSTALL_TIMEOUT = 120000;
const _commonProto = loadProto(resolve(__dirname,
  '../../node_modules/fabric-client/lib/protos/common/common.proto')).common;

export class OrganizationClient extends EventEmitter {

  constructor(channelName, ordererConfig, peerConfig, caConfig) {
    super();
    this._channelName = channelName;
    this._ordererConfig = ordererConfig;
    this._peerConfig = peerConfig;
    this._caConfig = caConfig;

    this._peers = [];
    this._eventHubs = [];
    this._client = new hfc();

    // Setup channel
    this._chain = this._client.newChain(channelName);

    // Setup orderer and peers
    this._chain.addOrderer(new Orderer(ordererConfig.url, {
      pem: ordererConfig.pem,
      'ssl-target-name-override': ordererConfig.hostname
    }));

    let defaultPeer = new Peer(peerConfig.url, {
      pem: peerConfig.pem,
      'ssl-target-name-override': peerConfig.hostname
    });
    this._peers.push(defaultPeer);
    this._chain.addPeer(defaultPeer);
    this._adminUser = null;

    // Setup event hubs
    let defaultEventHub = new EventHub();
    defaultEventHub.setPeerAddr(peerConfig.eventHubUrl, {
      pem: peerConfig.pem,
      'ssl-target-name-override': peerConfig.hostname
    });
    defaultEventHub.connect();
    defaultEventHub.registerBlockEvent(
      block => { this.emit('block', unmarshalBlock(block)); });
    this._eventHubs.push(defaultEventHub);
  }

  async login() {
    try {
      this._client.setStateStore(
        await hfc.newDefaultKeyValueStore(
          { path: `./${this._peerConfig.hostname}` }));
      this._adminUser = await getSubmitter(
        this._client, "admin", "adminpw", this._caConfig);
    } catch (e) {
      console.log(`Failed to enroll user. Error: ${e.message}`);
      throw e;
    }
  }

  async initialize() {
    try {
      await this._chain.initialize();
    } catch (e) {
      console.log(`Failed to initialize chain. Error: ${e.message}`);
      throw e;
    }
  }

  async createChannel(configTxBuffer) {
    let request = {
      envelope: configTxBuffer
    };
    let response = await this._chain.createChannel(request);
    // Wait for 5sec to create channel
    await new Promise(resolve => { setTimeout(resolve, 5000); });
    return response;
  }

  async joinChannel() {
    const nonce = utils.getNonce();
    const txId = this._chain.buildTransactionID(nonce, this._adminUser);
    const request = {
      targets: this._peers,
      txId,
      nonce
    };

    try {
      const blockRegisteredPromises = this._eventHubs.map(eh => {
        eh.connect();
        return new Promise((resolve, reject) => {
          const cb = block => {
            clearTimeout(responseTimeout);
            if (block.data.data.length === 1) {
              const envelope = _commonProto.Envelope.decode(block.data.data[0]);
              const payload = _commonProto.Payload.decode(envelope.payload);
              const channelHeader = _commonProto.ChannelHeader.decode(
                payload.header.channel_header);

              if (channelHeader.channel_id === this._channelName) {
                eh.unregisterBlockEvent(cb);
                resolve();
              }
            }
          };

          let responseTimeout = setTimeout(() => {
            eh.unregisterBlockEvent(cb);
            reject(new Error('Peer did not respond in a timely fashion!'));
          }, INSTALL_TIMEOUT);
          eh.registerBlockEvent(cb);
        });
      });

      const sendPromise = this._chain.joinChannel(request);
      await Promise.all([blockRegisteredPromises, sendPromise]);
    } catch (e) {
      console.log('Error joining peer to channel.');
      throw e;
    }
  }

  async checkChannelMembership() {
    try {
      const channelConfig = await this._chain.getChannelConfig();
      return true;
    } catch (e) {
      return false;
    }
  }

  async checkInstalled(chaincodeId, chaincodeVersion, chaincodePath) {
    let { chaincodes } = await this._chain.queryInstantiatedChaincodes();
    if (!Array.isArray(chaincodes)) {
      return false;
    }
    return chaincodes.some(cc =>
      cc.name === chaincodeId &&
      cc.path === chaincodePath &&
      cc.version === chaincodeVersion);
  }

  async install(chaincodeId, chaincodeVersion, chaincodePath) {
    let nonce = utils.getNonce();
    let txId = this._chain.buildTransactionID(nonce, this._adminUser);

    let request = {
      targets: this._peers,
      chaincodePath,
      chaincodeId,
      chaincodeVersion,
      txId,
      nonce
    };

    // Make install proposal to all peers
    let results;
    try {
      results = await this._chain.sendInstallProposal(request);
    } catch (e) {
      console.log('Error sending install proposal to peer!');
      throw e;
    }
    let proposalResponses = results[0];
    let allGood = proposalResponses.every(
      pr => pr.response
        && pr.response.status == 200);
    return allGood;
  }

  async instantiate(chaincodeId, chaincodeVersion, chaincodePath, ...args) {
    let nonce = utils.getNonce();
    let txId = this._chain.buildTransactionID(nonce, this._adminUser);

    let request = {
      chaincodePath,
      chaincodeId,
      chaincodeVersion,
      fcn: 'init',
      args: marshalArgs(args),
      chainId: this._channelName,
      txId,
      nonce
    };

    let results = await this._chain.sendInstantiateProposal(request);
    let proposalResponses = results[0];
    let proposal = results[1];
    let header = results[2];

    let allGood = proposalResponses.every(pr => pr.response
      && pr.response.status == 200);

    if (!allGood) {
      throw new Error(
        `Proposal rejected by some (all) of the peers: ${proposalResponses}`);
    }

    request = {
      proposalResponses,
      proposal: results[1],
      header: results[2]
    };

    const deployId = txId.toString();

    let transactionCompletePromises = this._eventHubs.map(eh => {
      eh.connect();

      return new Promise((resolve, reject) => {
        // Set timeout for the transaction response from the current peer
        const responseTimeout = setTimeout(() => {
          eh.unregisterTxEvent(deployId);
          reject(new Error('Peer did not respond in a timely fashion!'));
        }, INSTALL_TIMEOUT);

        eh.registerTxEvent(deployId, (tx, code) => {
          clearTimeout(responseTimeout);
          eh.unregisterTxEvent(deployId);
          if (code != 'VALID') {
            reject(new Error(
              `Peer has rejected transaction with code: ${code}`));
          } else {
            resolve();
          }
        });
      });
    });

    transactionCompletePromises.push(this._chain.sendTransaction(request));
    await transactionCompletePromises;
  }

  async invoke(chaincodeId, chaincodeVersion, chaincodePath, fcn, ...args) {
    let nonce = utils.getNonce();
    let txId = this._chain.buildTransactionID(nonce, this._adminUser);

    let request = {
      chaincodePath,
      chaincodeId,
      chaincodeVersion,
      fcn,
      args: marshalArgs(args),
      chainId: this._channelName,
      txId,
      nonce
    };

    let results = await this._chain.sendTransactionProposal(request);
    let proposalResponses = results[0];
    let proposal = results[1];
    let header = results[2];

    let allGood = proposalResponses.every(pr => pr.response
      && pr.response.status == 200);

    if (!allGood) {
      throw new Error(
        `Proposal rejected by some (all) of the peers: ${proposalResponses}`);
    }

    request = {
      proposalResponses,
      proposal: results[1],
      header: results[2]
    };

    const deployId = txId.toString();
    let transactionCompletePromises = this._eventHubs.map(eh => {
      eh.connect();

      return new Promise((resolve, reject) => {
        // Set timeout for the transaction response from the current peer
        const responseTimeout = setTimeout(() => {
          eh.unregisterTxEvent(deployId);
          reject(new Error('Peer did not respond in a timely fashion!'));
        }, INSTALL_TIMEOUT);

        eh.registerTxEvent(deployId, (tx, code) => {
          clearTimeout(responseTimeout);
          eh.unregisterTxEvent(deployId);
          if (code != 'VALID') {
            reject(new Error(
              `Peer has rejected transaction with code: ${code}`));
          } else {
            resolve();
          }
        });
      });
    });

    transactionCompletePromises.push(this._chain.sendTransaction(request));
    try {
      await transactionCompletePromises;
      const payload = proposalResponses[0].response.payload;
      return unmarshalResult([payload]);
    } catch (e) {
      throw e;
    }
  }

  async query(chaincodeId, chaincodeVersion, chaincodePath, fcn, ...args) {
    let nonce = utils.getNonce();
    let txId = this._chain.buildTransactionID(nonce, this._adminUser);

    let request = {
      chaincodePath,
      chaincodeId,
      chaincodeVersion,
      fcn,
      args: marshalArgs(args),
      chainId: this._channelName,
      txId,
      nonce
    };
    return unmarshalResult(await this._chain.queryByChaincode(request));
  }

  async getBlocks(noOfLastBlocks) {
    if (typeof noOfLastBlocks !== 'number' &&
      typeof noOfLastBlocks !== 'string') {
      return [];
    }

    const { height } = await this._chain.queryInfo();
    let blockCount;
    if (height.comp(noOfLastBlocks) > 0) {
      blockCount = noOfLastBlocks;
    } else {
      blockCount = height;
    }
    if (typeof blockCount === 'number') {
      blockCount = Long.fromNumber(blockCount, blockCount.unsigned);
    } else if (typeof blockCount === 'string') {
      blockCount = Long.fromString(blockCount, blockCount.unsigned);
    }

    const queryBlock = this._chain.queryBlock.bind(this._chain);
    const blockPromises = {};
    blockPromises[Symbol.iterator] = function* () {
      for (let i = Long.fromInt(1); i.comp(blockCount) <= 0; i = i.add(1)) {
        yield queryBlock(height.sub(i).toInt());
      }
    };
    const blocks = await Promise.all(blockPromises);
    return blocks.map(unmarshalBlock);
  }
}

/**
 * Enrolls a user with the respective CA.
 *
 * @export
 * @param {string} client
 * @param {string} enrollmentID
 * @param {string} enrollmentSecret
 * @param {object} { url, mspId }
 * @returns the User object
 */
export async function getSubmitter(
  client, enrollmentID, enrollmentSecret, { url, mspId }) {

  try {
    let user = await client.getUserContext(enrollmentID);
    if (user && user.isEnrolled()) {
      return user;
    }

    // Need to enroll with CA server
    let ca = new CAClient(url);

    try {
      let enrollment = await ca.enroll({ enrollmentID, enrollmentSecret });
      user = new User(enrollmentID, client);
      await user.setEnrollment(enrollment.key, enrollment.certificate, mspId);
      await client.setUserContext(user);
      return user;
    } catch (e) {
      throw new Error(
        `Failed to enroll and persist User. Error: ${e.messsage}`);
    }
  } catch (e) {
    throw new Error(`Could not get UserContext! Error: ${e.message}`);
  }

}

export function wrapError(message, innerError) {
  let error = new Error(message);
  error.inner = innerError;
  console.log(error.message);
  throw error;
}

function marshalArgs(args) {
  if (!args) {
    return args;
  }

  if (typeof args === 'string') {
    return [args];
  }

  let snakeArgs = camelToSnakeCase(args);

  if (Array.isArray(args)) {
    return snakeArgs.map(
      arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
  }

  if (typeof args === 'object') {
    return [JSON.stringify(snakeArgs)];
  }
}

function unmarshalResult(result) {
  if (!Array.isArray(result)) {
    return result;
  }
  let buff = Buffer.concat(result);
  if (!Buffer.isBuffer(buff)) {
    return result;
  }
  let json = buff.toString('utf8');
  if (!json) {
    return null;
  }
  let obj = JSON.parse(json);
  return snakeToCamelCase(obj);
}

function unmarshalBlock(block) {
  const transactions = Array.isArray(block.data.data) ?
    block.data.data.map(data => {
      const envelope = _commonProto.Envelope.decode(data);
      const payload = _commonProto.Payload.decode(envelope.payload);
      const channelHeader = _commonProto.ChannelHeader.decode(
        payload.header.channel_header);

      const type = Object.keys(_commonProto.HeaderType).find(key =>
        _commonProto.HeaderType[key] === channelHeader.type);
      return {
        type,
        timestamp: channelHeader.timestamp
      };
    }) : [];
  return {
    id: block.header.number.toString(),
    fingerprint: block.header.data_hash.buffer.toString('hex').slice(0, 20),
    transactions
  };
}
