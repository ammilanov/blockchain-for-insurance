'use strict';

import * as ContractHistoryActionTypes from '../actions/contractHistoryActionTypes';
import * as initialState from './initialState';

export default function contractHistoryReducer(
  state = initialState.contractHistory, action) {
  switch (action.type) {
    case ContractHistoryActionTypes.LOAD_ALL_CONTRACTS_SUCCESS:
      return Object.assign({}, state, { contracts: [...action.contracts] });
    default:
      return state;
  }
}
