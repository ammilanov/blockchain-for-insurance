'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

class SummaryPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { username, password } = this.props.user;
    return (
      <div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'>
              <FormattedMessage id='Summary' />
            </h3>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <div>
              <FormattedMessage id='Transaction completed.' />
            </div>
            <div>
              <FormattedMessage id='Username' />: {username}
            </div>
            <div>
              <FormattedMessage id='Password' />: {password}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SummaryPage.propTypes = {
  productInfo: PropTypes.object.isRequired,
  contractInfo: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    productInfo: state.shop.productInfo,
    contractInfo: state.insurance.contractInfo,
    user: state.userMgmt.user
  };
}

export default connect(mapStateToProps)(SummaryPage);
