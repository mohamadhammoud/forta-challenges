export interface NetworkData {
  address: string; // The smart contract address
  //   minimumDepositAmount: number;
  //   blacklistedAddresses: string[];
}

export const networkData: Record<number, NetworkData> = {
  137: {
    address: "0x61447385B019187daa48e91c55c02AF1F1f3F863",
    // minimumDepositAmount: 0.01,
    // blacklistedAddresses: [
    //   "0x7c71a3d85a8d620eeab9339cce776ddc14a8129c",
    //   "0x17156c0cf9701b09114cb3619d9f3fd937caa3a8",
    // ],
  },
};
