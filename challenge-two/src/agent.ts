import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
} from "forta-agent";
import { ethers } from "ethers";
import {
  UNISWAP_V3_POOL_ABI,
  UNISWAP_V3_FACTORY_ABI,
  UNISWAP_V3_FACTORY_ADDRESS,
  SWAP_EVENT_SIGNATURE,
} from "./constants";

const provider = getEthersProvider();

const factoryContract = new ethers.Contract(
  UNISWAP_V3_FACTORY_ADDRESS,
  UNISWAP_V3_FACTORY_ABI,
  provider
);

export const provideHandleTransaction = (): HandleTransaction => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // Filter logs for Swap events by checking the first topic (event signature)
    const swapLogs = txEvent.logs.filter(
      (log) => log.topics[0] === SWAP_EVENT_SIGNATURE
    );

    for (const log of swapLogs) {
      try {
        const poolAddress = log.address;
        const poolContract = new ethers.Contract(
          poolAddress,
          UNISWAP_V3_POOL_ABI,
          provider
        );

        // Validate the pool's legitimacy by confirming it was created by the Uniswap V3 factory
        let token0, token1, fee;
        try {
          token0 = await poolContract.token0();
          token1 = await poolContract.token1();
          fee = await poolContract.fee();
        } catch (err) {
          console.error(
            `Error fetching token details from pool at ${poolAddress}:`,
            err
          );
          continue; // Skip this pool if fetching details fails
        }

        let derivedPoolAddress;
        try {
          derivedPoolAddress = await factoryContract.getPool(
            token0,
            token1,
            fee
          );
        } catch (err) {
          console.error(
            `Error verifying pool creation at ${poolAddress}:`,
            err
          );
          continue; // Skip this pool if verification fails
        }

        if (derivedPoolAddress.toLowerCase() !== poolAddress.toLowerCase()) {
          // The pool address doesn't match the one derived from the factory, ignore this log
          continue;
        }

        // Decode the log using the ABI
        let decodedLog;
        try {
          decodedLog = new ethers.utils.Interface(UNISWAP_V3_POOL_ABI).parseLog(
            log
          );
        } catch (err) {
          console.error("Error decoding swap log:", err);
          continue; // Skip this log if decoding fails
        }

        const { sender, recipient, amount0, amount1, sqrtPriceX96, liquidity } =
          decodedLog.args;

        findings.push(
          Finding.fromObject({
            alertId: "FORTA-3",
            name: "Uniswap V3 Pool Swap Detected",
            description: `Swap event detected in Uniswap V3 pool at ${poolAddress}`,
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              poolAddress,
              sender,
              recipient,
              amount0: amount0.toString(),
              amount1: amount1.toString(),
              sqrtPriceX96: sqrtPriceX96.toString(),
              liquidity: liquidity.toString(),
            },
          })
        );
      } catch (error) {
        console.error("Error processing swap log:", error);
      }
    }

    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(),
};
