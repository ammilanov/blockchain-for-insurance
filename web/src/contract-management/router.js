import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import App from './components/App';
import ClaimsPage from './components/ClaimsPage';
import ContractTemplatesPage from './components/ContractTemplatesPage';
import NewContractTemplatePage from './components/NewContractTemplatePage';
import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router basename='/contract-management'>
      <App>
        <Switch>
          <Route exact path='/claim-processing' component={ClaimsPage} />
          <Route path='/contract-templates' component={ContractTemplatesPage} />
          <Route path='/new-contract-template'
            component={NewContractTemplatePage} />
          <Route component={NotFoundPage} />
        </Switch>
      </App>
    </Router>
  );
}
