import React from 'react';
import { Router, browserHistory, Route } from 'react-router';

import App from './components/App';
import ClaimsPage from './components/ClaimsPage';
import ContractTemplatesPage from './components/ContractTemplatesPage';
import NewContractTemplatePage from './components/NewContractTemplatePage';
import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router history={browserHistory}>
      <Route path='contract-management' component={App}>
        <Route path='claim-processing' component={ClaimsPage} />
        <Route path='contract-templates' component={ContractTemplatesPage} />
        <Route path='new-contract-template' component={NewContractTemplatePage} />
        <Route path='*' component={NotFoundPage} />
      </Route>
      <Route path='*' component={NotFoundPage} />
    </Router>
  );
};
