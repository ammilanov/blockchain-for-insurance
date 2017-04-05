'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

const app = ({ children, shopType }) => {
  let shopHeadingMessage;
  switch (shopType) {
    case 'bikes':
      shopHeadingMessage = <FormattedMessage id="Bike Shop" />;
      break;
    case 'smart-phones':
      shopHeadingMessage = <FormattedMessage id="Smart Phone Shop" />;
      break;
    case 'skis':
      shopHeadingMessage = <FormattedMessage id="Ski Shop" />;
      break;
  }

  const shopWrapper = (
    <div>
      <div className="ibm-columns">
        <div className="ibm-col-4-1 ibm-medium-2-1 ibm-small-1-1">
          <h2 className="ibm-h2">{shopHeadingMessage}</h2>
        </div>
      </div>
      {children}
    </div>
  );

  const defaultWrapper = (
    <div className="main-content">
      {children}
    </div>
  );

  return shopHeadingMessage ? shopWrapper : defaultWrapper;
};

app.propTypes = {
  shopType: PropTypes.string
}

function mapStateToProps(state, ownProps) {
  return {
    shopType: state.shop.type
  };
}

export default connect(mapStateToProps)(app);


