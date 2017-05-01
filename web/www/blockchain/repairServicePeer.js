'use babel';

import { wrapError } from './utils';
import { repairServiceClient as client, isReady } from './setup';

export async function getRepairOrders() {
  if (!isReady()) {
    return;
  }
  try {
    const repairOrders = await client.invoke('repair_order_ls');
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
    const successResult = await client.invoke(`repair_order_complete`, { uuid });
    if (successResult) {
      throw new Error(successResult);
    }
  } catch (e) {
    throw wrapError(`Error marking repair order as complete: ${e.message}`, e);
  }
}
