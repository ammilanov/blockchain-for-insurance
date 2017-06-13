'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber, injectIntl, intlShape } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import moment from 'moment';

import Loading from '../../shared/Loading';
import * as paymentActions from '../actions/paymentActions';
import * as userMgmtActions from '../actions/userMgmtActions';
import { enterContract } from '../api';

class PaymentPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: false, inTransaction: false };
    this.order = this.order.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.payed && !this.state.inTransaction) {
      this.setState({ loading: true, inTransaction: true }, async () => {
        const { email, firstName, lastName } = nextProps.contractInfo;
        const user = { username: email, firstName, lastName };
        // Sign the insurance contract, the login info should be returned
        let loginInfo = await enterContract(user, nextProps.contractInfo.uuid, {
          item: {
            id: parseInt(nextProps.productInfo.index),
            brand: nextProps.productInfo.brand,
            model: nextProps.productInfo.model,
            price: nextProps.productInfo.price,
            serialNo: nextProps.productInfo.serialNo
          },
          startDate: new Date(nextProps.contractInfo.startDate),
          endDate: new Date(nextProps.contractInfo.endDate)
        });
        this.setState({ loading: false, inTransaction: false }, () => {
          this.props.userMgmtActions.setUser({
            firstName, lastName,
            username: email, password: loginInfo.password
          });
          this.setState({ redirectToNext: true });
        });
      });
    }
  }

  order() {
    this.setState({ loading: true });
    this.props.paymentActions.pay();
  }

  render() {
    let paymentStatus;

    const { intl, productInfo, contractInfo } = this.props;
    const { redirectToNext } = this.state;

    const startDate = moment(new Date(contractInfo.startDate));
    const endDate = moment(new Date(contractInfo.endDate));
    const dateDiff = moment.duration(endDate.diff(startDate)).asDays();

    const insurancePrice = dateDiff * (
      contractInfo.formulaPerDay(productInfo.price));
    const total = productInfo.price + insurancePrice;

    if (redirectToNext) {
      return (
        <Redirect to='/summary' />
      );
    }

    if (!productInfo) {
      return (
        <Redirect to='/' />
      );
    }

    return (
      <Loading hidden={!this.state.loading} text={intl.formatMessage({
        id: 'Processing Transaction...'
      })}>
        <div>
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
                <tbody>
                  <tr>
                    <td style={{ padding: '.3em' }} colSpan='2'
                      className='ibm-background-blue-20'>
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
                    <td style={{ padding: '.3em' }} colSpan='2'
                      className='ibm-background-blue-20'>
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
                    <td className='ibm-background-gray-10'
                      style={{ padding: '.3em' }}>
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
                </tbody>
              </table>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
              <button type='button' className='ibm-btn-pri ibm-btn-blue-50'
                onClick={this.order}><FormattedMessage id='Order' /></button>
            </div>
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
  user: PropTypes.object,
  paymentActions: PropTypes.object.isRequired,
  userMgmtActions: PropTypes.object.isRequired
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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(PaymentPage)));
