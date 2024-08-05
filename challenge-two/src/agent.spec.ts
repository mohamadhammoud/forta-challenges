import {
  Finding,
  HandleTransaction,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { ethers } from "ethers";
import { provideHandleTransaction } from "./agent";
import { SWAP_EVENT_SIGNATURE } from "./constants";

describe("Uniswap V3 Pool Swap Detection", () => {
  let handleTransaction: HandleTransaction;

  const MOCK_POOL_ADDRESS_1 =
    "0x3ebFBF0CDaeF17aae3598Aa9A6eaC55Ed74276D0".toLocaleLowerCase();

  const INVALID_POOL_ADDRESS =
    "0x3ebFBF0CDaeF17aae3598Aa9A6eaC55Ed74276D1".toLocaleLowerCase();

  const swapEventFragment = new ethers.utils.Interface([
    "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
  ]).getEvent("Swap");

  beforeEach(() => {
    handleTransaction = provideHandleTransaction();
  });

  it("returns no findings if there are no swap events", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(0);
  });

  it("returns no findings if there are events other than swap events", async () => {
    const nonSwapEventFragment = new ethers.utils.Interface([
      "event NonSwapEvent(address indexed from, uint256 value)",
    ]).getEvent("NonSwapEvent");

    const txEvent = new TestTransactionEvent().addEventLog(
      nonSwapEventFragment,
      MOCK_POOL_ADDRESS_1,
      ["0x0000000000000000000000000000000000000001", 1000]
    );

    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(0);
  });

  it("returns no findings if the swap event is from an invalid pool", async () => {
    const swapEventLogData = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      1000,
      2000,
      "79228162514264337593543950336",
      "1000000000000000000",
      -3000,
    ];

    const txEvent = new TestTransactionEvent().addEventLog(
      swapEventFragment,
      "0x0000000000000000000000000000000000000003",
      swapEventLogData
    );

    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(0);
  });

  it("returns a finding if there is a valid swap event from Uniswap V3", async () => {
    const swapEventLogData = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      1000,
      2000,
      "79228162514264337593543950336",
      "1000000000000000000",
      -3000,
    ];

    const txEvent = new TestTransactionEvent().addEventLog(
      swapEventFragment,
      MOCK_POOL_ADDRESS_1,
      swapEventLogData
    );

    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      alertId: "FORTA-3",
      name: "Uniswap V3 Pool Swap Detected",
      description: `Swap event detected in Uniswap V3 pool at ${MOCK_POOL_ADDRESS_1}`,
      severity: FindingSeverity.Low,
      type: FindingType.Info,
      metadata: {
        poolAddress: MOCK_POOL_ADDRESS_1,
        sender: "0x0000000000000000000000000000000000000001",
        recipient: "0x0000000000000000000000000000000000000002",
        amount0: "1000",
        amount1: "2000",
        sqrtPriceX96: "79228162514264337593543950336",
        liquidity: "1000000000000000000",
      },
    });
  });

  it("returns findings for multiple valid swap events from different Uniswap V3 pools", async () => {
    const swapEventLogData1 = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      1000,
      2000,
      "79228162514264337593543950336",
      "1000000000000000000",
      -3000,
    ];

    const swapEventLogData2 = [
      "0x0000000000000000000000000000000000000003",
      "0x0000000000000000000000000000000000000004",
      2000,
      4000,
      "79228162514264337593543950336",
      "2000000000000000000",
      3000,
    ];

    const txEvent = new TestTransactionEvent()
      .addEventLog(swapEventFragment, MOCK_POOL_ADDRESS_1, swapEventLogData1)
      .addEventLog(swapEventFragment, MOCK_POOL_ADDRESS_1, swapEventLogData2);

    const findings = await handleTransaction(txEvent);

    expect(findings).toHaveLength(2);
    expect(findings).toStrictEqual([
      expect.objectContaining({
        alertId: "FORTA-3",
        name: "Uniswap V3 Pool Swap Detected",
        description: `Swap event detected in Uniswap V3 pool at ${MOCK_POOL_ADDRESS_1}`,
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          poolAddress: MOCK_POOL_ADDRESS_1,
          sender: "0x0000000000000000000000000000000000000001",
          recipient: "0x0000000000000000000000000000000000000002",
          amount0: "1000",
          amount1: "2000",
          sqrtPriceX96: "79228162514264337593543950336",
          liquidity: "1000000000000000000",
        },
      }),
      expect.objectContaining({
        alertId: "FORTA-3",
        name: "Uniswap V3 Pool Swap Detected",
        description: `Swap event detected in Uniswap V3 pool at ${MOCK_POOL_ADDRESS_1}`,
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          poolAddress: MOCK_POOL_ADDRESS_1,
          sender: "0x0000000000000000000000000000000000000003",
          recipient: "0x0000000000000000000000000000000000000004",
          amount0: "2000",
          amount1: "4000",
          sqrtPriceX96: "79228162514264337593543950336",
          liquidity: "2000000000000000000",
        },
      }),
    ]);
  });
});
// good
