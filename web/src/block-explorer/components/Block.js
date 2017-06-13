'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';

const Block = ({data}) => {
  return (
    <div className='block'>
      Block{data.id}
    </div>
  );
};

Block.propTypes = {
  data: PropTypes.object.isRequired
};

export default Block;
