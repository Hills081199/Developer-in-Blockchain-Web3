# Ethereum Smart Contract: Understanding `address` vs `address payable`

This project demonstrates the differences between `address` and `address payable` types in Solidity using a Hardhat development environment. It includes two smart contracts (`Owner.sol` and `Receiver.sol`) and two Hardhat scripts (`deploy.js` and `interact.js`) to deploy and interact with the contracts on the Sepolia testnet.

## Project Overview

The project showcases:
- The distinction between `address` and `address payable` in Solidity.
- How to send Ether using the `.transfer()` function.
- The implications of type casting from `address` to `address payable`.
- Practical deployment and interaction with contracts using Hardhat and Ethers.js.
- The flow of sending Ether from a wallet to the `Owner` contract, then from `Owner` to the `Receiver` contract.
- Different methods to retrieve a contract's balance.

### Files in the Project
- **Owner.sol**: A contract that holds two addresses (`receiverAddr` and `receiverPayableAddr`) and demonstrates Ether transfer functionality.
- **Receiver.sol**: A simple contract with a `receive()` function to accept Ether and a `getBalance()` function to check its balance.
- **deploy.js**: A Hardhat script to deploy both contracts to the Sepolia testnet.
- **interact.js**: A Hardhat script to interact with the deployed contracts, fund the `Owner` contract, and test Ether transfers.

## Code Explanation

### Owner.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Receiver.sol";

contract Owner {
    address public receiverAddr; // Address could not receive ETH
    address payable public receiverPayableAddr; // Address could receive ETH

    constructor(address _receiverAddr, address payable _receiverPayableAddr) {
        receiverAddr = _receiverAddr;
        receiverPayableAddr = _receiverPayableAddr;
    }

    function sendToPayable(uint amount) public {
        receiverPayableAddr.transfer(amount); // Chỉ address payable mới dùng được .transfer()
    }

    // function sendToAddress(uint amount) public {
    //     receiverAddr.transfer(amount); // address không dùng được .transfer()
    // }

    function sendWithCast(uint amount) public {
        payable(receiverAddr).transfer(amount); 
    }

    receive() external payable {}
}
```
- **License and Version**: Uses MIT license and Solidity version `^0.8.20`.
- **State Variables**:
  - `receiverAddr`: An `address` type that cannot directly send Ether.
  - `receiverPayableAddr`: An `address payable` type that can send Ether.
- **Constructor**: Initializes the two address variables with input parameters.
- **sendToPayable**: Transfers the specified `amount` of wei to `receiverPayableAddr` using `.transfer()`. Works because `receiverPayableAddr` is `address payable`.
- **sendToAddress**: Commented out; would fail to compile because `receiverAddr` (an `address`) cannot use `.transfer()`.
- **sendWithCast**: Attempts to cast `receiverAddr` to `address payable` and transfer Ether. Compiles but may fail at runtime if the target lacks a `receive()` function.
- **receive()**: Allows the `Owner` contract to receive Ether, enabling the wallet-to-Owner transfer.

### Receiver.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Receiver {
    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
```
- **License and Version**: Uses MIT license and Solidity version `^0.8.20`.
- **receive()**: A payable function that allows the contract to accept incoming Ether.
- **getBalance**: A view function that returns the contract’s balance using `address(this).balance`.

### deploy.js
```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Receiver = await ethers.getContractFactory("Receiver");
    const receiver = await Receiver.deploy();
    await receiver.waitForDeployment();
    console.log("Receiver deployed to:", await receiver.getAddress());

    const Owner = await ethers.getContractFactory("Owner");
    const owner = await Owner.deploy(
        await receiver.getAddress(),
        await receiver.getAddress()
    );
    await owner.waitForDeployment();
    console.log("Owner deployed to:", await owner.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```
- **Purpose**: Deploys the `Receiver` and `Owner` contracts to the Sepolia testnet.
- **Steps**:
  - Retrieves the deployer’s account using `ethers.getSigners()`.
  - Deploys the `Receiver` contract.
  - Deploys the `Owner` contract, passing the `Receiver` contract’s address as both `_receiverAddr` and `_receiverPayableAddr` for demonstration.
  - Logs the deployed contract addresses.
- **Error Handling**: Catches and logs errors, exiting with a non-zero code on failure.

