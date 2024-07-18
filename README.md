# Nethermind Forta Bot Deployment Agent

## Description

This agent detects specific transactions related to Nethermind bot deployments and updates on the Forta registry smart contract on the Polygon network. It monitors the `createAgent` and `updateAgent` methods from a specified deployer address.

## Supported Chains

- Polygon (Chain ID: 137)
- List any other chains this agent can support e.g. Ethereum, BSC

## Alerts

- **FORTA-1 Create**

  - Fired when a transaction contains a call to the `createAgent` method from the specified deployer address
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)
  - Metadata includes `agentId`, `metadata`, and `chainIds`

- **FORTA-1 Update**
  - Fired when a transaction contains a call to the `updateAgent` method from the specified deployer address
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)
  - Metadata includes `agentId`, `metadata`, and `chainIds`

## Configuration

### forta.config.json

To configure the agent, create a `forta.config.json` file with the following content:

```json
{
  "agentId": "",
  "jsonRpcUrl": ""
}
```

### package.json

Ensure the package.json includes the Polygon chain ID:

```json
 "chainIds": [
    137
  ]
```

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

3. Run the agent with a specific transaction to detect:

   ````bash
   npm run tx 0x804a13043b636492a1c27d9d2ef74eeed6560252afa8b31d1baccb4d4ecce509
     ```

   ````

This README file now includes instructions for configuring `forta.config.json` and `package.json` for the Polygon network, ensuring the agent operates correctly with the specified deployer and registry addresses.
