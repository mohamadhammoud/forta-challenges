// import { FindingType, FindingSeverity, HandleTransaction } from "forta-agent";
// import { Interface } from "ethers/lib/utils";
// import { createAddress } from "forta-agent-tools";
// import { TestTransactionEvent } from "forta-agent-tools/lib/test";
// import { ethers } from "ethers";
// import { provideHandleTransaction } from "./agent";
// import {
//   UNISWAP_V3_POOL_ABI,
//   UNISWAP_V3_FACTORY_ADDRESS,
//   SWAP_EVENT,
// } from "./constants";

// describe("Uniswap V3 Pool Swap Event Detection", () => {
//   let handleTransaction: HandleTransaction;
//   let mockProvider: ethers.providers.Provider;

//   const SWAP_ABI = new Interface(UNISWAP_V3_POOL_ABI);

//   const TEST_VAL1 = {
//     TOKEN0_ADDR: createAddress("0x01"),
//     TOKEN0_VAL: ethers.BigNumber.from("100"),
//     TOKEN1_ADDR: createAddress("0x02"),
//     TOKEN1_VAL: ethers.BigNumber.from("400"),
//     POOL_ADDR: createAddress("0x03"),
//     Fee: ethers.BigNumber.from("3000"),
//   };

//   const TEST_VAL2 = {
//     TOKEN2_ADDR: createAddress("0x04"),
//     TOKEN2_VAL: ethers.BigNumber.from("100"),
//     TOKEN3_ADDR: createAddress("0x05"),
//     TOKEN3_VAL: ethers.BigNumber.from("400"),
//     POOL_ADDR2: createAddress("0x06"),
//     Fee: ethers.BigNumber.from("500"),
//   };

//   beforeAll(() => {
//     mockProvider = new ethers.providers.JsonRpcProvider(
//       "http://localhost:8545"
//     );
//     handleTransaction = provideHandleTransaction(mockProvider);
//   });

//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   it("returns empty findings if there are no swap events", async () => {
//     const txEvent = new TestTransactionEvent();
//     const findings = await handleTransaction(txEvent);
//     expect(findings).toStrictEqual([]);
//   });

//   it("returns correct findings if there is a valid swap event from a Uniswap V3 pool", async () => {
//     // Create a mock contract instance for the pool
//     const mockPoolContract = {
//       callStatic: {
//         factory: jest.fn().mockResolvedValue(UNISWAP_V3_FACTORY_ADDRESS),
//       },
//     };

//     // Mock ethers.Contract to return the mockPoolContract
//     jest
//       .spyOn(ethers, "Contract")
//       .mockImplementation(() => mockPoolContract as any);

//     // Create a fake swap log event
//     const txEvent = new TestTransactionEvent()
//       .setTo(TEST_VAL1.POOL_ADDR)
//       .addEventLog(SWAP_ABI.getEvent("Swap"), TEST_VAL1.POOL_ADDR, [
//         TEST_VAL1.TOKEN0_ADDR,
//         TEST_VAL1.TOKEN1_ADDR,
//         TEST_VAL1.TOKEN0_VAL,
//         TEST_VAL1.TOKEN1_VAL,
//         ethers.BigNumber.from(10), // sqrtPriceX96
//         ethers.BigNumber.from(1000), // liquidity
//         ethers.BigNumber.from(1), // tick
//       ]);

//     const findings = await handleTransaction(txEvent);
//     expect(findings).toStrictEqual([
//       expect.objectContaining({
//         alertId: "FORTA-3",
//         name: "Uniswap V3 Pool Swap Detected",
//         description: `Swap event detected in Uniswap V3 pool at ${TEST_VAL1.POOL_ADDR}`,
//         severity: FindingSeverity.Low,
//         type: FindingType.Info,
//         metadata: {
//           poolAddress: TEST_VAL1.POOL_ADDR,
//           sender: expect.any(String),
//           recipient: expect.any(String),
//           amount0: TEST_VAL1.TOKEN0_VAL.toString(),
//           amount1: TEST_VAL1.TOKEN1_VAL.toString(),
//           sqrtPriceX96: "10",
//           liquidity: "1000",
//         },
//       }),
//     ]);
//   });

//   it("returns multiple findings if there are multiple valid swap events from different Uniswap V3 pools", async () => {
//     // Create mock contract instances for the pools
//     const mockPoolContract1 = {
//       callStatic: {
//         factory: jest.fn().mockResolvedValue(UNISWAP_V3_FACTORY_ADDRESS),
//       },
//     };

