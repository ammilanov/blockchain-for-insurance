'use strict';

import * as RepairServiceActionType from '../actions/repairServiceActionTypes';
import * as initialState from './initialState';

export default function repairServiceReducer(state = initialState.repairService, action) {
  switch (action.type) {
    case RepairServiceActionType.LOAD_REPAIR_ORDERS_SUCCESS:
      return Object.assign({}, state, { repairOrders: action.repairOrders });
    case RepairServiceActionType.COMPLETE_REPAIR_ORDER_SUCCESS:
      return Object.assign({}, state,
        {
          repairOrders: [
            ...(state.repairOrders.filter(ro => ro.uuid !== action.uuid))
          ]
        });
    default:
      return state;
  }
}
