'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, FormattedTime, FormattedNumber,
  intlShape, injectIntl
} from 'react-intl';
import { Link, withRouter } from 'react-router-dom';

import './ContractVersionStyles.scss';

class ContractVersionComponent extends React.Component {
  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      version: PropTypes.string,
      contract: PropTypes.object,
      contractRevisions: PropTypes.array,
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
      this.setState({ height: this.refs.contractPanelRef.scrollHeight });
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({ open: newProps.open });
  }

  toggleOpen() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { intl, version, contract, contractRevisions } = this.props;
    const { open, height } = this.state;
    const versionDate = new Date(version);

    const iconClass = open ? 'ibm-chevron-up-link' : 'ibm-chevron-down-link';
    const contractPanelStyle = {
      height: open ? height : undefined
    };
    let content;
    if (contract) {
      content = (
        <form className='ibm-padding-content ibm-column-form'>
          <p>
            <i><FormattedMessage id='A contract with the following data was signed:' /></i>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Username' />:</b>
            </label>
            <span>{contract.username}</span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Product Brand' />:</b>
            </label>
            <span>{contract.item.brand}</span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Product Model' />:</b>
            </label>
            <span>{contract.item.model}</span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Insured Value' />:</b>
            </label>
            <span>
              <FormattedNumber style='currency'
                currency={intl.formatMessage({ id: 'currency code' })}
                minimumFractionDigits={2} value={contract.item.price} />
            </span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Product Description' />:</b>
            </label>
            <span>{contract.item.description}</span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Serial No.' />:</b>
            </label>
            <span>{contract.item.serialNo}</span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Void' />:</b>
            </label>
            <span className='ibm-input-group'>
              <input type='checkbox' className='ibm-styled-checkbox'
                checked={contract.void} disabled ref='itemPrice' />
              <label className='ibm-field-label' htmlFor='itemPrice' />
            </span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='Start Date' />:</b>
            </label>
            <span><FormattedDate value={contract.startDate} /></span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='End Date' />:</b>
            </label>
            <span><FormattedDate value={contract.endDate} /></span>
          </p>
          <p>
            <label>
              <b><FormattedMessage id='No. of Claims' />:</b>
            </label>
            <span><FormattedNumber value={contract.claims.length} /></span>
          </p>
        </form>
      );
    }
    if (contractRevisions) {
      // Get new claims
      const newClaims = contractRevisions
        .filter(r => r.kind === 'A' && r.path.join('/') === 'claims')
        .map(r => r.item.rhs);
      const newClaimElems = newClaims.map((c, i) => (
        <Link to={`/contract-history/claim/contract-uuid/${c.contractUuid}/uuid/${c.uuid}`} key={i}
          className='ibm-blocklink ibm-padding-content'>
          <p className='ibm-icon-nolink ibm-textcolor-default ibm-padding-bottom-0'>
            <span className='ibm-forward-link ibm-linkcolor-default'>
              <FormattedMessage id='Claim' />
            </span><br />
            <FormattedMessage id='Filed on' />{': '}
            <FormattedDate value={new Date(c.date)} />{', '}
            <FormattedTime value={new Date(c.date)} />

            <p style={{ textOverflow: 'elipsis' }}>
              {c.description}
            </p>
          </p>
        </Link>
      ));

      const contractVoid = contractRevisions.some(r => r.path.join('/') === 'void' && r.rhs);
      const contractVoidElem = contractVoid ? (
        <div>
          <p>
            <b><i><FormattedMessage id='Contact was voided due to a theft.' /></i></b>
          </p>
        </div>
      ) : null;
      content = (
        <div className='ibm-padding-content'>
          {Array.isArray(newClaimElems) && newClaimElems.length > 0 ? (<div>
            <p><i><FormattedMessage id='New claims were filed:' /></i></p>
          </div>) : null}
          <div>{newClaimElems}</div>
          <div>{contractVoidElem}</div>
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
        <div style={contractPanelStyle} ref='contractPanelRef'
          className={`contract-panel${open ? ' open' : ''}`}>
          {content}
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(ContractVersionComponent));
