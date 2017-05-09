import React, { PropTypes, Props } from 'react';
import { connect } from 'react-redux';
import { Router, browserHistory, Route, IndexRoute } from 'react-router';

import App from './components/App';
import RepairOrdersPage from './components/RepairOrdersPage';
import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router history={browserHistory}>
      <Route path='repair-service' component={App}>
        <IndexRoute component={RepairOrdersPage} />
        <Route path='*' component={NotFoundPage} />
      </Route>
      <Route path='*' component={NotFoundPage} />
    </Router>
  );
};
