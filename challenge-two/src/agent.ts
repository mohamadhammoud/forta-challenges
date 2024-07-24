import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
} from "forta-agent";
import { UNISWAP_ROUTER_ABI, SWAP_ROUTER_02 } from "./constants";

export const provideHandleTransaction = (
  abi: any,
  swapRouter02Address: string
): HandleTransaction => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];
    const lowerCaseSwapRouter02Address = swapRouter02Address.toLowerCase();

    const iface = new ethers.utils.Interface(abi);

    // Filter transaction events by logs that match the swap events and router address
    const swapLogs = txEvent.filterFunction(abi, lowerCaseSwapRouter02Address);

    console.log({ swapLogs });

    swapLogs.forEach((swap) => {
      console.log({ swap });

      // Extract swap event arguments
      const {
        sender,
        recipient,
        amount0,
        amount1,
        sqrtPriceX96,
        liquidity,
        tick,
      } = swap.args;

      findings.push(
        Finding.fromObject({
          alertId: "FORTA-2 Swap",
          name: "Nethermind Forta Bot UniSwap",
          description: `Swap event detected on ${swapRouter02Address}`,
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            sender,
            recipient,
            amount0: amount0.toString(),
            amount1: amount1.toString(),
            sqrtPriceX96: sqrtPriceX96.toString(),
            liquidity: liquidity.toString(),
            tick: tick.toString(),
          },
        })
      );
    });

    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(
    UNISWAP_ROUTER_ABI,
    SWAP_ROUTER_02
  ),
};
