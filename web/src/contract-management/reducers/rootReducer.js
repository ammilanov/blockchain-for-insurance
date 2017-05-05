'use strict';

import { combineReducers } from 'redux';

import claimProcessing from './claimProcessingReducer';
import contractTemplates from './contractTemplatesReducer';

export default combineReducers({ claimProcessing, contractTemplates });
