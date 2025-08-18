//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Receiver.sol";

contract Owner {
    address public receiverAddr; //Address could not receive ETH
    address payable public receiverPayableAddr; //Address could receive ETH
    constructor(address _receiverAddr, address payable _receiverPayableAddr) {
        receiverAddr = _receiverAddr;
        receiverPayableAddr = _receiverPayableAddr;
    }

    // success to compile and send
    function sendToPayable(uint amount) public {
        receiverPayableAddr.transfer(amount); // Chỉ address payable mới dùng được .transfer()
    }

    // fail because receiverAddr is not payable
    // function sendToAddress(uint amount) public {
    //     receiverAddr.transfer(amount); // address không dùng được .transfer()
    // }

    // success to compile but fail to send
    //Cast address → address payable only allow to .transfer() / .send()
    //The ability to receive ETH depends on the receiving contract's code, not on how you cast it.
    //If the receiving contract is non-payable, the transaction will revert even if you cast it.
    function sendWithCast(uint amount) public {
        payable(receiverAddr).transfer(amount); 
    }
    //fallback to receive
    receive() external payable {}
}