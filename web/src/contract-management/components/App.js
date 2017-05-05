'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage } from 'react-intl';

export const app = ({ children }) => {
  return (
    <div>
      <div className="ibm-columns">
        <div className="ibm-col-4-1 ibm-medium-2-1 ibm-small-1-1">
          <h2 className="ibm-h2">
            <FormattedMessage id='Contract Management' />
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
};
