'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage } from 'react-intl';

export default ({ children }) => {
  return (
    <div>
      <div className="ibm-columns">
        <div className="ibm-col-1-1">
          <h2 className="ibm-h2">
            <FormattedMessage id='Contract Management' />
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
};
