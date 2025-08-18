# Data Types and Data Structures in Solidity
Welcome to this comprehensive lesson on **Data Types and Data Structures in Solidity**! This tutorial is designed for beginners and intermediate developers learning Solidity for Ethereum smart contract development. By the end, you'll understand how to use Solidity's data types and structures effectively to build efficient and secure smart contracts.

If you're new to Solidity, you can test the code examples using tools like [Remix IDE](https://remix.ethereum.org/) or [Hardhat](https://hardhat.org/).
---

## Introduction
In solidity, **data types** define the kind of values can hold such as numbers, booleans, or Etherum addresses. **Data Structures** organize collections of data such as arrays, structs and mappings to model complex relationships.

These concepts are critical in smart contract development because : 
- Solidity is a **statically-typed** language, requiring explicit type declarations to ensure type safety and prevent runtime errors.
- The choice of data types and structures impacts **gas costs**, as Etherum charges fees for computation and storage.
- Proper data handling ensures **security**, preventing vulnerabilities like integer overflows or reentrancy attacks.
- They enable developers to model real-world logic (e.g., voting systems, registries) in a decentralized context.
  
This tutorial covers value types, reference types, data locations, practical examples, best practices, exercises, and interview questions to solidify your understanding.
---

## Value Types
Value types are primitive types passed by value (a copy is made when assigned or passed to functions). They are stored directly in variable and include: 
- **`uint`**: Unsigned integers (non-negative). Ranges from `uint8` (0 to 255) to `uint256` (0 to ~10^77, default).
- **`int`**: Signed integers (positive or negative). Ranges from `int8` (-128 to 127) to `int256`.
- **`bool`**: Boolean values (`true` or `false`)
- **`string`**: Dynamic UTF-8 encoded strings, treated as text.
- **`enum`**: User-defined types with a finite set of constant values.
- **`bytes`**: Fixed-size byte arrays (bytes1 to bytes32). Used for raw data or hashes.
- **`address`**: is used to store Ethereum addresses.
  #### 1. Address Definition
  - The `address` type in Solidity is used to store **Ethereum addresses**.  
  - An Ethereum address is **20 bytes (160 bits)**.  
  - It can represent either:  
    - An **Externally Owned Account (EOA)** → controlled by a private key.  
    - A **Contract Account** → controlled by a smart contract’s code.  

   #### 2. Types of `address`

   There are two variants:  

   #### **`address` (non-payable)**
    - Can only store an Ethereum address.  
    - Cannot receive Ether directly.  
    - Commonly used for storing contract addresses or user accounts where Ether transfer is not required.  

   #### **`address payable`**
    - Extends `address` with additional functionality.  
    - Can **receive and send Ether**.  
    - Supports functions like `.transfer()`, `.send()`, and `.call{value: ...}()`.  

   #### 3. Properties and Functions

    - `balance` → Returns the amount of Ether (in wei) stored at the address.  
    - `code` → Returns the bytecode of the contract at the address (empty for EOAs).  
    - `codehash` → Returns the hash of the code at the address.  
    - Only for `address payable`:  
      - `.transfer(amount)` → Sends Ether and reverts if it fails.  
      - `.send(amount)` → Sends Ether and returns a boolean status.  
      - `.call{value: amount}("")` → Low-level call, flexible and commonly used for Ether transfer.  

   #### 4. Conversion

      An `address` can be **explicitly converted** to `address payable` if needed:
      
      ```solidity
      address addr = 0x1234567890123456789012345678901234567890;
      address payable wallet = payable(addr);

