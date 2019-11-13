# snapshotkeeper

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

CLI tool for BitBucket Server for maintaining test snapshots in flaky
environments.

## Usage

```sh
# Install `snapshotkeeper`
yarn global add @researchgate/snapshotkeeper

# Prepare to update flaky snapshots
yarn snapshotkeeper-prepare

# Run your tests with `--updateSnapshot` flag
yarn test --updateSnapshot

# Upload changed snapshots
yarn snapshotkeeper-upload
```
