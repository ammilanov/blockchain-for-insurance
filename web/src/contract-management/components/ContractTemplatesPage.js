'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';

import Loading from '../../shared/Loading';
import * as contractTemplateActions from '../actions/contractTemplateActions';

class ContractTemplatesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: true }

  }

  render() {
    const { loading, contractTypes, intl, contractTemplateActions } = this.props;

    const contractTemplateRows = Array.isArray(contractTypes) ? contractTypes
      .sort((a, b) => a.uuid.localeCompare(b.uui))
      .map((contractType, index) => (
        <tr key={index}>
          <td>{activateIcon(claim)}</td>
          <td>{formatShopTypes(claim)}</td>
          <td>{claim.description}</td>
          <td>{claim.theftInsured}</td>
          <td>{claim.minDurationDays}</td>
          <td>{claim.maxDurationDays}</td>
        </tr>
      )) : null;
    function activateIcon(claim) {
      let activateButton = (
        <button type='button' className='ibm-btn-sec ibm-btn-small ibm-btn-green-50'
          style={{ marginLeft: '5px', marginRight: '5px' }}
          onClick={() => { }}>
          <FormattedMessage id='Activate' />
        </button>
      );
      let deactivateButton = (
        <button type='button' className='ibm-btn-sec ibm-btn-small ibm-btn-red-50'
          style={{ marginLeft: '5px', marginRight: '5px' }}
          onClick={() => { }}>
          <FormattedMessage id='Deactivate' />
        </button>
      );
      return claim.active ? deactivateButton : activateButton;
    }
    function formatShopTypes(claim) {
      let { shopType } = claim;
      if (typeof shopType !== 'string') {
        return shopType;
      }
      shopType = claim.shopType.toUpperCase();
      return shopType.split('').map(l => {
        switch (l) {
          case 'B': return intl.formatMessage({ id: 'Bike Shops' });
          case 'P': return intl.formatMessage({ id: 'Phone Shops' });
          case 'S': return intl.formatMessage({ id: 'Ski Shops' });
          default: return;
        }
      }).join(', ');
    }

    return (
      <Loading hidden={!loading} text={intl.formatMessage({ id: 'Loading contract types...' })}>
        <div className='ibm-columns' style={{ minHeight: '6em' }}>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'><FormattedMessage id='Your Contracts' /></h3>
          </div>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <Link type='button' className='ibm-btn-sec ibm-btn-blue-50'
              to='/contract-management/new-contract-template'>
              <FormattedMessage id='Create Contract Template' />
            </Link>
          </div>
          <div class="ibm-data-table ibm-altcols">
            <thead>
              <tr>
                <th><FormattedMessage id='Active' /></th>
                <th><FormattedMessage id='Shop Types' /></th>
                <th><FormattedMessage id='Description' /></th>
                <th><FormattedMessage id='Theft Insured' /></th>
                <th><FormattedMessage id='Min. Duration (days)' /></th>
                <th><FormattedMessage id='Max. Duration (days)' /></th>
              </tr>
            </thead>
            <tbody>
              {contractTemplateRows}
            </tbody>
          </div>
        </div>
      </Loading>
    );
  }
}

ContractTemplatesPage.propTypes = {
  intl: intlShape.isRequired,
  contractTypes: PropTypes.array,
  loading: PropTypes.bool.isRequired
}

function mapStateToProps(state, ownProps) {
  return {
    contractTypes: state.contractTemplates.contactTypes,
    loading: !Array.isArray(state.contractTemplates.contactTypes)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    contractTemplateActions: bindActionCreators(contractTemplateActions, dispatch)
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractTemplatesPage));
