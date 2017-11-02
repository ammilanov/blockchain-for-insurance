'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, FormattedTime, FormattedNumber,
  intlShape, injectIntl
} from 'react-intl';
import { Link, withRouter } from 'react-router-dom';

import './ClaimVersionStyles.scss';

class ClaimVersionComponent extends React.Component {
  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      version: PropTypes.string,
      claim: PropTypes.object,
      claimConstFields: PropTypes.object,
      claimRevisions: PropTypes.array,
      open: PropTypes.bool
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      open: props.open !== undefined ? props.open : false,
      height: undefined
    };
    this.toggleOpen = this.toggleOpen.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ height: this.refs.claimPanelRef.scrollHeight });
    });
  }

  toggleOpen() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { intl, version, claim, claimConstFields, claimRevisions } = this.props;
    const { open, height } = this.state;
    const versionDate = new Date(version);

    const iconClass = open ? 'ibm-chevron-up-link' : 'ibm-chevron-down-link';
    const claimPanelStyle = {
      height: open ? height : undefined
    };

    function formatStatus(claim) {
      if (typeof claim !== 'object') {
        return '';
      }
      let message, messageId, reimbursable;
      switch (claim.status) {
        case 'N':
          messageId = claim.isTheft ? 'Expecting confirmation from police'
            : 'Being Processed';
          break;
        case 'R':
          messageId = claim.repaired ? 'Repaired' : 'To be repaired';
          break;
        case 'F':
          messageId = 'Reimburse';
          break;
        case 'P':
          messageId = 'Theft confirmed by police';
          break;
        case 'J':
          messageId = 'Rejected';
          break;
        default:
          messageId = 'Unknown';
      }
      if (messageId) {
        message = <FormattedMessage id={messageId} />;
      }
      return (
        <span>{message}</span>
      );
    }

    let content;

    // Render claim
    if (claim && !claimRevisions) {
      const creationDate = new Date(claim.date);
      content = (
        <div className='ibm-padding-content'>
          <form className='ibm-padding-content ibm-column-form'>
            <p>
              <i><FormattedMessage id='A claim with the following data was filed:' /></i>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='Creation Date' />:</b>
              </label>
              <span>
                <FormattedDate value={creationDate} />{', '}
                <FormattedTime value={creationDate} />
              </span>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='Description' />:</b>
              </label>
              <span>{claim.description}</span>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='Is Theft' />:</b>
              </label>
              <span className='ibm-input-group'>
                <input type='checkbox' className='ibm-styled-checkbox'
                  checked={claim.isTheft} disabled ref='isTheft' />
                <label className='ibm-field-label' htmlFor='isTheft' />
              </span>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='Status' />:</b>
              </label>
              <span>{formatStatus(claim)}</span>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='Reimbursable' />:</b>
              </label>
              <span>
                <FormattedNumber style='currency'
                  currency={intl.formatMessage({ id: 'currency code' })}
                  minimumFractionDigits={2} value={claim.reimbursable} />
              </span>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='Repaired' />:</b>
              </label>
              <span className='ibm-input-group'>
                <input type='checkbox' className='ibm-styled-checkbox'
                  checked={claim.repaired} disabled ref='repaired' />
                <label className='ibm-field-label' htmlFor='repaired' />
              </span>
            </p>
            <p>
              <label>
                <b><FormattedMessage id='File Reference' />:</b>
              </label>
              <span>{claim.fileReference}</span>
            </p>
          </form>
        </div>
      );
    }
    // Render changes only
    if (claimRevisions && claimConstFields) {
      // Get status update
      const statusUpdate = claimRevisions
        .filter(r => r.kind === 'E' && r.path.join('') === 'status')
        .map(r => ({ oldStatus: r.lhs, status: r.rhs }));
      const statusBlock = statusUpdate.length > 0 ? (
        <div>
          <p><i><FormattedMessage id='Status Updates' />:</i></p>
          <p>
            <FormattedMessage id='Status changed from "{oldStatus}" to "{status}".'
              values={{
                oldStatus: formatStatus(Object.assign({}, claimConstFields, {
                  status: statusUpdate[0].oldStatus
                })),
                status: formatStatus(Object.assign({}, claimConstFields, {
                  status: statusUpdate[0].status
                }))
              }} />
          </p>
        </div>
      ) : null;

      // Get reimburseable update
      const reimbursableUpdate = claimRevisions
        .filter(r => r.kind === 'E' && r.path.join('') === 'reimbursable')
        .map(r => r.rhs);
      const reimbursableBlock = reimbursableUpdate.length > 0 ? (
        <div>
          <p><i><FormattedMessage id='Payment Information' />:</i></p>
          <FormattedMessage id='A payment of {amount} was triggered.'
            values={{
              amount: intl.formatNumber(reimbursableUpdate[0],
                {
                  style: 'currency',
                  currency: intl.formatMessage({ id: 'currency code' }),
                  minimumFractionDigits: 2
                })
            }} />
        </div>
      ) : null;

      // Get repaired update
      const repairedUpdate = claimRevisions
        .filter(r => r.kind === 'E' && r.path.join('') === 'repaired' && r.rhs);
      const repairedBlock = repairedUpdate.length > 0 ? (
        <div>
          <p><i><FormattedMessage id='Repair Information' />:</i></p>
          <FormattedMessage id='Item repairs were completed.' />
        </div>
      ) : null;

      // Get file referenc update by the police
      const fileReferenceUpdate = claimRevisions
        .filter(r => r.kind === 'E' && r.path.join('') === 'fileReference')
        .map(r => r.rhs);
      const fileReferenceBlock = fileReferenceUpdate.length > 0 ? (
        <div>
          <p><i><FormattedMessage id='Police Notifications' />:</i></p>
          <FormattedMessage
            id='Police has confirmed the theft with file reference {fileReference}.'
            values={{
              fileReference: fileReferenceUpdate[0]
            }} />
        </div>
      ) : null;
      content = (
        <div className='ibm-padding-content'>
          {statusBlock}
          {reimbursableBlock}
          {repairedBlock}
          {fileReferenceBlock}
        </div>
      );
    }

    return (
      <div>
        <div className='ibm-blocklink ibm-padding-content ibm-background-neutral-white-30'
          onClick={this.toggleOpen}>
          <p className='ibm-icon-nolink ibm-textcolor-default ibm-padding-bottom-0'
            style={{ cursor: 'pointer', userSelect: 'none' }}>
            <span className={`${iconClass} ibm-linkcolor-default`}>
              <b><FormattedMessage id='Transaction Date' />{': '}</b>
              <FormattedDate value={versionDate} />{', '}
              <FormattedTime value={versionDate} />{' '}
            </span>
          </p>
        </div>
        <div style={claimPanelStyle} ref='claimPanelRef'
          className={`claim-panel${open ? ' open' : ''}`}>
          {content}
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(ClaimVersionComponent));
