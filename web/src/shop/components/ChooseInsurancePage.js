'use strict';

import React, { PropTypes, Props } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';

import Loading from '../../shared/Loading';
import SelectList from '../../shared/SelectList';
import DateInput from '../../shared/DateInput';
import * as insuranceActions from '../actions/insuranceActions';

class ChooseInsurancePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contractType: {},
      dailyPrice: '',
      contractInfo: props.contractInfo || {
        firstName: '',
        lastName: '',
        email: '',
        startDate: 0,
        endDate: 0
      }
    };

    this.nextStep = this.nextStep.bind(this);
    this.setContractType = this.setContractType.bind(this);
    this.setContractInfo = this.setContractInfo.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.contractsLoaded && !this.state.contractType.id) {
      const contractType = nextProps.contractInfo ?
        nextProps.contractTypes.find(ct => ct.id === nextProps.contractInfo.id) :
        nextProps.contractTypes[0];  // Fallback to the first one, if none is defined.

      this.setContractType(contractType);
    }
  }

  componentWillMount() {
    if (this.props.contractsLoaded && !this.state.contractType.id) {
      const contractType = this.props.contractInfo ?
        this.props.contractTypes.find(ct => ct.id === this.props.contractInfo.id) :
        this.props.contractTypes[0]; // Fallback to the first one, if none is defined.

      this.setContractType(contractType);
    }
  }

  setContractType(contractType) {
    this.setState(Object.assign({}, this.state,
      { contractType, dailyPrice: contractType.formulaPerDay(this.props.productInfo.price) }));
  }

  setContractInfo(event) {
    let obj;
    if (event.target) {
      switch (event.target) {
        case this.refs.firstNameField:
          obj = { firstName: event.target.value };
          break;
        case this.refs.lastNameField:
          obj = { lastName: event.target.value };
          break;
        case this.refs.emailField:
          obj = { email: event.target.value };
          break;
        default:
          return;
      }
    } else if (typeof event.element === 'string') {
      switch (event.element) {
        case 'startDateField':
          obj = { startDate: event.value };
          break;
        case 'endDateField':
          obj = { endDate: event.value };
          break;
        default:
          return;
      }
    } else {
      return;
    }
    this.setState(Object.assign({},
      this.state,
      { contractInfo: Object.assign({}, this.state.contractInfo, obj) }));
  }

  nextStep() {
    // Persist data
    this.props.insuranceActions.submitContract(
      Object.assign({}, this.state.contractInfo, this.state.contractType));
    // Navigate to the next page
    browserHistory.push(`/shop/${this.props.shopType}/payment`);
  }

  render() {
    let messageAtTop;
    switch (this.props.shopType) {
      case 'bikes':
        messageAtTop = <FormattedMessage id='Buy Insurance for the Bike' />;
        break;
      case 'smart-phones':
        messageAtTop = <FormattedMessage id='Buy Insurance for the Smart Phone' />;
        break;
      case 'skis':
        messageAtTop = <FormattedMessage id='Buy Insurance the Pair of Skis' />;
        break;
    }

    let { contractType, contractInfo, dailyPrice } = this.state;
    let { intl, contractsLoaded, contractTypes } = this.props;

    return (
      <Loading hidden={contractsLoaded} text={intl.formatMessage({ id: 'Loading Contracts...' })}>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'>{messageAtTop}</h3>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <div className='ibm-column-form'>
              <p>
                <label><FormattedMessage id='Contract' />:</label>
                <span>
                  <SelectList options={contractTypes}
                    getCaptionFunc={(elem) => elem.description}
                    onChange={this.setContractType}
                    selectedItemIndex={contractTypes.indexOf(contractType)} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Daily Price' />:</label>
                <span>
                  <input type='text' readOnly={true} value={
                    intl.formatNumber(dailyPrice,
                      {
                        style: 'currency', currency: intl.formatMessage({ id: 'currency code' }),
                        minimumFractionDigits: 2
                      })} />
                </span>
              </p>
              <p className='ibm-form-elem-grp'>
                <label><FormattedMessage className='ibm-field-label' id='Theft Protection' />:</label>
                <span className='ibm-input-group'>
                  <input type="checkbox" ref='theftInsuredField' className='ibm-styled-checkbox' checked={contractType.theftInsured} readOnly={true} />
                  <label className='ibm-field-label' htmlFor='theftInsuredField'></label>
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Contract Terms' />:</label>
                <span>
                  <textarea value={contractType.terms} readOnly={true} disabled />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='First Name' />: <span className="ibm-required">*</span></label>
                <span>
                  <input ref='firstNameField' value={contractInfo.firstName}
                    type='text' onChange={this.setContractInfo} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Last Name' />: <span className="ibm-required">*</span></label>
                <span>
                  <input ref='lastNameField' value={contractInfo.lastName}
                    type='text' onChange={this.setContractInfo} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='E-mail Address' />: <span className="ibm-required">*</span></label>
                <span>
                  <input ref='emailField' value={contractInfo.email}
                    type='text' onChange={this.setContractInfo} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Start Date' />: <span className="ibm-required">*</span></label>
                <span>
                  <DateInput value={contractInfo.startDate}
                    onChange={date => this.setContractInfo({ element: 'startDateField', value: date })} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='End Date' />: <span className="ibm-required">*</span></label>
                <span>
                  <DateInput value={contractInfo.endDate}
                    onChange={date => this.setContractInfo({ element: 'endDateField', value: date })} />
                </span>
              </p>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
              <button type='button' className='ibm-btn-pri ibm-btn-blue-50' onClick={this.nextStep}><FormattedMessage id='Next' /></button>
            </div>
          </div>
        </div>
      </Loading>
    );
  }
}

ChooseInsurancePage.propTypes = {
  intl: intlShape.isRequired,
  shopType: PropTypes.string.isRequired,
  productInfo: PropTypes.object.isRequired,
  contractTypes: PropTypes.array.isRequired,
  contractInfo: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {
    shopType: state.shop.type,
    productInfo: state.shop.productInfo,
    contractsLoaded: Array.isArray(state.insurance.contractTypes),
    contractTypes: state.insurance.contractTypes || [],
    contractInfo: state.insurance.contractInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    insuranceActions: bindActionCreators(insuranceActions, dispatch)
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ChooseInsurancePage));