### interact.js
```javascript
const { ethers } = require("hardhat");
require("dotenv").config();

const RECEIVER_ADDRESS = "0xc5557fA6bAC775Bc2Ea1f3b6Ce0B89919e22fA34";
const OWNER_ADDRESS = "0x7A71A025Df15D764Df5A3445ac387716F6B7ce95";

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("Please set PRIVATE_KEY in .env file");
    }

    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Using wallet:", wallet.address);

    const Receiver = await ethers.getContractFactory("Receiver", wallet);
    const receiver = Receiver.attach(RECEIVER_ADDRESS);

    const Owner = await ethers.getContractFactory("Owner", wallet);
    const owner = Owner.attach(OWNER_ADDRESS);

    console.log("Connected to contracts:");
    console.log("- Receiver:", RECEIVER_ADDRESS);
    console.log("- Owner:", OWNER_ADDRESS);

    const initialReceiverBalance = await provider.getBalance(RECEIVER_ADDRESS);
    const initialOwnerBalance = await provider.getBalance(OWNER_ADDRESS);
    const walletBalance = await provider.getBalance(wallet.address);

    console.log("\nInitial balances:");
    console.log("- Wallet:", ethers.formatEther(walletBalance), "ETH");
    console.log("- Receiver:", ethers.formatEther(initialReceiverBalance), "ETH");
    console.log("- Owner contract:", ethers.formatEther(initialOwnerBalance), "ETH");

    const fundAmount = ethers.parseEther("0.02");
    if (walletBalance < fundAmount) {
        throw new Error("Not enough ETH in wallet to fund contract");
    }

    console.log("\nFunding Owner contract with", ethers.formatEther(fundAmount), "ETH...");
    const fundTx = await wallet.sendTransaction({
        to: OWNER_ADDRESS,
        value: fundAmount
    });
    await fundTx.wait();

    console.log("Funded successfully!");
    console.log("New Owner contract balance:", 
        ethers.formatEther(await provider.getBalance(OWNER_ADDRESS)), "ETH");

    try {
        console.log("\nTesting sendToPayable...");
        const amount = ethers.parseEther("0.01");
        const tx = await owner.sendToPayable(amount);
        await tx.wait();

        const newBalance = await receiver.getBalance();
        console.log("Success! New receiver balance:", ethers.formatEther(newBalance), "ETH");
    } catch (error) {
        console.log("Error in sendToPayable:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```
- **Purpose**: Interacts with the deployed contracts, funds the `Owner` contract, and tests Ether transfers.
- **Steps**:
  - Loads environment variables (`PRIVATE_KEY` and `INFURA_API_KEY`) from a `.env` file.
  - Creates a wallet connected to the Sepolia testnet via Infura.
  - Attaches to the deployed `Receiver` and `Owner` contracts using their addresses.
  - Retrieves and logs initial balances for the wallet, `Receiver`, and `Owner` using `provider.getBalance`.
  - Funds the `Owner` contract with 0.02 ETH using `wallet.sendTransaction`.
  - Calls `sendToPayable` to transfer 0.01 ETH from `Owner` to `Receiver`.
  - Retrieves and logs the `Receiver`’s new balance using `receiver.getBalance`.
- **Error Handling**: Checks for valid private keys and sufficient wallet balance; catches and logs errors.

## Key Concepts: `address` vs `address payable`

### 1. `address`
- Represents a 20-byte Ethereum address (e.g., a wallet or contract address).
- **Cannot** directly send Ether using methods like `.transfer()` or `.send()`.
- Used for non-payable operations, such as storing addresses or calling non-payable functions.

### 2. `address payable`
- A subtype of `address` that can receive Ether.
- Supports `.transfer()` and `.send()` methods to send Ether.
- Required for any address that needs to receive Ether programmatically.

### 3. Type Casting
- You can cast an `address` to `address payable` using `payable(address)`.
- However, casting does not guarantee that the address can receive Ether. The receiving contract must have a `receive()` or `payable fallback` function; otherwise, the transaction will revert.

### 4. Key Observations
- In `Owner.sol`, the `sendToPayable` function successfully sends Ether to `receiverPayableAddr` because it is declared as `address payable` and the `Receiver` contract has a `receive()` function.
- The commented-out `sendToAddress` function would fail to compile because `receiverAddr` (an `address`) cannot use `.transfer()`.
- The `sendWithCast` function compiles but may fail at runtime if the casted address (e.g., `receiverAddr`) points to a contract without a `receive()` or `payable fallback` function.

## Ether Transfer Flow: Wallet → Owner → Receiver

The project demonstrates a two-step Ether transfer process:
1. **Wallet to Owner**:
   - The `interact.js` script uses the wallet to send 0.02 ETH to the `Owner` contract via `wallet.sendTransaction`.
   - The `Owner` contract accepts this Ether because it has a `receive()` function.
   - This step ensures the `Owner` contract has sufficient Ether for subsequent transfers.

2. **Owner to Receiver**:
   - The `Owner` contract uses its `sendToPayable` function to transfer 0.01 ETH to the `Receiver` contract using `receiverPayableAddr.transfer(amount)`.
   - The `Receiver` contract accepts this Ether because it has a `receive()` function.
   - The transfer is initiated by calling `sendToPayable` in the `interact.js` script.

This flow demonstrates a common pattern where a contract acts as an intermediary, receiving Ether from an external wallet and then forwarding it to another contract.

## Retrieving Contract Balance: Provider vs. Receiver

The `interact.js` script retrieves the `Receiver` contract's balance in two ways, highlighting different approaches:

