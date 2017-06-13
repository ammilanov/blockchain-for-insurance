import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';

class ClaimComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { refundable: 0 };
    this.setRefundable = this.setRefundable.bind(this);
    this.repair = this.repair.bind(this);
    this.refund = this.refund.bind(this);
    this.reject = this.reject.bind(this);
  }

  setRefundable(e) {
    let { value } = e.target;
    if (value) {
      value = Number(value) ? value : 0;
    }
    this.setState({ refundable: value });
  }

  repair() {
    const { onRepair } = this.props;
    onRepair();
  }

  refund() {
    const { onRefund } = this.props;
    const { refundable } = this.state;
    onRefund(Number(refundable));
  }

  reject() {
    const { onReject } = this.props;
    onReject();
  }

  render() {
    const { claim } = this.props;
    const { refundable } = this.state;

    const claimButtons = (c) => {
      const repairButton = c.isTheft ? null : (
        <button key='repairButton' type='button'
        className='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'
          style={{ marginLeft: '15px', marginRight: '15px' }}
          onClick={this.repair}>
          <FormattedMessage id='Repair' />
        </button>
      );
      const refundButton = (
        <button key='refundButton' type='button'
        className='ibm-btn-sec ibm-btn-small ibm-btn-teal-50'
          style={{ marginLeft: '15px', marginRight: '15px' }}
          onClick={this.refund}>
          <FormattedMessage id='Refund' />
        </button>
      );
      const rejectButton = (
        <button key='rejectButton' type='button'
        className='ibm-btn-sec ibm-btn-small ibm-btn-red-50'
          style={{ marginLeft: '15px', marginRight: '15px' }}
          onClick={this.reject}>
          <FormattedMessage id='Reject' />
        </button>
      );
      return (
        <div>
          {[repairButton, refundButton, rejectButton]}
        </div>
      );
    };

    return (
      <div className='ibm-col-3-1 ibm-col-medium-6-3'>
        <div className='ibm-card ibm-border-gray-50'>
          <div className='ibm-card__content'>
            <h4 className='ibm-bold ibm-h4'>{claim.description}</h4>
            <div style={{ wordWrap: 'break-word' }} className='ibm-column-form'>
              <p>
                <label><FormattedMessage id='Description' />: </label>
                <span>{claim.description}</span>
              </p>
              <p>
                <label><FormattedMessage id='Creation Date' />: </label>
                <span><FormattedDate value={claim.date} /></span>
              </p>
              <p>
                <label><FormattedMessage id='Theft Involved' />: </label>
                <span className='ibm-input-group'>
                  <input type='checkbox' className='ibm-styled-checkbox'
                    ref='theftField' checked={claim.isTheft}
                    readOnly disabled />
                  <label className='ibm-field-label' htmlFor='theftField' />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Refundable' />: </label>
                <span>
                  <input type='text'
                    value={refundable} onChange={this.setRefundable} />
                </span>
              </p>
            </div>
            {claimButtons(claim)}
          </div>
        </div>
      </div>
    );
  }
}

ClaimComponent.propTypes = {
  claim: PropTypes.object.isRequired,
  onRepair: PropTypes.func.isRequired,
  onRefund: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired
};

export default ClaimComponent;
