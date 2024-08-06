# Nethermind Uniswap Forta Bot

## Description

This Forta Bot monitors the Polygon network for swap events occurring in Uniswap V3 pools. It captures and analyzes transactions interacting with Uniswap V3 pools, specifically detecting `Swap` events. The bot verifies the legitimacy of these events by cross-referencing the pool addresses with the Uniswap V3 factory contract.

## Supported Chains

- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)
- Optimism (Chain ID: 10)
- Arbitrum (Chain ID: 42161)

## Alerts

### **FORTA-3**

- **Description**: Triggered when a valid swap event is detected in a Uniswap V3 pool.
- **Severity**: Low
- **Type**: Info
- **Metadata**:
  - `poolAddress`: The address of the Uniswap V3 pool where the swap occurred.
  - `sender`: The address of the entity initiating the swap.
  - `recipient`: The address receiving the swapped tokens.
  - `amount0`: The amount of token0 involved in the swap.
  - `amount1`: The amount of token1 involved in the swap.
  - `sqrtPriceX96`: The square root price after the swap.
  - `liquidity`: The pool's liquidity after the swap.
  - `tick`: The tick of the pool after the swap.

## Test Data

The bot's functionality can be verified with the following test transactions:

- [0x4452848af5e7858b278d464cf3d7d4f85da54b97ddf30bcefbdeda9a9bc22510](https://polygonscan.com/tx/0x4452848af5e7858b278d464cf3d7d4f85da54b97ddf30bcefbdeda9a9bc22510) - Swap event in a Uniswap V3 pool
