'use babel';

import { wrapError } from './utils';
import { insuranceClient as client, isReady } from './setup';
import uuidV4 from 'uuid/v4';

export async function getContractTypes() {
  if (!isReady()) {
    return;
  }
  try {
    const contractTypes = await client.invoke('contract_type_ls');
    return contractTypes;
  } catch (e) {
    throw wrapError(`Error getting contract types: ${e.message}`, e);
  }
}

export async function createContractType(contractType) {
  if (!isReady()) {
    return;
  }
  try {
    let uuid = uuidV4();
    let ct = Object.assign({}, contractType, { uuid });
    const successResult = await client.invoke('contract_type_create', ct);
    if (successResult) {
      throw new Error(successResult);
    }
    return uuid;
  } catch (e) {
    throw wrapError(`Error creating contract type: ${e.message}`, e);
  }
}

export async function setActiveContractType(uuid, active) {
  if (!isReady()) {
    return;
  }
  try {
    const successResult = await client.invoke('contract_type_set_active',
      { uuid, active });
    if (successResult) {
      throw new Error(successResult);
    }
    return successResult;
  } catch (e) {
    throw wrapError(`Error setting active contract type: ${e.message}`, e);
  }
}

export async function getContracts(username) {
  if (!isReady()) {
    return;
  }
  try {
    if (typeof username !== 'string') {
      username = undefined;
    }
    const contracts = await client.invoke('contract_ls', { username });
    return contracts;
  } catch (e) {
    let errMessage;
    if (username) {
      errMessage = `Error getting contracts for user ${username}: ${e.message}`;
    } else {
      errMessage = `Error getting all contracts: ${e.message}`;
    }
    throw wrapError(errMessage, e);
  }
}

export async function getClaims() {
  if (!isReady()) {
    return;
  }
  try {
    if (typeof status !== 'string') {
      status = undefined;
    }
    const claims = await client.invoke('claim_ls', { status });
    return claims;
  } catch (e) {
    let errMessage;
    if (status) {
      errMessage = `Error getting claims with status ${status}: ${e.message}`;
    } else {
      errMessage = `Error getting all claims: ${e.message}`;
    }
    throw wrapError(errMessage, e);
  }
}

export async function fileClaim(claim) {
  if (!isReady()) {
    return;
  }
  try {
    let uuid = uuidV4();
    let c = Object.assign({}, claim, { uuid });
    const successResult = await client.invoke('claim_file', c);
    if (successResult) {
      throw new Error(successResult);
    }
    return uuid;
  } catch (e) {
    throw wrapError(`Error filing a new claim: ${e.message}`, e);
  }
}

export async function processClaim(uuid, status, refundable) {
  if (!isReady()) {
    return;
  }
  try {
    const successResult = await client.invoke('claim_process', { uuid, status, refundable });
    if (successResult) {
      throw new Error(successResult);
    }
    return successResult;
  } catch (e) {
    throw wrapError(`Error processing claim: ${e.message}`, e);
  }
}

export async function authenticateUser(username, password) {
  if (!isReady()) {
    return;
  }
  try {
    let authenticated = await client.invoke('user_authenticate', { username, password });
    if (authenticated === undefined || authenticated === null) {
      throw new Error('Unknown error, invalid response!');
    }
    return authenticated;
  } catch (e) {
    throw wrapError(`Error authenticating user: ${e.message}`, e);
  }
}

export async function getUserInfo(username) {
  if (!isReady()) {
    return;
  }
  try {
    const user = await client.invoke('user_get_info', { username });
    return user;
  } catch (e) {
    throw wrapError(`Error getting user info: ${e.message}`, e);
  }
}
