# Hardhat Project: Deploy and Interact with HelloWorld Smart Contract on Sepolia

This project demonstrates how to deploy a simple "HelloWorld" smart contract to the Sepolia testnet using Hardhat, and then interact with it (read and update data) using Ethers.js. The contract stores a message string that can be retrieved or updated.

The project includes:
- **HelloWorld.sol**: The Solidity smart contract.
- **deploy.js**: A script to deploy the contract using Hardhat.
- **interact.js**: A script to interact with the deployed contract using Ethers.js.

This README explains the code structure, each component's purpose, and the overall flow in detail to help you understand Ethereum development clearly.

## Prerequisites

Before running this project, ensure you have:
- Node.js (v14 or higher) installed.
- An Ethereum wallet with Sepolia testnet ETH (for gas fees). You can get test ETH from faucets like [Sepolia Faucet](https://sepoliafaucet.com/).
- An Infura account (or another RPC provider) for connecting to Sepolia. Sign up at [Infura](https://infura.io/) to get an API key.
- A `.env` file in the project root with:
  ```
  INFURA_API_KEY=your_infura_api_key_here
  PRIVATE_KEY=your_wallet_private_key_here  # Never commit this to Git!
  ```
- Hardhat installed (see Installation below).

## Installation

1. Clone or create the project directory.
2. Install dependencies:
   ```
   npm init -y
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv
   npx hardhat init  # Choose "JavaScript project" if prompted
   ```
3. Place the provided files (`deploy.js`, `interact.js`, `HelloWorld.sol`) in the appropriate directories:
   - `HelloWorld.sol` in `./contracts/`.
   - `deploy.js` and `interact.js` in `./scripts/`.
4. Compile the contract:
   ```
   npx hardhat compile
   ```

## Deployment

To deploy the contract:
```
npx hardhat run scripts/deploy.js --network sepolia
```
- This uses Hardhat's configured network (add Sepolia config to `hardhat.config.js` if needed; see Code Explanation below).
- Output: The contract address, e.g., "HelloWorld deployed to: 0x9c49C16A41E4685ac5099521C930255297133C45".

Update `CONTRACT_ADDRESS` in `interact.js` with this address after deployment.

## Interaction

To read and update the contract:
```
node scripts/interact.js
```
- Output: Current message, transaction confirmation, and updated message.

## Code Explanation

### 1. HelloWorld.sol (Solidity Contract)

This is the smart contract written in Solidity (version 0.8.0 or higher). It demonstrates basic state management on the blockchain.

- **SPDX-License-Identifier**: Specifies the license (MIT) for open-source compliance.
- **pragma solidity ^0.8.0;**: Declares the Solidity compiler version to ensure compatibility.
- **contract HelloWorld { ... }**: Defines the contract named "HelloWorld".
  - **string private message;**: A private state variable to store the message. "Private" means it's not directly accessible from outside the contract, but can be read via public functions.
  - **constructor(string memory initMessage) { ... }**: The constructor runs once during deployment. It initializes the `message` with a value passed during deployment (e.g., "Hello từ constructor!").
  - **function getMessage() public view returns (string memory) { ... }**: A public read-only function to retrieve the current message. "View" means it doesn't modify state and costs no gas when called off-chain.
  - **function setMessage(string memory newMessage) public { ... }**: A public function to update the message. This modifies state, so it requires a transaction (and gas fees).

**Purpose**: This contract acts as a simple decentralized storage for a string, showcasing constructor initialization, getters, and setters in Solidity.

### 2. deploy.js (Deployment Script using Hardhat)

This script deploys the contract to Sepolia using Hardhat, which simplifies Ethereum development with local testing and deployment tools.

- **const { ethers } = require("hardhat");**: Imports Hardhat's ethers.js integration for contract interaction.
- **async function main() { ... }**: The main asynchronous function for deployment.
  - **const HelloWorld = await ethers.getContractFactory("HelloWorld");**: Gets a factory for the "HelloWorld" contract. This compiles the contract (if needed) and prepares it for deployment.
  - **const hello = await HelloWorld.deploy("Hello từ constructor!");**: Deploys the contract, passing the initial message to the constructor. This sends a transaction to create the contract on the blockchain.
  - **await hello.waitForDeployment();**: Waits for the deployment transaction to be mined (confirmed on the blockchain).
  - **console.log("HelloWorld deployed to:", await hello.getAddress());**: Logs the deployed contract's address.
- **main().catch((error) => { ... });**: Runs the main function and handles errors, setting process exit code to 1 on failure.

**hardhat.config.js** (not provided, but implied):
- You need to configure networks in this file, e.g.:
  ```
  require("@nomicfoundation/hardhat-toolbox");
  require("dotenv").config();

  module.exports = {
    solidity: "0.8.0",
    networks: {
      sepolia: {
        url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: [process.env.PRIVATE_KEY],
      },
    },
  };
  ```
  - **solidity**: Specifies the compiler version.
  - **networks.sepolia**: Defines the Sepolia network with RPC URL and private key for signing transactions.

**Purpose**: Automates contract deployment, handling compilation, transaction signing, and confirmation.

### 3. interact.js (Interaction Script using Ethers.js)

This script connects to the deployed contract, reads data, and sends a transaction to update it. It uses Ethers.js v6 for blockchain interaction.

- **const { ethers } = require("ethers");**: Imports Ethers.js for Ethereum interactions.
- **require("dotenv").config();**: Loads environment variables from `.env`.
- **const CONTRACT_ADDRESS = "...";**: Hardcoded address of the deployed contract (update after deployment).
- **const ABI = [ ... ];**: The Application Binary Interface (ABI) – a JSON array describing the contract's functions. This tells Ethers.js how to encode/decode calls. Only includes the functions we use: `getMessage` and `setMessage`.
- **async function main() { ... }**: The main asynchronous function.
  - **const provider = new ethers.JsonRpcProvider(...);**: Creates a provider to connect to Sepolia via Infura's RPC URL.
  - **const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);**: Connects your wallet using the private key and provider. This allows signing transactions.
  - **const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);**: Creates a contract instance, linking the address, ABI, and signer (wallet).
  - **let message = await contract.getMessage();**: Calls the `getMessage` function (read-only, no gas needed).
  - **console.log("Current message:", message);**: Logs the result.
  - **let tx = await contract.setMessage("Hello từ Ethers v6!");**: Sends a transaction to update the message. This requires gas and signing.
  - **await tx.wait();**: Waits for the transaction to be mined.
  - **message = await contract.getMessage();**: Reads the updated message.
  - **console.log("Updated message:", message);**: Logs the new result.
