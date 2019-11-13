# emailonacid-snapshot

Mail Visual Regression library based on
[Email on Acid API](https://api.emailonacid.com/docs/latest) service.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
- [Options](#options)
- [API](#api)
  - [`createEmail`](#createemail)
  - [`configureCreateEmail`](#configurecreateemail)
  - [`withDefaultPlugins`](#withdefaultplugins)
  - [`withOverridableClients`](#withoverridableclients)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

1.  Install `@researchgate/emailonacid-snapshot` package as devDependency:

```sh
# yarn
yarn add --dev @researchgate/emailonacid-snapshot

# npm
npm install --save-dev @researchgate/emailonacid-snapshot
```

2.  Define `process.env.EOA_API_KEY` and `process.env.EOA_ACCOUNT_PASSWORD`
    [API credentials](https://api.emailonacid.com/docs/latest#authentication).

3.  Use `createEmail` with your favorite test runner:

```js
const { createEmail } = require('@researchgate/emailonacid-snapshot');

async function run() {
  const email = await createEmail('<html><!-- static markup --></html>');
  const screenshot = await email.screenshot('outlook07');
  // assert screenshot at this point
  await email.clean();
}

run();
```

Check [options docs](#options) and [examples](./examples) for futher setup.

## Options

You can provide config with either one of `package.json#emailonacid`,
`emailonacid.config.js`, and `.emailonacidrc.json`.

_Note:_ `clients` and `plugins` options are not merged but overridden.

- `clients` \<?[Array]\<[string]\>\> List of default clients to create tests
  with.
- `credentials` \<[Object]\>
  - `apiKey` <[string]> EoA API key. Defaults to `process.env.EOA_API_KEY`.
  - `accountPassword` EoA API password. Defaults to
    `process.env.EOA_ACCOUNT_PASSWORD`.
- `debug` \<?[boolean]\> Enables verbose debug logging. Defaults to
  `process.env.DEBUG` or `process.env.EOA_DEBUG`.
- `plugins` \<?[Array]\<[Function]\>\> List of plugins to apply for each test.
  Default plugins are ThreadBustingPlugin, ContentRendererPlugin,
  LocalCopyPlugin, ContentCroppingPlugin. If you're willing to implement custom
  plugin, check one of those plugins for reference.
- `poll` \<?[Object]\> Polling options
  - `interval` \<[number]\> Polling interval. Defaults to `2.5e3` (2.5 sec).
  - `timeout` \<[number]\> Polling timeout. Defaults to `300e3` (5 min).

## API

See [TypeScript typings](./types/emailonacid-snapshot.d.ts) for more API
details.

### `createEmail`

```js
import { createEmail } from '@researchgate/emailonacid-snapshot';
```

Creates new email with default and [global options](#options). Returns email
instance object.

### `configureCreateEmail`

```js
import { configureCreateEmail } from '@researchgate/emailonacid-snapshot';
```

Creates new email factory with default, global and provided options. Helpful for
creating multiple `createEmail` functions to defined different set of targets or
different renderers.

### `withDefaultPlugins`

```js
import { withDefaultPlugins } from '@researchgate/emailonacid-snapshot/config';
```

Merges user-provided config with list of default plugins.

### `withOverridableClients`

```js
import { withOverridableClients } from '@researchgate/emailonacid-snapshot/config';
```

Merges user-provided config with a dynamic list of clients which can be
overridden via `EOA_CLIENTS` environment variable.

## License

MIT &copy; [ResearchGate](https://github.com/researchgate)

[boolean]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[string]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[number]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[array]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[object]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[function]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
