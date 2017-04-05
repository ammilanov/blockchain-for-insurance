import React, { PropTypes, Props } from 'react';
import { connect } from 'react-redux';
import { Router, browserHistory, Route, IndexRoute } from 'react-router';

import App from './components/App';
import LoginPage from './components/LoginPage';
import ContractsPage from './components/ContractsPage';
import ClaimPage from './components/ClaimPage';
import NotFoundPage from '../shared/NotFoundPage';

function router() {
  return (
    <Router history={browserHistory}>
      <Route path='self-service' component={App}>
        <IndexRoute component={LoginPage} />
        <Route path='contracts' component={ContractsPage} />
        <Route path='claim/:contractId' component={ClaimPage} />
        <Route path='*' component={NotFoundPage} />
      </Route>
      <Route path='*' component={NotFoundPage} />
    </Router>
  );
}

export default router;