//     const mockPoolContract2 = {
//       callStatic: {
//         factory: jest.fn().mockResolvedValue(UNISWAP_V3_FACTORY_ADDRESS),
//       },
//     };

//     // Mock ethers.Contract to return the respective mockPoolContract
//     jest
//       .spyOn(ethers, "Contract")
//       .mockImplementationOnce(() => mockPoolContract1 as any)
//       .mockImplementationOnce(() => mockPoolContract2 as any);

//     // Create a transaction event with swap logs from two different pools
//     const txEvent = new TestTransactionEvent()
//       .setTo(TEST_VAL1.POOL_ADDR)
//       .addEventLog(SWAP_ABI.getEvent("Swap"), TEST_VAL1.POOL_ADDR, [
//         TEST_VAL1.TOKEN0_ADDR,
//         TEST_VAL1.TOKEN1_ADDR,
//         TEST_VAL1.TOKEN0_VAL,
//         TEST_VAL1.TOKEN1_VAL,
//         ethers.BigNumber.from(10), // sqrtPriceX96
//         ethers.BigNumber.from(1000), // liquidity
//         ethers.BigNumber.from(1), // tick
//       ])
//       .addEventLog(SWAP_ABI.getEvent("Swap"), TEST_VAL2.POOL_ADDR2, [
//         TEST_VAL2.TOKEN2_ADDR,
//         TEST_VAL2.TOKEN3_ADDR,
//         TEST_VAL2.TOKEN2_VAL,
//         TEST_VAL2.TOKEN3_VAL,
//         ethers.BigNumber.from(10), // sqrtPriceX96
//         ethers.BigNumber.from(1000), // liquidity
//         ethers.BigNumber.from(1), // tick
//       ]);

//     const findings = await handleTransaction(txEvent);
//     expect(findings.length).toBe(2);
//     expect(findings[0]).toMatchObject({
//       alertId: "FORTA-3",
//       name: "Uniswap V3 Pool Swap Detected",
//       description: `Swap event detected in Uniswap V3 pool at ${TEST_VAL1.POOL_ADDR}`,
//       severity: FindingSeverity.Low,
//       type: FindingType.Info,
//       metadata: {
//         poolAddress: TEST_VAL1.POOL_ADDR,
//         sender: expect.any(String),
//         recipient: expect.any(String),
//         amount0: TEST_VAL1.TOKEN0_VAL.toString(),
//         amount1: TEST_VAL1.TOKEN1_VAL.toString(),
//         sqrtPriceX96: "10",
//         liquidity: "1000",
//       },
//     });
//     expect(findings[1]).toMatchObject({
//       alertId: "FORTA-3",
//       name: "Uniswap V3 Pool Swap Detected",
//       description: `Swap event detected in Uniswap V3 pool at ${TEST_VAL2.POOL_ADDR2}`,
//       severity: FindingSeverity.Low,
//       type: FindingType.Info,
//       metadata: {
//         poolAddress: TEST_VAL2.POOL_ADDR2,
//         sender: expect.any(String),
//         recipient: expect.any(String),
//         amount0: TEST_VAL2.TOKEN2_VAL.toString(),
//         amount1: TEST_VAL2.TOKEN3_VAL.toString(),
//         sqrtPriceX96: "10",
//         liquidity: "1000",
//       },
//     });
//   });

//   it("returns empty findings if the swap event is from a non-Uniswap V3 pool", async () => {
//     const mockPoolContract = {
//       callStatic: {
//         factory: jest.fn().mockResolvedValue(createAddress("0x00")),
//       },
//     };

//     jest
//       .spyOn(ethers, "Contract")
//       .mockImplementation(() => mockPoolContract as any);

//     const txEvent = new TestTransactionEvent()
//       .setTo(TEST_VAL1.POOL_ADDR)
//       .addEventLog(SWAP_ABI.getEvent("Swap"), TEST_VAL1.POOL_ADDR, [
//         TEST_VAL1.TOKEN0_ADDR,
//         TEST_VAL1.TOKEN1_ADDR,
//         TEST_VAL1.TOKEN0_VAL,
//         TEST_VAL1.TOKEN1_VAL,
//         ethers.BigNumber.from(10), // sqrtPriceX96
//         ethers.BigNumber.from(1000), // liquidity
//         ethers.BigNumber.from(1), // tick
//       ]);

//     const findings = await handleTransaction(txEvent);
//     expect(findings).toStrictEqual([]);
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });
// });
