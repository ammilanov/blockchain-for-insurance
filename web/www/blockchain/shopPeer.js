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
  }).catch(commonErrorHandlingFunction);
}

/**
 * Function requests a specific contract type from the Blockchain. Only the active contracts are returned.
 *
 * @export
 * @param {string} The ID of the requested contract type.
 * @returns {Promise<any>} A Promise containing a single contract type or a null if it does not exist.
 */
export async function getContractType(id) {
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'query';
  body.params.ctorMsg.function = 'read';
  body.params.ctorMsg.args = [id || ''];
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
    let mappedRes = JSON.parse((await res.json()).result.message);
    return snakeToCamelCase(mappedRes);
  });
}

/**
 * Function requests all contracts type from the Blockchain. Only the active contracts are returned.
 *
 * @returns {Promise<Array<any>>} A Promise containing all contract types in an array.
 */
export async function getContractTypes() {
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'query'
  body.params.ctorMsg.function = 'getAllContractTypes';
  body.params.ctorMsg.args = [];
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
    if (responseObject.result && responseObject.result.message) {
      return snakeToCamelCase(JSON.parse(responseObject.result.message)).contractTypes;
    } else {
      return [];
    }
  });
}

/**
 * Function creates a user. It returns the user if one with the same username/email exists.
 *
 * @export
 * @param {any} user The user object containing the user data.
 * @returns {Promise<any>} A promise that yield the an object containing the user data.
 */
export async function createUser({ username, password, firstName, lastName }) {
  try {
    let user = await doesUserExist(username);
    if (user) {
      return new Promise(resolve => {
        resolve(user);
      });
    }
  } catch (e) {
    return new Promise((resolve, reject) => reject(e));
  }

  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'invoke';
  body.params.ctorMsg.function = 'newConsumer';
  body.params.ctorMsg.args = [`user_${username}`, JSON.stringify({ username, password, firstname: firstName, lastname: lastName })];
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(async (res) => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    let createdUser = await doesUserExist(username);
    if (!createdUser) {
      // Retry creating user
      return await createUser({ username, password, firstName, lastName });
    }
    return createdUser;
  });
}

/**
 * Internal function that checks whether a user exists.
 *
 * @param {string} username The username of the user.
 * @returns {Promise<any|boolean>} A promise that yields an object containing the user data or false if the user does not exist.
 */
function doesUserExist(username) {
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
      return false;
    }
  });
}

/**
 * Function creates new contract using the provided contract type. The contract is associated with the provided user.
 *
 * @export
 * @param {string} username The username of the user the contract is associated with.
 * @param {string} contractTypeId The ID of the contract type.
 * @param {Object} additionalInfo Additional information linked to the contract entry.
 * @returns {Promise} A promise that indicates that the contract is signed.
 */
export async function enterContract(username, contractTypeId, additionalInfo = {
  item: {
    itemId: '',
    brand: '',
    model: '',
    price: '',
    serialNo: ''
  },
  startDate: 0,
  endDate: 0
}) {
  const user = await doesUserExist(username);
  if (!user) {
    return new Promise((resolve, reject) => {
      reject(new Error("Unknown user."));
    });
  }
  const contractType = await getContractType(contractTypeId);
  if (!contractType) {
    return new Promise((resolve, reject) => {
      reject(new Error("Unkown contract type"));
    });
  }
  let body = JSON.parse(JSON.stringify(bodyMessage));
  body.method = 'invoke';
  body.params.ctorMsg.function = 'newContract';
  body.params.ctorMsg.args = [
    `contract_${uuidV4()}`,
    JSON.stringify({
      terms: '',
      consumerid: `user_${username}`,
      contract: camelToSnakeCase(contractType),
      start_date: additionalInfo.startDate,
      end_date: additionalInfo.endDate,
      item: {
        itemid: String(additionalInfo.item.itemId),
        brand: additionalInfo.item.brand,
        model: additionalInfo.item.model,
        price: String(additionalInfo.item.price),
        serialno: additionalInfo.item.serialNo,
      },
      claims: []
    })
  ];
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(res => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    return; // successful outcome
  }).catch(commonErrorHandlingFunction);
}

function commonErrorHandlingFunction(error) {
  let handledError = error;
  console.log(error);
  return error;
}
