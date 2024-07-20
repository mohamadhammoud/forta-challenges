# Nethermind Forta Bot Deployment Agent

## Description

This agent detects specific transactions related to Nethermind bot deployments and updates on the Forta registry smart contract on the Polygon network. It monitors the `createAgent` and `updateAgent` methods from a specified deployer address.

## Supported Chains

- Polygon (Chain ID: 137)

## Alerts

- **FORTA-1 Create**

  - Fired when a transaction contains a call to the `createAgent` method from the specified deployer address
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata includes `agentId`, `metadata`, and `chainIds`

- **FORTA-1 Update**
  - Fired when a transaction contains a call to the `updateAgent` method from the specified deployer address
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata includes `agentId`, `metadata`, and `chainIds`

## Usage

This is a Forta application. You can run it with the following commands:

1. Install the dependencies:

   ```bash
   npm i
   ```

2. Run the tests:

   ```bash
   npm run test
   ```

This README file now includes instructions for configuring `forta.config.json` and `package.json` for the Polygon network, ensuring the agent operates correctly with the specified deployer and registry addresses.
