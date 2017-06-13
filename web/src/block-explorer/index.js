'use strict';

import React from 'react';
import { render } from 'react-dom';
import { IntlProvider, addLocaleData, defineMessages } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import deLocaleData from 'react-intl/locale-data/de';

import getLocale from '../shared/getLocale';
import translations from './translations';
import Container from './components/Container.js';
import './style.scss';

addLocaleData([...enLocaleData, ...deLocaleData]);

const locale = getLocale();
render (
  <IntlProvider locale={locale} messages={translations[locale]} defaultLocale='en'>
    <Container />
  </IntlProvider>,
  document.getElementById('block-explorer')
);
