'use babel';

import { resolve } from 'path';

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

export class OrganizationClient {

  constructor(channelName, ordererConfig, peerConfig, caConfig) {
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
      'ssl-target-name-override': peerConfig.hostname,
      "grpc.initial_reconnect_backoff_ms": 5000
    });
    this._eventHubs.push(defaultEventHub);
    defaultEventHub.connect();
  }

  async initialize() {
    try {
      this._client.setStateStore(
        await hfc.newDefaultKeyValueStore({ path: `./${this._peerConfig.hostname}` }));
      this._adminUser = await getSubmitter(this._client, "admin", "adminpw", this._caConfig);
    } catch (e) {
      console.log(`Failed to enroll user. Error: ${e.message}`);
      throw e;
      return;
    }

    try {
      await this._chain.initialize();
    } catch (e) {
      console.log(`Failed to initialize chain. Error: ${e.message}`);
      throw e;
      return;
    }
  }

  async checkInstalled(chaincodeName) {
    let chaincodes = await this._chain.queryInstantiatedChaincode();
    return chaincodes;
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
    let allGood = proposalResponses.every(pr => pr.response
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
      throw new Error(`Proposal rejected by some of the peers: ${proposalResponses}`);
    }

    let transactionCompletePromise = this._eventHubs.map(eh => {
      return new Promise((resolve, reject) => {
        let responseTimeout = setTimeout(() => {
          reject(new Error('Peer did not respond in a timely fashion!'));
        }, INSTALL_TIMEOUT);

        let deployId = txId.toString();
        eh.registerTxEvent(deployId, (tx, code) => {
          clearTimeout(responseTimeout);

          eh.unregisterTxEvent(deployId);

          if (code != 'VALID') {
            reject(new Error(`Peer has rejected transaction with code: ${code}`));
          } else {
            resolve();
          }
        });
      });
    });

    transactionCompletePromise.push(this._chain.sendTransaction(request));
    await transactionCompletePromise;
  }

  async invoke(func, ...args) {

  }

  async query(func, ...args) {

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
export async function getSubmitter(client, enrollmentID, enrollmentSecret, { url, mspId }) {

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
      throw new Error(`Failed to enroll and persist User. Error: ${e.messsage}`);
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
    return snakeArgs.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
  }

  if (typeof args === 'object') {
    return [JSON.stringify(snakeArgs)];
  }
}

function unmarshalResult(result) {

}
