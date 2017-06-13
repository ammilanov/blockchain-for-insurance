/*global io*/
'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import naturalSort from 'javascript-natural-sort';
import { Socket } from 'engine.io-client';

import * as Api from '../api';
import Block from './Block';

const MAX_BLOCK_COUNT = 5;

class Container extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      blocks: [],
      hidden: true,
      hintHidden: true
    };

    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.showHint = this.showHint.bind(this);
    this.hideHint = this.hideHint.bind(this);

    setTimeout(async () => {
      const socket = io('/contract-management');
      let blocks = await Api.getBlocksFromContractManagement(MAX_BLOCK_COUNT);
      socket.on('block', block => {
        console.log(block);
        this.setState({ blocks: [...this.state.blocks, block] });
      });
      blocks = Array.isArray(blocks) ? blocks : [];
      this.setState({ blocks });
    });
  }

  toggleVisibility() {
    this.setState({ hidden: !this.state.hidden });
  }

  showHint() {
    this.setState({ hintHidden: false });
  }

  hideHint() {
    this.setState({ hintHidden: true });
  }

  setState(state) {
    const { blocks } = state;
    // Sort the blocks by id
    if (Array.isArray(state.blocks)) {
      state.blocks = state.blocks.sort((a, b) => naturalSort(a.id, b.id));
      if (blocks.length > MAX_BLOCK_COUNT) {
        // Top the amount of blocks to be displayed
        state.blocks = blocks.slice(-MAX_BLOCK_COUNT);
      }
    }
    return super.setState(...arguments);
  }

  render() {
    const { blocks, hidden, hintHidden } = this.state;
    const { intl } = this.props;

    const explorerMessage = hidden ? 'Show Explorer' : 'Hide Explorer';
    const explorerIcon = hidden ? '/img/icons/maximize_24.svg' :
      '/img/icons/minimize_24.svg';

    return (
      <div className='block-explorer'>
        <div className={`toggle-visibility-button ${hidden ? 'hidden' : ''}`}>
          <div className={`hint ${hintHidden ? 'hidden' : ''}`}>
            {intl.formatMessage({ id: explorerMessage })}
          </div>
          <div onClick={this.toggleVisibility}
            onMouseEnter={this.showHint}
            onMouseLeave={this.hideHint}>
            <img src={explorerIcon} />
          </div>
        </div>
        <div className={`contents ${hidden ? 'hidden' : ''}`}>
          <div>
            <h2 className='ibm-h2' style={{ paddingLeft: '10px' }}>
              <FormattedMessage id='Block Explorer' />
            </h2>
          </div>
          <div>
            {blocks.map(block => <Block key={block.id} data={block} />)}
          </div>
        </div>
      </div>
    );
  }

}

Container.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Container);
