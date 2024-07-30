import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import { ethers } from "ethers";
import { UNISWAP_V3_POOL_ABI, UNISWAP_V3_FACTORY_ADDRESS } from "./constants";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const { RPC_PROVIDER_URL } = process.env;

export const provideHandleTransaction = (
  provider: ethers.providers.Provider
): HandleTransaction => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // Filter logs for Swap events by checking the first topic (event signature)
    const swapEventSignature = ethers.utils.id(
      "Swap(address,address,int256,int256,uint160,uint128,int24)"
    );

    const swapLogs = txEvent.logs.filter(
      (log) => log.topics[0] === swapEventSignature
    );

    for (const log of swapLogs) {
      try {
        const poolContract = new ethers.Contract(
          log.address,
          UNISWAP_V3_POOL_ABI,
          provider
        );

        // Check if the log is from a valid Uniswap V3 pool
        const poolFactory: string = await poolContract.callStatic.factory();

        if (
          poolFactory.toLowerCase() !== UNISWAP_V3_FACTORY_ADDRESS.toLowerCase()
        ) {
          // This is not a valid Uniswap V3 pool
          continue;
        }

        // Decode the log using the ABI
        const decodedLog = new ethers.utils.Interface(
          UNISWAP_V3_POOL_ABI
        ).parseLog(log);

        const { sender, recipient, amount0, amount1, sqrtPriceX96, liquidity } =
          decodedLog.args;

        findings.push(
          Finding.fromObject({
            alertId: "FORTA-3",
            name: "Uniswap V3 Pool Swap Detected",
            description: `Swap event detected in Uniswap V3 pool at ${log.address}`,
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              poolAddress: log.address,
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
  handleTransaction: provideHandleTransaction(
    new ethers.providers.JsonRpcProvider(RPC_PROVIDER_URL)
  ),
};
