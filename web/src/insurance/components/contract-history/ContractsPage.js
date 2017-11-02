'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, FormattedNumber,
  injectIntl, intlShape
} from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Loading from '../../../shared/Loading';

const ContractsPage = (({ loading, contracts, intl }) => {
  const contractRows = Array.isArray(contracts) ? contracts
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((contract, index) => (
      <tr key={index}>
        <td>
          <FormattedDate value={new Date(contract.startDate)} />
        </td>
        <td>
          <FormattedDate value={new Date(contract.endDate)} />
        </td>
        <td>{contract.username}</td>
        <td>{`${contract.item.brand} ${contract.item.model}`}</td>
        <td>{contract.item.serialNo}</td>
        <td>
          <FormattedNumber style='currency'
            currency={intl.formatMessage({ id: 'currency code' })}
            minimumFractionDigits={2} value={contract.item.price} />
        </td>
        <td>
          <Link to={`/contract-history/username/${contract.username}/uuid/${contract.uuid}`}>
            <button className='ibm-btn-sec ibm-btn-blue-50'>
              <FormattedMessage id='Show History' />
            </button>
          </Link>
        </td>
      </tr>
    )) : null;
  const tableContent = Array.isArray(contracts) && contracts.length > 0 ?
    contractRows : (
      <tr>
        <td colSpan='7' style={{ height: '30vh' }}>
          <div className='ibm-vertical-center ibm-padding-content'
            style={{ height: '100%' }}>
            <div className='ibm-center' style={{ width: '100%' }}>
              <FormattedMessage id='No contracts have been signed yet.' />
            </div>
          </div>
        </td>
      </tr>
    );

  return (
    <Loading hidden={!loading}
      text={intl.formatMessage({ id: 'Loading Contracts...' })}>
      <div className='ibm-columns' style={{ minHeight: '30vh' }}>
        <div className='ibm-col-1-1'>
          <h3 className='ibm-h3'><FormattedMessage id='Contracts' /></h3>
        </div>
        <div className='ibm-col-1-1'>
          <table className='ibm-data-table ibm-altcols'>
            <thead>
              <tr>
                <th><FormattedMessage id='Start Date' /></th>
                <th><FormattedMessage id='End Date' /></th>
                <th><FormattedMessage id='Username' /></th>
                <th><FormattedMessage id='Product Name' /></th>
                <th><FormattedMessage id='Serial No.' /></th>
                <th><FormattedMessage id='Insured Value' /></th>
                <th><FormattedMessage id='Actions' /></th>
              </tr>
            </thead>
            <tbody>
              {tableContent}
            </tbody>
          </table>
        </div>
      </div>
    </Loading>
  );
});

ContractsPage.propTypes = {
  intl: intlShape.isRequired,
  contracts: PropTypes.array,
  loading: PropTypes.bool.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    contracts: state.contractHistory.contracts,
    loading: !Array.isArray(state.contractHistory.contracts)
  };
}

export default connect(mapStateToProps)(injectIntl(ContractsPage));
