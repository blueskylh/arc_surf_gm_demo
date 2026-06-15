// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Greeting {
    string public message;
    address public owner;

    event GreetingChanged(address indexed sender, string newMessage);

    constructor() {
        message = unicode"Hello Arc, this is Surf! 👋";
        owner = msg.sender;
    }

    function setGreeting(string memory _message) public {
        message = _message;
        emit GreetingChanged(msg.sender, _message);
    }

    function getGreeting() public view returns (string memory) {
        return message;
    }
}
