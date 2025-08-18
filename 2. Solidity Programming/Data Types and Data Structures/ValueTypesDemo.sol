// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ValueTypesDemo {
    //1. Boolean
    bool public isActive = true;
    function toggleActive() public {
        isActive = !isActive;
    }

    //2. Unsigned int
    uint8 public u8 = 255; // 0 ~ 2^8-1 = 255
    uint16 public u16 = 65535; // 0 ~ 2^16-1 = 65535
    uint256 public u256 = 1_000_000;

    function addUint() public view returns (uint256) {
        //must cast
        return uint256(u8) + uint256(u16) + u256;
    }

    //3. Signed int
    int8 public i8 = -128; // -128 ~ 127
    int256 public i256 = -500;
    
    function absValue() public view returns (uint256) {
        if (i256 < 0){
            return uint256(-i256);
        }
        return uint256(i256);
    }

    //4. string
    string public message = "Hello Solidity";
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }

    //5. bytes
    bytes1 public b1 = 0x65;   // 'e'
    bytes32 public b32 = keccak256(abi.encodePacked("Hello"));

    function getFirstByte() public view returns (bytes1) {
        return b32[0]; // lấy byte đầu tiên trong hash
    }

    //6. address
    address public owner = msg.sender;

    function updateOwner(address newOwner) public {
        require(msg.sender == owner, "Only owner");
        owner = newOwner;
    }

    //non-payable -> only store
    address public nonPayableAddr;

    //address payable -> store and transfer
    address payable public payableAddr;

    //update non-payable addr (only store, cannot send ether)
    function setNonPayableAddr(address _addr) public {
        nonPayableAddr = _addr;
    }

    //update payable addr (store and transfer)
    function setPayableAddr(address payable _addr) public {
        payableAddr = _addr;
    }

    //Send ether to payableAddr
    function sendEther() public payable {
        require(msg.value > 0, "Must send Ether first");
        require(payableAddr != address(0), "Payable address not set");

        // Method 1 : transfer (reverts if fails)
        payableAddr.transfer(msg.value);

        // Method 2 : send (returns true/false)
        // bool success = payableAddr.send(msg.value);
        // require(success, "Send failed");

        // Method 3 : call (gas customizable, most used)
        // (bool ok, ) = payableAddr.call{value: msg.value}("");
        // require(ok, "Call failed");
    }

    // Function to receive ether
    receive() external payable {}

    // Get balance of contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}