'use strict';

import React, { PropTypes, Props } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

class DateInput extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    IBMCore.common.widget.datepicker.init(this.refs.dateInputElement, {});
    let self = this;
    setTimeout(() => {
      self.picker = jQuery(this.refs.dateInputElement).pickadate('picker');
      self.picker.on('set', self.onChange);
    }, 500);
  }

  componentWillUnmount() {
    this.picker.off('set', this.onChange)
  }

  onChange(value) {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value.select);
    }
  }

  render() {
    let formattedDate;
    if (this.props.value && this.props.value > 0) {
      formattedDate = moment(new Date(this.props.value)).format('L', this.props.intl.locale);
    }
    return (
      <input type='text' readOnly={true} ref='dateInputElement' value={formattedDate} />
    );
  }
}

DateInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.number,
  intl: intlShape.isRequired
};

export default injectIntl(DateInput);
