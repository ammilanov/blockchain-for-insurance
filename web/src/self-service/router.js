import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router,
  Route, Switch, withRouter
} from 'react-router-dom';

import App from './components/App';
import LoginPage from './components/LoginPage';
import ContractsPage from './components/ContractsPage';
import ClaimPage from './components/ClaimPage';
import ContractClaimsPage from './components/ContractClaimsPage';
import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router basename='/self-service'>
      <App>
        <Switch>
          <Route exact path='/' component={LoginPage} />
          <Route path='/contracts' component={ContractsPage} />
          <Route path='/contract/:contractUuid/claims'
            component={ContractClaimsPage} />
          <Route path='/claim/:contractUuid' component={ClaimPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </App>
    </Router>
  );
}
