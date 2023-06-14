// SPDX-License-Identifier: MIT
//pragma comes first
pragma solidity ^0.8.8;
//then come the import statements
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
//then come the error codes- made a change, added contract name in front of error code
error FundMe__NotOwner();
error FundMe__SpendMoreETH();
error FundMe__withdrawCallFailed();

//libraries,then interfaces, then contracts
//natspec comments
/**
 * @title a simple FundMe contract
 * @author Ammar tha Boss
 * @notice teaches us how funding contracts work
 * @dev you can out some comments for the dev here
 */
//you can use natspec comments anywhere you wish to use them.
contract FundMe {
    //type declarations
    using PriceConverter for uint256;
    AggregatorV3Interface private s_priceFeed;

    //state variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    //then come events and modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    //then come functions
    // in order:
    // constructor,reciever,fallback,external,public,internal,private,view/pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // fallback() external payable {
    //     fund();
    // }

    // receive() external payable {
    //     fund();
    // }
    //we do not need these functions right now, they were only used for as a demo
    function fund() public payable {
        if (!(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD))
            revert FundMe__SpendMoreETH();
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) revert FundMe__withdrawCallFailed();
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory donators = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < donators.length;
            funderIndex++
        ) {
            address funder = donators[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) revert FundMe__withdrawCallFailed();
    }

    //let's add some get functions for our private variables
    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 funderIndex) public view returns (address) {
        return s_funders[funderIndex];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
