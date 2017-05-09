'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

const app = ({ children }) => {
  return (
    <div>
      <div className="ibm-columns">
        <div className="ibm-col-1-1">
          <h2 className="ibm-h2">
            <FormattedMessage id='Claim Self-Service' />
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}

export default app;
