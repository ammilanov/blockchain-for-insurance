'use strict';

import { combineReducers } from 'redux';

import contracts from './contractsReducer';
import userMgmt from './userMgmtReducer';

export default combineReducers({ contracts, userMgmt });
