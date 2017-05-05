'use strict';

import * as ClaimProcessingActionType from '../actions/claimProcessingActionTypes';
import * as initialState from './initialState';

export default function claimProcessingReducer(state = initialState.claimProcessing, action) {
  switch (action.type) {
    case ClaimProcessingActionType.LOAD_CLAIMS_SUCCESS:
      return Object.assign({}, state, {
        claims: [...action.claims]
      });
    case ClaimProcessingActionType.PROCESS_CLAIM_SUCCESS:
      let { contractUuid, uuid } = action;
      return Object({}, state, {
        claims: [...state.claims.filter(c => !(c.contractUuid === contractUuid && c.uuid === uuid))]
      })
    default:
      return state;
  }
}
