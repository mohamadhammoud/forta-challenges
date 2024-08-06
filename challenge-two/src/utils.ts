import { ethers, Contract } from "ethers";

export const POOL_INIT_CODE_HASH =
  "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

interface PoolValues {
  token0: string;
  token1: string;
  fee: number;
}

export const createTwoAddress = (
  poolVal: PoolValues,
  factoryContract: Contract
): string => {
  return ethers.utils.getCreate2Address(
    factoryContract.address,
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint24"],
        [poolVal.token0, poolVal.token1, poolVal.fee]
      )
    ),
    POOL_INIT_CODE_HASH
  );
};
