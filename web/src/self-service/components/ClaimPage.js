'use strict';

import React, { Props, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import Loading from '../../shared/Loading';
import { submitClaim } from '../api'

class ClaimPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: false, theft: false, description: '' };

    this.submit = this.submit.bind(this);
    this.setTheft = this.setTheft.bind(this);
    this.setDescription = this.setDescription.bind(this);
  }

  submit() {
    const { theft, description } = this.state;
    this.setState(Object.assign({}, this.state, { loading: true }))
    submitClaim(this.props.user, this.props.routeParams.contractId, { theft, description })
      .then(() => {
        browserHistory.push('/self-service/contracts');
      });
  }

  setTheft(event) {
    this.setState(Object.assign({}, this.state, { theft: !this.refs.theftField.checked }));
  }

  setDescription({ target }) {
    this.setState(Object.assign({}, this.state, { description: target.value }));
  }

  render() {
    const { loading, theft, description } = this.state;

    return (
      <Loading hidden={!loading}>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'><FormattedMessage id='File a Claim' /></h3>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <div className='ibm-column-form'>
              <p className='ibm-form-elem-grp'>
                <label><FormattedMessage className='ibm-field-label' id='Theft' />:</label>
                <span className='ibm-input-group'>
                  <input type='checkbox' ref='theftField'
                    className='ibm-styled-checkbox'
                    checked={theft} onChange={this.setTheft} />
                  <label className='ibm-field-label' htmlFor='theftField' onClick={this.setTheft}></label>
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Description' />:</label>
                <span>
                  <textarea value={description} onChange={this.setDescription} />
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
            <button type='button' className='ibm-btn-pri ibm-btn-blue-50' onClick={this.submit}><FormattedMessage id='Submit' /></button>
          </div>
        </div>
      </Loading>
    );
  }
}

ClaimPage.propTypes = {
  user: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user
  };
}

export default connect(mapStateToProps)(ClaimPage);
