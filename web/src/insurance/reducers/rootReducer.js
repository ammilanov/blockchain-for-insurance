'use strict';

import { combineReducers } from 'redux';

import claimProcessing from './claimProcessingReducer';
import contractTemplates from './contractTemplatesReducer';
import contracts from './contractsReducer';
import userMgmt from './userMgmtReducer';
import contractHistory from './contractHistoryReducer';

export default combineReducers({
  claimProcessing,
  contractTemplates,
  contracts,
  userMgmt,
  contractHistory
 });
