'use strict';

import React, { PropTypes, Props } from 'react';
import { FormattedMessage, FormattedNumber, injectIntl, intlShape } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import moment from 'moment';

import Loading from '../../shared/Loading';
import * as paymentActions from '../actions/paymentActions';
import * as userMgmtActions from '../actions/userMgmtActions';
import { enterContract } from '../api';

class PaymentPage extends React.Component {
  constructor(props) {
    super(props);
    if (!this.props.productInfo) {
      browserHistory.push(`/shop/${this.props.shopType}`);
    }
    this.state = { loading: false, inTransaction: false };

    this.order = this.order.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.payed && nextProps.user && !this.state.inTransaction) {
      this.setState({ loading: true, inTransaction: true });
      setTimeout(async () => {
        // Sign insurance contract
        await enterContract(nextProps.user, nextProps.contractInfo.id, {
          item: {
            itemId: nextProps.productInfo.index,
            brand: nextProps.productInfo.brand,
            model: nextProps.productInfo.model,
            price: nextProps.productInfo.price,
            serialNo: nextProps.productInfo.serialNo
          },
          startDate: nextProps.contractInfo.startDate,
          endDate: nextProps.contractInfo.endDate
        });
        browserHistory.push(`/shop/${this.props.shopType}/summary`);
        this.setState({ loading: false, inTransaction: false });
      })
    }
  }

  order() {
    this.setState(Object.assign({}, this.state, { loading: true }));
    const { email, firstName, lastName } = this.props.contractInfo;
    this.props.userMgmtActions.requestNewUser({ email, firstName, lastName });
    this.props.paymentActions.pay();
  }

  render() {
    let paymentStatus;

    const { intl, productInfo, contractInfo } = this.props;
    const startDate = moment(new Date(contractInfo.startDate));
    const endDate = moment(new Date(contractInfo.endDate));
    const dateDiff = moment.duration(endDate.diff(startDate)).asDays();

    const insurancePrice = dateDiff * (contractInfo.formulaPerDay(productInfo.price));
    const total = productInfo.price + insurancePrice;

    return (
      <Loading hidden={!this.state.loading} text={intl.formatMessage({ id: 'Processing Transaction...' })}>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'>
              <FormattedMessage id='Payment' />
            </h3>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <table cols='2' style={{ width: '100%' }}>
              <tr>
                <td style={{ padding: '.3em' }} colSpan='2' className='ibm-background-blue-20'>
                  <h4 className='ibm-h4'>
                    <FormattedMessage id='Product' />
                  </h4>
                </td>
              </tr>
              <tr>
                <td>
                  {productInfo.brand}
                  <br />
                  {productInfo.model}
                  <br />
                  <FormattedMessage id='Serial No.' />: {productInfo.serialNo}
                </td>
                <td className='ibm-right'>
                  <FormattedNumber style='currency'
                    currency={intl.formatMessage({ id: 'currency code' })}
                    value={productInfo.price} minimumFractionDigits={2} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '.3em' }} colSpan='2' className='ibm-background-blue-20'>
                  <h4 className='ibm-h4'>
                    <FormattedMessage id='Services' />
                  </h4>
                </td>
              </tr>
              <tr>
                <td>
                  <FormattedMessage id='Insurance' />
                </td>
                <td className='ibm-right'>
                  <FormattedNumber style='currency'
                    currency={intl.formatMessage({ id: 'currency code' })}
                    value={insurancePrice} minimumFractionDigits={2} />
                </td>
              </tr>
              <tr>
                <td className='ibm-background-gray-10' style={{ padding: '.3em' }}>
                  <h3 className='ibm-h3'>
                    <FormattedMessage id='Total' />
                  </h3>
                </td>
                <td className='ibm-background-gray-10 ibm-right'>
                  <h3 className='ibm-h3'>
                    <FormattedNumber style='currency'
                      currency={intl.formatMessage({ id: 'currency code' })}
                      value={total} minimumFractionDigits={2} />
                  </h3>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
            <button type='button' className='ibm-btn-pri ibm-btn-blue-50' onClick={this.order}><FormattedMessage id='Order' /></button>
          </div>
        </div>
      </Loading>
    );
  }
}

PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  shopType: PropTypes.string.isRequired,
  productInfo: PropTypes.object.isRequired,
  contractInfo: PropTypes.object.isRequired,
  payed: PropTypes.bool.isRequired,
  user: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {
    shopType: state.shop.type,
    productInfo: state.shop.productInfo,
    contractInfo: state.insurance.contractInfo,
    payed: state.payment.payed,
    user: state.userMgmt.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    paymentActions: bindActionCreators(paymentActions, dispatch),
    userMgmtActions: bindActionCreators(userMgmtActions, dispatch)
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PaymentPage));
