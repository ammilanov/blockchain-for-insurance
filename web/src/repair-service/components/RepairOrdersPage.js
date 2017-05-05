'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as RepairServiceActions from '../actions/repairServiceActions';

class RepairOrdersPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { repairOrders } = this.props;

    const cards = Array.isArray(repairOrders) ? repairOrders.map((repairOrder, index) => (
      <div key={index}>
      </div>
    )) : null;
    return (
      <div>
        {cards}
      </div>
    );
  }
}

RepairOrdersPage.propTypes = {
  intl: intlShape.isRequired,
  repairOrders: PropTypes.array
}

function mapStateToProps(state, ownProps) {
  return {
    repairOrders: state.repairService.repairOrders,
    loading: !Array.isArray(state.repairOrders.repairOrders)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    repairServiceActions: bindActionCreators(repairServiceActions, dispatch)
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(RepairOrdersPage));
