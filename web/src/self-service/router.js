import React, { PropTypes, Props } from 'react';
import { connect } from 'react-redux';
import { Router, browserHistory, Route, IndexRoute } from 'react-router';

import App from './components/App';
import LoginPage from './components/LoginPage';
import ContractsPage from './components/ContractsPage';
import ClaimPage from './components/ClaimPage';
import ContractClaimsPage from './components/ContractClaimsPage';
import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router history={browserHistory}>
      <Route path='self-service' component={App}>
        <IndexRoute component={LoginPage} />
        <Route path='contracts' component={ContractsPage} />
        <Route path='contract/:contractUuid/claims' component={ContractClaimsPage} />
        <Route path='claim/:contractUuid' component={ClaimPage} />
        <Route path='*' component={NotFoundPage} />
      </Route>
      <Route path='*' component={NotFoundPage} />
    </Router>
  );
};