- **main().catch((err) => { ... });**: Runs the main function and handles errors.

**Purpose**: Shows how to interact with a deployed contract off-chain, including reading state and sending transactions.

## Flow Explanation

Here's the step-by-step flow of the entire project, from development to execution:

1. **Contract Development**:
   - Write `HelloWorld.sol`: Define the contract logic (state variable, constructor, functions).
   - Compile with Hardhat: `npx hardhat compile` generates artifacts (ABI, bytecode) needed for deployment.

2. **Deployment Flow** (`deploy.js`):
   - Hardhat loads the config (network, accounts).
   - Get contract factory → Deploy with constructor args → Send deployment transaction.
   - Wait for confirmation → Get and log the contract address.
   - **Blockchain Interaction**: The deployment creates a new contract instance on Sepolia. The constructor sets the initial message. Gas is paid from your wallet.

3. **Interaction Flow** (`interact.js`):
   - Load env vars (API key, private key).
   - Connect to network (provider) → Attach wallet (signer).
   - Create contract instance with address and ABI.
   - Read: Call `getMessage` (query the blockchain state without a transaction).
   - Update: Call `setMessage` → Sign and send transaction → Wait for mining.
   - Read again: Verify the update.
   - **Blockchain Interaction**: Reads are free (via RPC calls). Updates create transactions that modify state, requiring gas and confirmation (1-2 minutes on Sepolia).

4. **Overall Learning Points**:
   - **Hardhat**: For local dev, testing, and deployment scripting.
   - **Ethers.js**: For programmatic interaction (providers for connection, wallets for signing, contracts for calls).
   - **Blockchain Concepts**: Immutability (deployed code can't change), gas fees for writes, RPC for reads/writes.
   - **Security**: Never expose private keys. Use testnets like Sepolia for practice.
   - **Extensions**: Add tests in Hardhat, use more complex contracts, or integrate with frontends (e.g., React + Web3.js).

If you encounter errors (e.g., insufficient funds), check your wallet balance and `.env` file. For more, refer to [Hardhat Docs](https://hardhat.org/) or [Ethers.js Docs](https://docs.ethers.org/v6/).