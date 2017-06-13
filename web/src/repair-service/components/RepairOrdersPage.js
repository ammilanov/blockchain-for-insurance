'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import Loading from '../../shared/Loading';
import * as repairServiceActions from '../actions/repairServiceActions';

class RepairOrdersPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { repairOrders, loading, intl, repairServiceActions } = this.props;

    const cards = Array.isArray(repairOrders) ? repairOrders.map(
      (repairOrder, index) => (
        <div key={index} className='ibm-col-5-1 ibm-col-medium-6-2'>
          <div className='ibm-card ibm-border-gray-50'>
            <div className='ibm-card__content'>
              <h4 className='ibm-bold ibm-h4'>
                <FormattedMessage id='Repair Order' />
              </h4>
              <div style={{ wordWrap: 'break-word' }}>
                <p>
                  <FormattedMessage id='Brand' />:
                  {repairOrder.item.brand} <br />
                  <FormattedMessage id='Model' />:
                  {repairOrder.item.model} <br />
                  <FormattedMessage id='Description' />:
                {repairOrder.item.description} <br />
                </p>
                <p>
                  <button type='button'
                    className='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'
                    onClick={repairServiceActions.completeRepairOrder(
                      repairOrder.uuid)}>
                    <FormattedMessage id='Mark Completed' />
                  </button>
                </p>
              </div>
              <br />
            </div>
          </div>
        </div>
      )) : null;
    const orders = ((Array.isArray(cards) && cards.length > 0) ||
      cards === null) ? cards :
      (
        <div className='ibm-col-5-5 ibm-col-medium-6-6'>
          <FormattedMessage id='No outstanding repair orders.' />
        </div>
      );
    return (
      <Loading hidden={!loading}
        text={intl.formatMessage({ id: 'Loading Repair Orders...' })}>
        <div className='ibm-columns ibm-cards' style={{ minHeight: '30vh' }}
          data-widget='masonry' data-items='.ibm-col-5-1'>
          {orders}
        </div>
      </Loading>
    );
  }
}

RepairOrdersPage.propTypes = {
  intl: intlShape.isRequired,
  repairOrders: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  repairServiceActions: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    repairOrders: state.repairService.repairOrders,
    loading: !Array.isArray(state.repairService.repairOrders)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    repairServiceActions: bindActionCreators(repairServiceActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(RepairOrdersPage)));
