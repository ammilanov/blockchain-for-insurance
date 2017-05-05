'use strict';

import React, { Props, PropTypes } from 'react';
import { FormattedMessage, FormattedDate, FormattedNumber, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

class ContractClaimsPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { contracts, intl } = this.props;
    const { contractUuid } = this.props.routeParams;

    const { claims } = Array.isArray(contracts) ?
      contracts.find(c => c.uuid == contractUuid) || {} : {};

    function formatStatus(claim) {
      if (!claim) {
        return null;
      }
      let message, messageId, refundable;
      switch (claim.status) {
        case 'N':
          messageId = 'Not processes yet';
          break;
        case 'R':
          messageId = claim.repaired ? 'Repaired' : 'To be repaired';
          break;
        case 'F':
          messageId = 'Refund';
          refundable = <FormattedNumber style='currency'
            currency={intl.formatMessage({ id: 'currency code' })}
            value={claim.refundable} minimumFractionDigits={2} />
          break;
        case 'J':
          messageId = 'Rejected'
          break;
        default:
          messageId = 'Unknown'
      }
      if (messageId) {
        message = <FormattedMessage id={messageId} />
      }
      return (
        <span>
          {message}
          {refundable}
        </span>
      );
    }
    const cards = Array.isArray(claims) ? claims.map((claim, index) => (
      <div key={index} className='ibm-card ibm-border-gray-50'>
        <div className='ibm-card__content'>
          <h4 className='ibm-bold ibm-h4'>{claim.description}</h4>
          <div style={{ wordWrap: 'break-word' }}>
            <FormattedMessage id='Creation Date' />: <FormattedDate value={claim.date} /> <br />
            <FormattedMessage id='Theft' />: <input type='checkbox' ref='theftField'
              className='ibm-styled-checkbox'
              checked={claim.isTheft} />
            <label className='ibm-field-label' htmlFor='theftField'></label><br />
            <FormattedMessage id='Description' />: {claim.description}<br />
            <FormattedMessage id='Status' />: {formatStatus(claim)}
          </div>
          <br />
        </div>
      </div>
    )) : null;
    return (
      <div className='ibm-columns' style={{ minHeight: '6em' }}>
        <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
          <h3 className='ibm-h3'><FormattedMessage id='Claims to Selected Contract' /></h3>
        </div>
        <div className='ibm-columns ibm-cards' data-widget='masonry' data-items='.ibm-col-5-1'>
          {cards}
        </div>
      </div>
    );
  }
}

ContractClaimsPage.propTypes = {
  intl: intlShape.isRequired,
  user: PropTypes.object.isRequired,
  contracts: PropTypes.array.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user,
    contracts: state.contracts
  }
}

export default injectIntl(connect(mapStateToProps)(ContractClaimsPage));
