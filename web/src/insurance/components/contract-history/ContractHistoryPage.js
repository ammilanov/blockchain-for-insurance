'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, FormattedNumber, injectIntl,
  intlShape
} from 'react-intl';
import { withRouter } from 'react-router-dom';
import diff from 'deep-diff';

import * as Api from '../../api';
import Loading from '../../../shared/Loading';
import ContractVersionComponent from './ContractVersionComponent';

class ContractHistoryPage extends React.Component {
  static get propTypes() {
    return {
      match: PropTypes.shape({
        params: PropTypes.shape({
          username: PropTypes.string.isRequired,
          uuid: PropTypes.string.isRequired
        })
      }),
      intl: intlShape.isRequired,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      contractHistory: null,
      contractHistoryDiff: null,
      hideLoading: false
    };
    this.versionEntry = this.versionEntry.bind(this);
  }

  componentDidMount() {
    setTimeout(async () => {
      const { username, uuid } = this.props.match.params;
      if (username && uuid) {
        let history = await Api.getContractHistory(username, uuid);
        if (Array.isArray(history)) {
          history = history.sort((a, b) => a.version.localeCompare(b.version));
          const historyDiff = history
            .map(e => e.data)
            .reduce((acc, val, i, arr) => arr[i + 1] ? [
              ...acc,
              diff(val, arr[i + 1])
            ] : acc, []);
          this.setState({
            contractHistory: history,
            contractHistoryDiff: historyDiff,
            hideLoading: true
          });
        }
      }
    });
  }

  versionEntry(contractHistoryDiff) {
    return (contractVersion, index) => {
      return index === 0 ? (
        <ContractVersionComponent key={index} version={contractVersion.version}
          contract={contractVersion.data} open />
      ) : (
          <ContractVersionComponent key={index} version={contractVersion.version}
            contractRevisions={contractHistoryDiff[index - 1]} />
        );
    };
  }

  render() {
    const { intl } = this.props;
    const { contractHistory, contractHistoryDiff, hideLoading } = this.state;
    const contractVersionEntries = hideLoading ?
      contractHistory.map(this.versionEntry(contractHistoryDiff)) : null;
    return (
      <Loading hidden={hideLoading}
        text={intl.formatMessage({ id: 'Loading contract history...' })}>
        <div style={{ minHeight: '30vh' }}>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <h3 className='ibm-h3'>
                <FormattedMessage id='Contract History' />
              </h3>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              {contractVersionEntries}
            </div>
          </div>
        </div>
      </Loading>
    );
  }
}

export default withRouter(injectIntl(ContractHistoryPage));
