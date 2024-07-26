import { FindingType, FindingSeverity, HandleTransaction } from "forta-agent";
import { Interface } from "ethers/lib/utils";
import { createAddress } from "forta-agent-tools";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { provideHandleTransaction } from "./agent";
import { UNISWAP_ROUTER_ABI, SWAP_ROUTER_02 } from "./constants";
import { BigNumber } from "ethers";

describe("Uniswap Swap Event Detection", () => {
  let handleTransaction: HandleTransaction;
  let mockTxEvent: TestTransactionEvent;

  const mockSwapRouterAddress = createAddress(SWAP_ROUTER_02);
  const SWAP_ABI = new Interface(UNISWAP_ROUTER_ABI);

  const mockExactInputSingleParams = {
    tokenIn: createAddress("0x01"),
    tokenOut: createAddress("0x02"),
    fee: BigNumber.from(3000),
    recipient: createAddress("0x03"),
    amountIn: BigNumber.from(1000),
    amountOutMinimum: BigNumber.from(990),
    sqrtPriceLimitX96: BigNumber.from(0),
  };

  const mockExactOutputSingleParams = {
    tokenIn: createAddress("0x04"),
    tokenOut: createAddress("0x05"),
    fee: BigNumber.from(1000),
    recipient: createAddress("0x06"),
    amountOut: BigNumber.from(2000),
    amountInMaximum: BigNumber.from(1980),
    sqrtPriceLimitX96: BigNumber.from(0),
  };

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      UNISWAP_ROUTER_ABI,
      mockSwapRouterAddress
    );
  });

  beforeEach(() => {
    mockTxEvent = new TestTransactionEvent();
  });

  it("returns empty findings if there are no swap events", async () => {
    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns correct findings if there is one exactInputSingle swap event", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setTo(mockSwapRouterAddress)
      .setData(
        SWAP_ABI.encodeFunctionData("exactInputSingle", [
          mockExactInputSingleParams,
        ])
      );

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([
      expect.objectContaining({
        alertId: "FORTA-2",
        name: "Nethermind Forta Bot UniSwap - exactInputSingle",
        description: `Swap event detected on ${mockSwapRouterAddress}`,
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          tokenIn: mockExactInputSingleParams.tokenIn,
          tokenOut: mockExactInputSingleParams.tokenOut,
          fee: mockExactInputSingleParams.fee.toString(),
          recipient: mockExactInputSingleParams.recipient,
          amountIn: mockExactInputSingleParams.amountIn.toString(),
          amountOutMinimum:
            mockExactInputSingleParams.amountOutMinimum.toString(),
          sqrtPriceLimitX96:
            mockExactInputSingleParams.sqrtPriceLimitX96.toString(),
        },
      }),
    ]);
  });

  it("returns correct findings if there is one exactOutputSingle swap event", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setTo(mockSwapRouterAddress)
      .setData(
        SWAP_ABI.encodeFunctionData("exactOutputSingle", [
          mockExactOutputSingleParams,
        ])
      );

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([
      expect.objectContaining({
        alertId: "FORTA-2",
        name: "Nethermind Forta Bot UniSwap - exactOutputSingle",
        description: `Swap event detected on ${mockSwapRouterAddress}`,
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          tokenIn: mockExactOutputSingleParams.tokenIn,
          tokenOut: mockExactOutputSingleParams.tokenOut,
          fee: mockExactOutputSingleParams.fee.toString(),
          recipient: mockExactOutputSingleParams.recipient,
          amountOut: mockExactOutputSingleParams.amountOut.toString(),
          amountInMaximum:
            mockExactOutputSingleParams.amountInMaximum.toString(),
          sqrtPriceLimitX96:
            mockExactOutputSingleParams.sqrtPriceLimitX96.toString(),
        },
      }),
    ]);
  });

  it("returns correct findings if there are multiple swap events", async () => {
    const txEvent1 = new TestTransactionEvent()
      .setTo(mockSwapRouterAddress)
      .setData(
        SWAP_ABI.encodeFunctionData("exactInputSingle", [
          mockExactInputSingleParams,
        ])
      );

    const txEvent2 = new TestTransactionEvent()
      .setTo(mockSwapRouterAddress)
      .setData(
        SWAP_ABI.encodeFunctionData("exactOutputSingle", [
          mockExactOutputSingleParams,
        ])
      );

    const findings1 = await handleTransaction(txEvent1);
    const findings2 = await handleTransaction(txEvent2);

    const findings = [...findings1, ...findings2];

    expect(findings).toStrictEqual([
      expect.objectContaining({
        alertId: "FORTA-2",
        name: "Nethermind Forta Bot UniSwap - exactInputSingle",
        description: `Swap event detected on ${mockSwapRouterAddress}`,
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          tokenIn: mockExactInputSingleParams.tokenIn,
          tokenOut: mockExactInputSingleParams.tokenOut,
          fee: mockExactInputSingleParams.fee.toString(),
          recipient: mockExactInputSingleParams.recipient,
          amountIn: mockExactInputSingleParams.amountIn.toString(),
          amountOutMinimum:
            mockExactInputSingleParams.amountOutMinimum.toString(),
          sqrtPriceLimitX96:
            mockExactInputSingleParams.sqrtPriceLimitX96.toString(),
        },
      }),
      expect.objectContaining({
        alertId: "FORTA-2",
        name: "Nethermind Forta Bot UniSwap - exactOutputSingle",
        description: `Swap event detected on ${mockSwapRouterAddress}`,
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          tokenIn: mockExactOutputSingleParams.tokenIn,
          tokenOut: mockExactOutputSingleParams.tokenOut,
          fee: mockExactOutputSingleParams.fee.toString(),
          recipient: mockExactOutputSingleParams.recipient,
          amountOut: mockExactOutputSingleParams.amountOut.toString(),
          amountInMaximum:
            mockExactOutputSingleParams.amountInMaximum.toString(),
          sqrtPriceLimitX96:
            mockExactOutputSingleParams.sqrtPriceLimitX96.toString(),
        },
      }),
    ]);
  });

  it("returns empty findings if the swap event is from a different address", async () => {
    const differentAddress = createAddress("0x07");

    mockTxEvent = new TestTransactionEvent()
      .setTo(differentAddress)
      .setData(
        SWAP_ABI.encodeFunctionData("exactInputSingle", [
          mockExactInputSingleParams,
        ])
      );

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if the logs do not match the swap event signature", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setTo(mockSwapRouterAddress)
      .setData("0x12345678"); // Random data to simulate unrelated event

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([]);
  });
});
