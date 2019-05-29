#!/usr/bin/env node
'use strict';

require('../prepare')()
  .then((message) => process.stdout.write(message))
  .catch((error) => process.stderr.write(`${error.toString()}\n`));
