'use strict';

import config from './config';
import { wrapError } from './utils';
import { repairServiceClient as client, isReady } from './setup';

export async function getRepairOrders() {
  if (!isReady()) {
    return;
  }
  try {
    const repairOrders = await query('repair_order_ls');
    return repairOrders;
  } catch (e) {
    throw wrapError(`Error getting repair orders: ${e.message}`, e);
  }
}

export async function completeRepairOrder(uuid) {
  if (!isReady()) {
    return;
  }
  try {
    const successResult = await invoke(`repair_order_complete`, { uuid });
    if (successResult) {
      throw new Error(successResult);
    }
  } catch (e) {
    throw wrapError(`Error marking repair order as complete: ${e.message}`, e);
  }
}

function invoke(fcn, ...args) {
  return client.invoke(config.chaincodeId, config.chaincodeVersion, config.chaincodePath, fcn, ...args);
}

function query(fcn, ...args) {
 return client.query(config.chaincodeId, config.chaincodeVersion, config.chaincodePath, fcn, ...args);
}
