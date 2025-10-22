// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TrustlessExpenseSplitter.sol";

contract ExpenseSplitterFactory {
    address[] public allSplitters;
    
    // Track which splitters each user is part of
    mapping(address => address[]) public userSplitters;
    
    // Track splitter metadata
    struct SplitterInfo {
        address splitterAddress;
        address creator;
        uint256 createdAt;
        address[] members;
    }
    
    mapping(address => SplitterInfo) public splitterInfo;

    event SplitterCreated(
        address indexed creator, 
        address indexed splitterAddress, 
        address[] members,
        uint256 timestamp
    );

    /**
     * @dev Creates a new TrustlessExpenseSplitter contract
     * @param _members Array of member addresses (creator will be added automatically)
     * @return The address of the newly deployed splitter
     */
    function createSplitter(address[] memory _members) public returns (address) {
        // SECURITY: Require creator to include themselves in the members list
        bool creatorIncluded = false;
        for (uint i = 0; i < _members.length; i++) {
            if (_members[i] == msg.sender) {
                creatorIncluded = true;
                break;
            }
        }
        require(creatorIncluded, "Creator must include their own address in the members list.");
        
        // Deploy new splitter
        TrustlessExpenseSplitter splitter = new TrustlessExpenseSplitter(_members);
        address splitterAddress = address(splitter);
        
        // Track the splitter
        allSplitters.push(splitterAddress);
        
        // Store metadata
        splitterInfo[splitterAddress] = SplitterInfo({
            splitterAddress: splitterAddress,
            creator: msg.sender,
            createdAt: block.timestamp,
            members: _members
        });
        
        // Track for each user
        for (uint i = 0; i < _members.length; i++) {
            userSplitters[_members[i]].push(splitterAddress);
        }
        
        emit SplitterCreated(msg.sender, splitterAddress, _members, block.timestamp);
        return splitterAddress;
    }

    /**
     * @dev Get all splitters (use with caution if list is large)
     */
    function getAllSplitters() public view returns (address[] memory) {
        return allSplitters;
    }
    
    /**
     * @dev Get all splitters a specific user is part of
     */
    function getUserSplitters(address _user) public view returns (address[] memory) {
        return userSplitters[_user];
    }
    
    /**
     * @dev Get the total number of splitters created
     */
    function getSplitterCount() public view returns (uint256) {
        return allSplitters.length;
    }
    
    /**
     * @dev Get splitter info by address
     */
    function getSplitterInfo(address _splitter) public view returns (
        address creator,
        uint256 createdAt,
        address[] memory members
    ) {
        SplitterInfo memory info = splitterInfo[_splitter];
        return (info.creator, info.createdAt, info.members);
    }
}