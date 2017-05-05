'use strict';

import React, { PropTypes, Props } from 'react';
import { bindActionCreators } from 'redux';
import { FormattedMessage, FormattedDate, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import Loading from '../../shared/Loading';
import * as claimProcessingActions from '../actions/claimProcessingActions';

class ClaimsPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { loading, intl, claimProcessingActions, claims } = this.props;

    const cards = Array.isArray(claims) ? claims.map((claim, index) => (
      <div key={index} className='ibm-col-3-1 ibm-col-medium-6-3'>
        <div className='ibm-card ibm-border-gray-50'>
          <div className='ibm-card__content'>
            <h4 className='ibm-bold ibm-h4'>{claim.description}</h4>
            <div style={{ wordWrap: 'break-word' }}>
              <FormattedMessage id='Description' />: {claim.description} <br />
              <FormattedMessage id='Creation Date' />: <FormattedDate value={claim.date} /> <br />
              <FormattedMessage id='Refundable' />:
              <input type='text' value={claim.refundable} /> <br />
              <FormattedMessage id='Theft Involved' />: <input type='checkbox' ref='theftField'
                className='ibm-styled-checkbox'
                checked={claim.isTheft} />
              <label className='ibm-field-label' htmlFor='theftField'></label><br />
            </div>
            <br />
            {claimButtons(claim)}
          </div>
        </div>
      </div>
    )) : null;
    function claimButtons(c) {
      const repairButton = c.isTheft ? null : (
        <button type='button' className='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'
          style={{ marginLeft: '5px', marginRight: '5px' }}
          onClick={() => { claimProcessingActions.processClaim(c.contractUuid, c.uuid, 'R', 0); }}>
          <FormattedMessage id='Repair' />
        </button>
      );
      const refundButton = (
        <button type='button' className='ibm-btn-sec ibm-btn-small ibm-btn-teal-50'
          style={{ marginLeft: '5px', marginRight: '5px' }}
          onClick={() => { claimProcessingActions.processClaim(c.contractUuid, c.uuid, 'F', c.refundable); }}>
          <FormattedMessage id='Refund' />
        </button>
      );
      const rejectButton = (
        <button type='button' className='ibm-btn-sec ibm-btn-small ibm-btn-red-50'
          style={{ marginLeft: '5px', marginRight: '5px' }}
          onClick={() => { claimProcessingActions.processClaim(c.contractUuid, c.uuid, 'J', 0); }}>
          <FormattedMessage id='Reject' />
        </button>
      );

      return (
        <div>
          {[repairButton, refundButton, rejectButton]}
        </div>
      );
    }
    return (
      <Loading hidden={!loading} text={intl.formatMessage({ id: 'Loading Claims...' })}>
        <div className='ibm-columns' style={{ minHeight: '6em' }}>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'><FormattedMessage id='Unprocessed Claims' /></h3>
          </div>
          <div className='ibm-columns ibm-cards' data-widget='masonry' data-items='.ibm-col-3-1'>
            {cards}
          </div>
        </div>
      </Loading>
    );
  }
}

ClaimsPage.propTypes = {
  intl: intlShape.isRequired,
  claims: PropTypes.array
}

function mapStateToProps(state, ownProps) {
  return {
    claims: state.claimProcessing.claims,
    loading: !Array.isArray(state.claimProcessing.claims)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    claimProcessingActions: bindActionCreators(claimProcessingActions, dispatch)
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ClaimsPage));
