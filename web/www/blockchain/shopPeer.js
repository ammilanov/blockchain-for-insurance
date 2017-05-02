'use babel';

import { wrapError } from './utils';
import { shopClient as client, isReady } from './setup';
import uuidV4 from 'uuid/v4';

export async function getContractTypes(shopType) {
  if (!isReady()) {
    return;
  }
  try {
    const contractTypes = await client.invoke('contract_type_ls', camelToSnakeCase({ shopType }));
    return snakeToCamelCase(contractTypes);
  } catch (e) {
    throw wrapError(`Error getting contract types for shop type ${shopType} : ${e.message}`, e);
  }
}

export async function createContract(contract) {
  if (!isReady()) {
    return;
  }
  try {
    let uuid = new uuidV4();
    let c = Object.assign({}, contract, { uuid });
    const loginInfo = await client.invoke('contract_create', c);
    if (!loginInfo ^ (loginInfo.username && loginInfo.password)) {
      loginInfo.uuid = uuid;
      return loginInfo;
    } else {
      throw new Error(loginInfo);
    }
  } catch (e) {
    throw wrapError(`Error creating contract: ${e.message}`, e);
  }
}

export async function createUser(user) {
  if (!isReady()) {
    return;
  }
  try {
    const loginInfo = await client.invoke('user_create', user);
    if (!loginInfo ^ (loginInfo.username && loginInfo.password)) {
      return loginInfo;
    } else {
      throw new Error(loginInfo);
    }
  } catch (e) {
    throw wrapError(`Error creating user: ${e.message}`, e);
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
