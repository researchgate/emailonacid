# emailonacid-proxy

Self-hosted proxy for throttling EoA API requests to 60 per 5 minutes
(applicable for all of their plans).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

1. Install the `emailonacid-proxy`:

```sh
# yarn
yarn add @researchgate/emailonacid-proxy

# npm
npm add --save @researchgate/emailonacid-proxy
```

2. Run the proxy:

```sh
# yarn
yarn emailonacid-proxy

# npx
npx emailonacid-proxy
```

3. Point EoA client to a new url via `baseApiUrl`:

```js
const createClient = require('@researchgate/emailonacid-client');

const client = createClient({
  baseApiUrl: '<your proxy address>',
});
```

## Usage

```sh
Usage: emailonacid-proxy [options]

Options:
  -p, --port <port>                  Port number (default: 8080)
  -r, --requests-per-interval <rpi>  Max requests to make per given interval (default: 60)
  -i, --interval <interval>          Time interval to track requests in milliseconds (default: 300000)
  -d, --destination [url]            Proxy destination (default: "https://api.emailonacid.com/v5")
  -h, --help                         output usage information
```
