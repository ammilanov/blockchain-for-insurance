'use strict';

import fetch from 'isomorphic-fetch';
import { snakeToCamelCase, camelToSnakeCase } from 'json-style-converter';
import uuidV4 from 'uuid/v4';

const url = 'https://a4f3e008e065463a905245fe48fcb62f-vp1.us.blockchain.ibm.com:5002/chaincode';
const bodyMessage = {
  "jsonrpc": "2.0",
  "params": {
    "type": 1,
    "chaincodeID": {
      "name": "213b55b2de35e681912904b5eea3e256f087193279ba8e99d541fc4c3f77652e293ff398666cdfde98edd47929dc8f2eb944b726ba3e6136811273f8b43ce254"
    },
    "ctorMsg": {
      "function": null,
      "args": null
    },
    "secureContext": "user_type1_1"
  },
  "id": 4
};

/**
 * Function checks compares the login data to the Blockchain to ensure it is correct.
 *
 * @param {any} { username, password } A user object containing the username and the password
 * @returns {Promise<boolean>} A Promise containing a boolean that specifies whether such user exists.
 */
export function authenticateUser({ username, password }) {
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'query';
  body.params.ctorMsg.function = 'loginConsumer';
  body.params.ctorMsg.args = [`user_${username}`, password];

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(async res => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    let response = await res.json();
    return !response.error;
  });
}

/**
 *  Function gets the contracts associated with the give user.
 *
 * @param {string} username The username of the user.
 * @returns {Promise<Array<any>>} A promise that yields an array with the contracts.
 */
export function getContractsForUser(username) {
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'query';
  body.params.ctorMsg.function = 'getConsumerContracts';
  body.params.ctorMsg.args = [`user_${username}`];

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(async res => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    const responseObject = await res.json();
    if (typeof responseObject.result.message === 'string') {
      const contracts = snakeToCamelCase(JSON.parse(responseObject.result.message));
      return contracts.map(contract => {
        contract.contractItem.item.itemId = contract.contractItem.item.itemid;
        delete contract.contractItem.item.itemid;
        contract.contractItem.item.serialNo = contract.contractItem.item.serialno;
        delete contract.contractItem.item.serialno;
        return Object.assign({ id: contract.contractId }, contract.contractItem);
      });
    } else {
      return [];
    }
  });
}

/**
 * Function issues a claim to a given contract.
 * 
 * @param {strin} contractId The contract id.
 * @param {any} claim The claim object containing details about the claim.
 */
export function submitClaim(contractId, claim) {
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'invoke';
  body.params.ctorMsg.function = 'newClaim';
  claim.claimid = `claim_${uuidV4()}`;
  body.params.ctorMsg.args = [contractId, JSON.stringify(camelToSnakeCase(claim))];

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(async res => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    return;
  });
}

/**
 * Internal function returns the user.
 *
 * @param {string} username The username of the user.
 * @returns {Promise<any>} A promise that yields an object containing the user data.
 */
function getUser(username) {
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'query';
  body.params.ctorMsg.function = 'read';
  body.params.ctorMsg.args = [`user_${username}`];
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(async res => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    let responseObject = await res.json();
    if (responseObject.result && responseObject.result.message) {
      let user = JSON.parse(responseObject.result.message);
      return {
        username: user.username,
        email: user.username,
        password: user.password,
        firstName: user.firstname,
        lastName: user.lastname
      };
    } else {
      return null;
    }
  });
}
