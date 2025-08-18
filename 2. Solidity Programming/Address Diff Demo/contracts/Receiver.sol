// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Receiver {
    //Fallback to receive    
    receive() external payable {}

    //check balance of contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
