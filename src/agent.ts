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

let findingsCount = 0;

export const provideHandleTransaction = (
  methods: string[],
  nethermindDeployAddress: string,
  fortaRegistryAddress: string
): HandleTransaction => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // filter TransactionEvent by methods for bot deployments and updates agents on Forta registry smart contract
    const functionCalls = txEvent.filterFunction(methods, fortaRegistryAddress);

    functionCalls.forEach((call) => {
      // extract transfer event arguments
      const { agentId, metadata, chainIds } = call.args;

      if (call.name === "createAgent") {
        findings.push(
          Finding.fromObject({
            name: "Nethermind Forta Bot Create Agent",
            description: `Bot has been Created by ${nethermindDeployAddress}`,
            alertId: "FORTA-1 Create",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              agentId: agentId.toString(),
              metadata,
              chainIds: chainIds.toString(),
            },
          })
        );
        findingsCount++;
      }

      if (call.name === "updateAgent") {
        findings.push(
          Finding.fromObject({
            name: "Nethermind Forta Bot Update Agent",
            description: `Bot has been updated by ${nethermindDeployAddress}`,
            alertId: "FORTA-1 Update",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              agentId: agentId.toString(),
              metadata,
              chainIds: chainIds.toString(),
            },
          })
        );
        findingsCount++;
      }
    });

    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(
    METHODS,
    FORTA_REGISTRY_ADDRESS,
    NETHERMIND_DEPLOY_ADDRESS
  ),
};
