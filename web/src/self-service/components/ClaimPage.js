'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';

import Loading from '../../shared/Loading';
import { fileClaim } from '../api';

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
    const { history } = this.props;
    this.setState({ loading: true });
    fileClaim(this.props.user,
      this.props.match.params.contractUuid, { theft, description })
      .then(() => {
        history.push('/contracts');
      }).catch(() => {
        this.setState({ loading: false });
        alert('Error occurred!');
      });
  }

  setTheft(event) {
    this.setState({ theft: !this.refs.theftField.checked });
  }

  setDescription({ target }) {
    this.setState({ description: target.value });
  }

  render() {
    const { loading, theft, description } = this.state;
    const { user } = this.props;

    if (!user) {
      return(
        <Redirect to='/' />
      );
    }

    return (
      <Loading hidden={!loading}>
        <div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <h3 className='ibm-h3'><FormattedMessage id='File a Claim' /></h3>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <div className='ibm-column-form'>
                <p className='ibm-form-elem-grp'>
                  <label>
                    <FormattedMessage className='ibm-field-label' id='Theft' />:
                </label>
                  <span className='ibm-input-group'>
                    <input type='checkbox' ref='theftField'
                      className='ibm-styled-checkbox'
                      checked={theft} onChange={this.setTheft} />
                    <label className='ibm-field-label' htmlFor='theftField'
                      onClick={this.setTheft} />
                  </span>
                </p>
                <p>
                  <label><FormattedMessage id='Description' />:</label>
                  <span>
                    <textarea value={description}
                      onChange={this.setDescription} />
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
              <button type='button' className='ibm-btn-pri ibm-btn-blue-50'
                onClick={this.submit}><FormattedMessage id='Submit' /></button>
            </div>
          </div>
        </div>
      </Loading>
    );
  }
}

ClaimPage.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      contractUuid: PropTypes.string.isRequired
    })
  }).isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user
  };
}

export default withRouter(connect(mapStateToProps)(ClaimPage));
