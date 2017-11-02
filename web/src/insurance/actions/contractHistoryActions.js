'use strict';

import * as ContractHistoryActionTypes from './contractHistoryActionTypes';
import * as Api from '../api';

export function loadAllContracts() {
  return async dispatch => {
    let contracts;
    try {
      contracts = await Api.getAllContracts();
    } catch (e) {
      console.log(e);
    }
    if (Array.isArray(contracts)) {
      dispatch(loadAllContractsSuccess(contracts));
    }
  };
}

function loadAllContractsSuccess(contracts) {
  return {
    type: ContractHistoryActionTypes.LOAD_ALL_CONTRACTS_SUCCESS,
    contracts
  };
}
