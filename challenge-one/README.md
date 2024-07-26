# Nethermind Forta Bot Deployment Agent

## Description

This agent detects specific transactions related to Nethermind bot deployments and updates on the Forta registry smart contract on the Polygon network. It monitors the `createAgent` and `updateAgent` methods from a specified deployer address.

## Supported Chains

- Polygon (Chain ID: 137)

## Alerts

- **FORTA-CREATE-1**

  - Fired when a transaction contains a call to the `createAgent` method from the specified deployer address
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata includes `agentId`, `metadata`, and `chainIds`
    - `agentId` : Newly created bot id.
    - `metadata` : transaction metadata.
    - `chainsIds` : list of ids of supported chains.

- **FORTA-UPDATE-1**
  - Fired when a transaction contains a call to the `updateAgent` method from the specified deployer address
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata includes `agentId`, `metadata`, and `chainIds`
    - `agentId` : Newly created bot id.
    - `metadata` : transaction metadata.
    - `chainsIds` : list of ids of supported chains.

## Test Data

The behaviour of the bot can be verified with the following transactions:

- [0x878cf23f0c3533941bc32f519a982fa294057a33ce52e8943bf03fe62ededeac](https://polygonscan.com//tx/0x878cf23f0c3533941bc32f519a982fa294057a33ce52e8943bf03fe62ededeac)
