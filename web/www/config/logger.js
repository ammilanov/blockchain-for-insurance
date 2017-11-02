'use strict';

import { Logger, config, transports } from 'winston';

export default (descriptor) => new Logger({
  transports: [
    new transports.Console({
      formatter: opts => config.colorize(opts.level, opts.level) +
        `: [${descriptor}]: ${opts.message || ''}` +
        (opts.meta && Object.keys(opts.meta).length ? '\n\t' + JSON.stringify(opts.meta) : '')
    })
  ]
});
