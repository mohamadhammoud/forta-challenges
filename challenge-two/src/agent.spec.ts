import {
  TestTransactionEvent,
  MockEthersProvider,
} from "forta-agent-tools/lib/test";
import { provideHandleTransaction } from "./agent";
import { ethers } from "ethers";
import { SWAP_EVENT_SIGNATURE } from "./constants";
import { FindingSeverity, FindingType } from "forta-agent";

describe("Uniswap V3 Pool Swap Detection", () => {
  let handleTransaction: any;
  let mockProvider: MockEthersProvider;

  const MOCK_POOL_ADDRESS_1 = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8";
  const MOCK_POOL_ADDRESS_2 = "0x1f98431c8ad98523631ae4a59f267346ea31f984";

  beforeEach(() => {
    mockProvider = new MockEthersProvider();
    handleTransaction = provideHandleTransaction();
  });

  it("returns no findings if there are no swap events", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(0);
  });

  it("returns no findings if there are events other than swap events", async () => {
    const nonSwapEventLog = {
      data: "0x",
      topics: [ethers.utils.id("NonSwapEvent(address,uint256)")],
    };
    const txEvent = new TestTransactionEvent().addEventLog(
      ethers.utils.id("NonSwapEvent(address,uint256)"),
      MOCK_POOL_ADDRESS_1,
      [nonSwapEventLog.data]
    );
    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(0);
  });

  it("returns no findings if the swap event is from an invalid pool", async () => {
    const swapEventLog = {
      data: ethers.utils.defaultAbiCoder.encode(
        [
          "address",
          "address",
          "int256",
          "int256",
          "uint160",
          "uint128",
          "int24",
        ],
        [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
          1000,
          2000,
          "79228162514264337593543950336", // sqrtPriceX96
          "1000000000000000000", // liquidity
          -3000, // tick
        ]
      ),
      topics: [SWAP_EVENT_SIGNATURE],
    };

    const txEvent = new TestTransactionEvent().addEventLog(
      ethers.utils.id(
        "event Swap (index_topic_1 address sender, index_topic_2 address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
      ),
      "0x0000000000000000000000000000000000000003", // Invalid pool address
      [swapEventLog.topics[0], swapEventLog.data]
    );

    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(0);
  });

  it("returns a finding if there is a valid swap event from Uniswap V3", async () => {
    const swapEventLog = {
      data: ethers.utils.defaultAbiCoder.encode(
        [
          "address",
          "address",
          "int256",
          "int256",
          "uint160",
          "uint128",
          "int24",
        ],
        [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
          1000,
          2000,
          "79228162514264337593543950336", // sqrtPriceX96
          "1000000000000000000", // liquidity
          -3000, // tick
        ]
      ),
      topics: [SWAP_EVENT_SIGNATURE],
    };

    const txEvent = new TestTransactionEvent().addEventLog(
      ethers.utils.id(
        "event Swap (index_topic_1 address sender, index_topic_2 address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
      ),
      MOCK_POOL_ADDRESS_1,
      [swapEventLog.topics[0], swapEventLog.data]
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
    const swapEventLog1 = {
      data: ethers.utils.defaultAbiCoder.encode(
        [
          "address",
          "address",
          "int256",
          "int256",
          "uint160",
          "uint128",
          "int24",
        ],
        [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
          1000,
          2000,
          "79228162514264337593543950336", // sqrtPriceX96
          "1000000000000000000", // liquidity
          -3000, // tick
        ]
      ),
      topics: [SWAP_EVENT_SIGNATURE],
    };

    const swapEventLog2 = {
      data: ethers.utils.defaultAbiCoder.encode(
        [
          "address",
          "address",
          "int256",
          "int256",
          "uint160",
          "uint128",
          "int24",
        ],
        [
          "0x0000000000000000000000000000000000000003",
          "0x0000000000000000000000000000000000000004",
          2000,
          4000,
          "79228162514264337593543950336", // sqrtPriceX96
          "2000000000000000000", // liquidity
          3000, // tick
        ]
      ),
      topics: [SWAP_EVENT_SIGNATURE],
    };

    const txEvent = new TestTransactionEvent()
      .addEventLog(
        ethers.utils.id(
          "event Swap (index_topic_1 address sender, index_topic_2 address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
        ),
        MOCK_POOL_ADDRESS_1,
        [swapEventLog1.topics[0], swapEventLog1.data]
      )
      .addEventLog(
        ethers.utils.id(
          "event Swap (index_topic_1 address sender, index_topic_2 address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
        ),
        MOCK_POOL_ADDRESS_2,
        [swapEventLog2.topics[0], swapEventLog2.data]
      );

    const findings = await handleTransaction(txEvent);
    expect(findings).toHaveLength(2);
  });
});