1. **Using the Provider (`provider.getBalance`)**:
   - The script calls `provider.getBalance(RECEIVER_ADDRESS)` to query the blockchain directly for the `Receiver` contract's balance.
   - This method:
     - Accesses the balance stored on the blockchain for the contract's address.
     - Does not interact with the contract's code.
     - Is useful for external scripts or accounts to check any address's balance without requiring contract-specific functions.
     - Example output: `ethers.formatEther(initialReceiverBalance)` shows the balance in ETH.

2. **Using the Receiver Contract (`receiver.getBalance`)**:
   - The script calls the `getBalance` function on the `Receiver` contract (`receiver.getBalance()`).
   - This method:
     - Executes the contract's `getBalance` function, which returns `address(this).balance`.
     - Interacts with the contract's code, requiring a view function to be defined.
     - Is useful when the contract needs to provide its own balance internally or to other contracts.
     - Example output: `ethers.formatEther(newBalance)` shows the balance after the transfer.

### Key Differences
- **Source**: `provider.getBalance` queries the blockchain directly, while `receiver.getBalance` relies on the contract's logic.
- **Performance**: `provider.getBalance` is typically faster as it avoids contract execution.
- **Use Case**: Use `provider.getBalance` for external monitoring; use `getBalance` when the contract needs to access its own balance (e.g., for internal logic).
- **Consistency**: Both methods should return the same value for the `Receiver` contract, as `getBalance` simply returns the blockchain's balance for the contract's address.

## Prerequisites
- Node.js and npm installed.
- Hardhat installed (`npm install --save-dev hardhat`).
- A `.env` file with:
  - `PRIVATE_KEY`: Your wallet's private key.
  - `INFURA_API_KEY`: Your Infura API key for Sepolia testnet access.
- Sepolia testnet ETH for deploying and testing.

## Setup Instructions
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in the root directory with:
   ```env
   PRIVATE_KEY=<your-wallet-private-key>
   INFURA_API_KEY=<your-infura-api-key>
   ```

3. **Compile Contracts**:
   ```bash
   npx hardhat compile
   ```

4. **Deploy Contracts**:
   Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   Note the deployed contract addresses (`Receiver` and `Owner`) printed in the console.

5. **Update `interact.js`**:
   Replace `RECEIVER_ADDRESS` and `OWNER_ADDRESS` in `interact.js` with the addresses from the deployment step.

6. **Interact with Contracts**:
   Run the interaction script:
   ```bash
   npx hardhat run scripts/interact.js --network sepolia
   ```
   This script:
   - Connects to the deployed contracts.
   - Funds the `Owner` contract with 0.02 ETH from the wallet.
   - Tests the `sendToPayable` function to transfer 0.01 ETH from `Owner` to `Receiver`.
   - Logs the balances before and after the transfer using both provider and contract methods.

## Expected Output
- **Deployment**: The `deploy.js` script outputs the addresses of the deployed `Receiver` and `Owner` contracts.
- **Interaction**:
  - Initial balances of the wallet, `Receiver`, and `Owner` contracts (via `provider.getBalance`).
  - Confirmation of funding the `Owner` contract with 0.02 ETH.
  - Success message for the `sendToPayable` function, showing the updated `Receiver` balance (via `receiver.getBalance`).
  - Example: `New receiver balance: 0.01 ETH` after the transfer.

## Lessons Learned
1. **Use `address payable` for Ether Transfers**:
   Only `address payable` types can use `.transfer()` or `.send()`. Attempting to use these methods with a plain `address` will result in a compilation error.

2. **Casting Does Not Guarantee Success**:
   Casting an `address` to `address payable` allows compilation, but the transaction will revert if the target address cannot receive Ether (e.g., lacks a `receive()` function).

3. **Ether Transfer Flow**:
   The wallet funds the `Owner` contract, which then forwards Ether to the `Receiver` contract. This demonstrates a common pattern for intermediary contracts in Ethereum applications.

4. **Balance Retrieval**:
   Use `provider.getBalance` for external balance checks and contract functions like `getBalance` for internal logic or contract-specific access.

5. **Contract Design**:
   Contracts that need to receive Ether must implement a `receive()` or `payable fallback` function. Both `Owner` and `Receiver` contracts include a `receive()` function to accept Ether.

6. **Hardhat and Ethers.js**:
   - Hardhat simplifies contract deployment and interaction.
   - Ethers.js provides a clean API for interacting with contracts, such as attaching to existing contracts, sending transactions, and querying balances.

## Troubleshooting
- **Transaction Reverts**: Ensure the `Owner` contract has sufficient ETH and the `Receiver` contract has a `receive()` function.
- **Invalid Private Key**: Verify that the `PRIVATE_KEY` in `.env` is correct and corresponds to a wallet with Sepolia ETH.
- **Network Issues**: Confirm that the Infura API key is valid and the Sepolia testnet is accessible.

## Further Exploration
- Try uncommenting the `sendToAddress` function in `Owner.sol` and observe the compilation error.
- Test the `sendWithCast` function to see why it fails at runtime despite compiling.
- Modify the `Receiver` contract to remove the `receive()` function and observe the effect on Ether transfers.
- Experiment with different balance retrieval methods to compare their outputs.