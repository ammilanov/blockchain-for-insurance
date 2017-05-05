'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

const app = ({ children }) => {
  return (
    <div>
      <div className="ibm-columns">
        <div className="ibm-col-4-1 ibm-medium-2-1 ibm-small-1-1">
          <h2 className="ibm-h2">
            <FormattedMessage id='Repair Service' />
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}

export default app;
