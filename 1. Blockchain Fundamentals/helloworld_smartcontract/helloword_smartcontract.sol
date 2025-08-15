// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9;

contract Helloworld {
    //State variable
    string private message;

    //Event for client (frontend / indexer) catch log
    event MessageUpdated(address indexed updater, string newMessage);

    //Constructor
    constructor(string memory _initMessage) {
        message = _initMessage;
    }

    //View Function: readonly, not cost gas when call off-chain
    function getMessage() external view returns (string memory) {
        return message;
    }

    //
    function setMessage(string calldata _newMessage) external {
        message = _newMessage;
        emit MessageUpdated(msg.sender, _newMessage);
    } 
}