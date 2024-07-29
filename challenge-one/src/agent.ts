import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import {
  METHODS,
  FORTA_REGISTRY_ADDRESS,
  NETHERMIND_DEPLOY_ADDRESS,
} from "./constants";

export const provideHandleTransaction = (
  methods: string[],
  nethermindDeployAddress: string,
  fortaRegistryAddress: string
): HandleTransaction => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // return empty findings if TransactionEvent is not from Nethermind
    if (txEvent.from !== nethermindDeployAddress.toLowerCase()) {
      return findings;
    }

    // filter TransactionEvent by methods for bot deployments and updates agents on Forta registry smart contract
    const functionCalls = txEvent.filterFunction(methods, fortaRegistryAddress);

    functionCalls.forEach((call) => {
      // extract transfer event arguments
      const { agentId, metadata, chainIds } = call.args;

      if (call.name === "createAgent") {
        findings.push(
          Finding.fromObject({
            name: "Nethermind Forta Bot Create Agent",
            description: `Bot ${agentId} has been Created by ${nethermindDeployAddress}`,
            alertId: "FORTA-CREATE-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              agentId: agentId.toString(),
              metadata,
              chainIds: chainIds.toString(),
            },
          })
        );
      } else {
        // call.name === "updateAgent"
        findings.push(
          Finding.fromObject({
            name: "Nethermind Forta Bot Update Agent",
            description: `Bot ${agentId} has been updated by ${nethermindDeployAddress}`,
            alertId: "FORTA-UPDATE-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              agentId: agentId.toString(),
              metadata,
              chainIds: chainIds.toString(),
            },
          })
        );
      }
    });

    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(
    METHODS,
    NETHERMIND_DEPLOY_ADDRESS,
    FORTA_REGISTRY_ADDRESS
  ),
};
