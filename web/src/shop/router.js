import React, { PropTypes, Props } from 'react';
import { Router, browserHistory, Route, IndexRoute } from 'react-router';

import App from './components/App';
import ChooseProductPage from './components/ChooseProductPage';
import ChooseInsurancePage from './components/ChooseInsurancePage';
import PaymentPage from './components/PaymentPage';
import SummaryPage from './components/SummaryPage';
import NotFoundPage from '../shared/NotFoundPage';

function router({shopType}) {
  return (
    <Router history={browserHistory}>
      <Route path={`shop/${shopType}`} component={App}>
        <IndexRoute component={ChooseProductPage} />
        <Route path='insurance' component={ChooseInsurancePage} />
        <Route path='payment' component={PaymentPage} />
        <Route path='summary' component={SummaryPage} />
        <Route path='*' component={NotFoundPage} />
      </Route>
      <Route path='*' component={NotFoundPage} />
    </Router>
  );
}

router.propTypes = {
  shopType: PropTypes.string
}

export default router;
