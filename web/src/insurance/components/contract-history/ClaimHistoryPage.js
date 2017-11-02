'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import diff from 'deep-diff';

import * as Api from '../../api';
import Loading from '../../../shared/Loading';
import ClaimVersionComponent from './ClaimVersionComponent';

class ClaimHistoryPage extends React.Component {
  static get propTypes() {
    return {
      match: PropTypes.shape({
        params: PropTypes.shape({
          contractUuid: PropTypes.string.isRequired,
          uuid: PropTypes.string.isRequired
        })
      }),
      intl: intlShape.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      claimHistory: null,
      claimHistoryDiff: null,
      hideLoading: false
    };
    this.versionEntry = this.versionEntry.bind(this);
  }

  componentDidMount() {
    setTimeout(async () => {
      const { contractUuid, uuid } = this.props.match.params;
      if (contractUuid && uuid) {
        let history = await Api.getClaimHistory(contractUuid, uuid);
        if (Array.isArray(history)) {
          history = history.sort((a, b) => a.version.localeCompare(b.version));
          const historyDiff = history
            .map(e => e.data)
            .reduce((acc, val, i, arr) => arr[i + 1] ? [
              ...acc,
              diff(val, arr[i + 1])
            ] : acc, []);
          this.setState({
            claimHistory: history,
            claimHistoryDiff: historyDiff,
            hideLoading: true
          });
        }
      }
    });
  }

  versionEntry(claimHistoryDiff) {
    return (claimVersion, index) => {
      return index === 0 ? (
        <ClaimVersionComponent key={index} version={claimVersion.version}
          claim={claimVersion.data} open />
      ) : (
          <ClaimVersionComponent key={index} version={claimVersion.version}
            claimConstFields={claimVersion.data}
            claimRevisions={claimHistoryDiff[index - 1]} />
        );
    };
  }

  render() {
    const { intl } = this.props;
    const { claimHistory, claimHistoryDiff, hideLoading } = this.state;
    const claimVersionEntries = hideLoading ?
      claimHistory.map(this.versionEntry(claimHistoryDiff)) : null;

    return (
      <Loading hidden={hideLoading}
        text={intl.formatMessage({ id: 'Loading claim history...' })}>
        <div style={{ minHeight: '30vh' }}>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <h3 className='ibm-h3'>
                <FormattedMessage id='Claim History' />
              </h3>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              {claimVersionEntries}
            </div>
          </div>
        </div>
      </Loading>
    );
  }
}

export default withRouter(injectIntl(ClaimHistoryPage));
