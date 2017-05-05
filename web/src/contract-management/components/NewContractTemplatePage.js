'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as contractTemplateActions from '../actions/contractTemplateActions';

class NewContractTemplatePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bikeShop: false,
      phoneShop: false,
      skiShop: false,
      formulaPerDay: 'price * 0.001',
      maxSumInsured: 2000,
      description: '',
      conditions: '',
      minDurationDays: 1,
      maxDurationDays: 5
    }
  }

  setField(event) {

  }

  render() {
    return (
      <div>

      </div>
    );
  }
}

NewContractTemplatePage.propTypes = {
  intl: intlShape.isRequired
}

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    contractTemplateActions: bindActionCreators(contractTemplateActions, dispatch)
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(NewContractTemplatePage));
