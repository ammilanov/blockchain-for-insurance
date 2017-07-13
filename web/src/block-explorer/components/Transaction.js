'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

const calcDate = (timestamp) => {
  let date = 0;
  date += timestamp.seconds.low * 1000;
  date += (timestamp.seconds.high << 32) * 1000;
  date += timestamp.nanos / 1000000;
  return new Date(date);
};

class Transaction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      overflown: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      const transTypeElem = this.refs.transTypeElem;
      const overflown = transTypeElem.clientWidth < transTypeElem.scrollWidth;
      if (overflown) {
        transTypeElem.style.setProperty(
          '--scroll-width', transTypeElem.scrollWidth + 'px');
        this.setState({ overflown });
      }
    }, navigator.userAgent.indexOf('Safari') > -1 ? 1000 : 0);
    // Safari needs some time, to avoid bugs
  }

  render() {
    const { intl, data: { timestamp, type } } = this.props;
    const date = calcDate(timestamp);
    const formattedDate = moment(date).format('L', intl.locale);
    return (
      <div className='transaction'>
        <div className='trans-date'>{formattedDate}</div>
        &nbsp;
        <div className='trans-type' ref='transTypeElem'>
          <div className={this.state.overflown ? 'overflown' : ''}>
            <code>{type}</code>
          </div>
        </div>
      </div>
    );
  }
}

Transaction.propTypes = {
  intl: intlShape.isRequired,
  data: PropTypes.shape({
    type: PropTypes.string.isRequired,
    timestamp: PropTypes.object.isRequired
  })
};

export default injectIntl(Transaction);
