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

    // Filter transaction events by logs that match the swap events and router address
    const swapLogs = txEvent.filterFunction(abi, lowerCaseSwapRouter02Address);

    swapLogs.forEach((swap) => {
      // Extract swap event arguments
      const tokenIn = swap.args.params["tokenIn"];
      const tokenOut = swap.args.params["tokenOut"];
      const fee = swap.args.params["fee"];
      const recipient = swap.args.params["recipient"];
      const amountIn = swap.args.params["amountIn"];
      const amountOutMinimum = swap.args.params["amountOutMinimum"];
      const sqrtPriceLimitX96 = swap.args.params["sqrtPriceLimitX96"];

      findings.push(
        Finding.fromObject({
          alertId: "FORTA-2",
          name: "Nethermind Forta Bot UniSwap",
          description: `Swap event detected on ${swapRouter02Address}`,
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient,
            amountIn: amountIn.toString(),
            amountOutMinimum: amountOutMinimum.toString(),
            sqrtPriceLimitX96: sqrtPriceLimitX96.toString(),
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
