// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustlessExpenseSplitter
 * @dev A smart contract for groups to pool funds, propose shared expenses,
 * and automatically settle based on pre-approved rules.
 */
contract TrustlessExpenseSplitter {
    // --- State Variables ---

    // The group members who can interact with the contract
    address[] public members;

    mapping(address => bool) public isMember;
    
    // Mapping of member address to their current deposit/share
    mapping(address => uint256) public memberDeposits;
    
    // Tracks the total funds pooled in the contract
    uint256 public totalPooledFunds;
    
    // Unique ID counter for each expense proposal
    uint256 private nextExpenseId = 1;

    // Mapping of addresses to reserve deposit 
    mapping(address => uint256) public reservedDeposits;

    // A structure to hold details about an expense proposal
    struct Expense {
        uint256 id;                 // Unique ID of the expense
        address payable recipient;  // The address receiving the payment
        uint256 amount;             // The total amount to be paid
        address[] participants;     // The members splitting this specific cost
        mapping(address => uint256) shares; // Individual amount each participant owes
        mapping(address => bool) approvals; // Tracks which participant has approved
        uint256 requiredApprovals;  // Number of approvals needed (equal to participants.length)
        uint256 approvalCount;      // Current number of approvals received
        bool executed;              // True if the payment has been sent
        bool canBeExecuted;         // True if the expense can be executed
    }

    // Mapping from expense ID to the Expense structure
    mapping(uint256 => Expense) public expenses;

    // --- Events ---

    event MemberDeposited(address indexed member, uint256 amount);
    event ExpenseProposed(uint256 indexed id, address indexed proposer, address indexed recipient, uint256 amount);
    event ExpenseApproved(uint256 indexed id, address indexed approver);
    event ExpenseExecuted(uint256 indexed id, address indexed recipient, uint256 amount);
    event SettlementComplete(uint256 totalRefunded);
    event ExpenseStatusUpdated(uint256 indexed expenseId, uint256 approvalCount, uint256 requiredApprovals);
    event MemberBalanceUpdated(address indexed member, uint256 newBalance);
    event ContractStateUpdated(uint256 totalPooledFunds, uint256 contractBalance);

    // --- Modifiers ---

    modifier onlyMember() {
        require(isMember[msg.sender], "Not a group member.");
        _;
    }

    // --- Constructor ---

    /**
     * @dev Initializes the contract with the initial group members including the contract creator.
     * @param _members The list of addresses for the initial group members.
     */
    constructor(address[] memory _members) {
        require(_members.length > 0, "Group must have at least one member.");

        for (uint i = 0; i < _members.length; i++) {
            require(_members[i] != address(0), "Zero address not allowed as a member.");
            require(!isMember[_members[i]], "Duplicate member detected.");
            
            members.push(_members[i]);
            isMember[_members[i]] = true; 
            memberDeposits[_members[i]] = 0;
        }
        
        totalPooledFunds = 0;
    }

    // --- Core Functions ---

    /**
     * @dev Allows members to deposit funds into the shared pool.
     */
    function deposit() public payable onlyMember {
        require(msg.value > 0, "Deposit must be greater than zero.");
        memberDeposits[msg.sender] += msg.value;
        totalPooledFunds += msg.value;
        
        emit MemberDeposited(msg.sender, msg.value);
        emit MemberBalanceUpdated(msg.sender, memberDeposits[msg.sender]);
        emit ContractStateUpdated(totalPooledFunds, address(this).balance);
    }

    /**
     * @dev Proposes a new shared expense requiring multi-party approval.
     * @param _recipient The address that will receive the payment (e.g., a vendor).
     * @param _amount The total cost of the expense in Wei.
     * @param _participants The members who will split this specific cost.
     * @param _shares The individual share amount each participant owes. Must sum up to _amount.
     */
    function proposeExpense(
        address payable _recipient,
        uint256 _amount,
        address[] memory _participants,
        uint256[] memory _shares
    ) public onlyMember {
        require(_recipient != address(0), "Recipient cannot be zero address."); // SECURITY FIX
        require(_amount > 0, "Amount must be greater than zero.");
        require(_participants.length > 0, "Expense must have at least one participant.");
        require(_participants.length == _shares.length, "Participants and shares must have the same length.");

        uint256 totalShares = 0;
        for (uint i = 0; i < _participants.length; i++) {
            require(isMember[_participants[i]], "All participants must be current group members.");
            // require(memberDeposits[_participants[i]] >= _shares[i], "A participant doesn't have enough funds to pay their share.");
            totalShares += _shares[i];
        }

        require(totalShares == _amount, "Individual shares must sum up to the total amount.");
        require(totalPooledFunds >= _amount, "Insufficient funds in the shared pool.");

        // --- Create Expense Proposal ---
        uint256 newId = nextExpenseId++;
        Expense storage newExpense = expenses[newId];

        newExpense.id = newId;
        newExpense.recipient = _recipient;
        newExpense.amount = _amount;
        newExpense.participants = _participants;
        newExpense.requiredApprovals = _participants.length;
        newExpense.approvalCount = 0;
        newExpense.executed = false;
        newExpense.canBeExecuted = false;

        // Populate shares mapping
        for (uint i = 0; i < _participants.length; i++) {
            newExpense.shares[_participants[i]] = _shares[i];
        }

        emit ExpenseProposed(newId, msg.sender, _recipient, _amount);
    }

    /**
     * @dev Allows a participant to approve an expense.
     * @param _expenseId The ID of the expense to approve.
     */
    function approveExpense(uint256 _expenseId) public onlyMember {
        Expense storage expense = expenses[_expenseId];

        require(expense.id != 0, "Expense does not exist.");
        require(!expense.executed, "Expense has already been executed.");
        require(expense.approvals[msg.sender] == false, "Already approved this expense.");

        bool isParticipant = isApproverExpenseParticipant(msg.sender, expense.participants);
        require(isParticipant, "Only participants can approve this expense.");

        // Reserve the participant's deposit
        uint256 participantShare = expense.shares[msg.sender];
        require(memberDeposits[msg.sender] - reservedDeposits[msg.sender] >= participantShare, "Insufficient balance to approve this expense.");
        reservedDeposits[msg.sender] += participantShare;   


        // --- Approval Logic ---
        expense.approvals[msg.sender] = true;
        expense.approvalCount++;

        emit ExpenseApproved(_expenseId, msg.sender);
        emit ExpenseStatusUpdated(_expenseId, expense.approvalCount, expense.requiredApprovals);

        // --- Execution Check ---
        if (expense.approvalCount == expense.requiredApprovals) {
            expense.canBeExecuted = true;
            _executeExpense(_expenseId);
        }
    }

    /**
     * @dev function to execute the payment and update member balances.
     * @param _expenseId The ID of the expense to execute.
     */
    function _executeExpense(uint256 _expenseId) public onlyMember(){
        Expense storage expense = expenses[_expenseId];

        // Ensure transaction is fully approved and not yet executed
        require(expense.canBeExecuted, "Expense do not meet requirements for being executed");
        require(totalPooledFunds >= expense.amount, "Insufficient funds for execution.");

        // 1. Update individual member balances with underflow protection
        for (uint i = 0; i < expense.participants.length; i++) {
            address participant = expense.participants[i];
            uint256 share = expense.shares[participant];

            require(memberDeposits[participant] >= share, "Participant has insufficient deposit balance.");
            
            memberDeposits[participant] -= share;
            reservedDeposits[participant] -= share;
            
            emit MemberBalanceUpdated(participant, memberDeposits[participant]);
        }

        // 2. Update the total pooled funds
        totalPooledFunds -= expense.amount;
        expense.executed = true;
        expense.canBeExecuted = false;

        (bool success, ) = expense.recipient.call{value: expense.amount}("");
        require(success, "Payment execution failed.");

        emit ExpenseExecuted(_expenseId, expense.recipient, expense.amount);
        emit ContractStateUpdated(totalPooledFunds, address(this).balance);
    }

    /**
     * @dev Function to withdraw money for a single member
     */
    function withdrawMoney() public onlyMember {
        address member = msg.sender;
        uint256 availableTowithdraw = memberDeposits[member] - reservedDeposits[member];

        require(availableTowithdraw > 0, "No available funds to withdraw.");

        (bool success, ) = member.call{value: availableTowithdraw}("");
        require(success, "Withdraw failed for a member.");
        
        memberDeposits[member] -= availableTowithdraw;
        emit MemberBalanceUpdated(member, memberDeposits[member]);
    }

    /**
     * @dev Initiates the final settlement, refunding all remaining pooled funds
     * to members based on their final `memberDeposits` balance.
     * Can only be called when all expenses are settled or the trip ends.
     */
    function finalSettlement() public onlyMember {
        uint256 totalRefunded = 0;

        // Iterate over all members to refund their remaining share
        for (uint i = 0; i < members.length; i++) {
            address payable member = payable(members[i]);
            uint256 refundAmount = memberDeposits[member];

            if (refundAmount > 0) {
                (bool success, ) = member.call{value: refundAmount}("");
                require(success, "Refund failed for a member.");

                // Update internal state
                memberDeposits[member] = 0;
                totalRefunded += refundAmount;
                
                emit MemberBalanceUpdated(member, 0);
            }
        }

        // Final check: the remaining balance on the contract should now be zero or negligible
        require(address(this).balance < 1 wei, "Not all funds were refunded.");
        totalPooledFunds = 0;

        emit SettlementComplete(totalRefunded);
    }

    /**
     * @dev Get detailed information about a specific expense for DApp display
     * @param _expenseId The ID of the expense to query
     * @return recipient The address receiving the payment
     * @return amount The total expense amount
     * @return participants Array of participant addresses
     * @return approvalCount Current number of approvals
     * @return requiredApprovals Total approvals needed
     * @return executed Whether the expense has been executed
     */
    function getExpenseDetails(uint256 _expenseId) external view returns (
        address recipient,
        uint256 amount,
        address[] memory participants,
        uint256 approvalCount,
        uint256 requiredApprovals,
        bool executed
    ) {
        Expense storage expense = expenses[_expenseId];
        require(expense.id != 0, "Expense does not exist.");
        
        return (
            expense.recipient,
            expense.amount,
            expense.participants,
            expense.approvalCount,
            expense.requiredApprovals,
            expense.executed
        );
    }

    /**
     * @dev Get participant's share amount for a specific expense
     * @param _expenseId The expense ID
     * @param _participant The participant's address
     * @return The share amount for the participant
     */
    function getParticipantShare(uint256 _expenseId, address _participant) external view returns (uint256) {
        return expenses[_expenseId].shares[_participant];
    }

    /**
     * @dev Check if a participant has approved a specific expense
     * @param _expenseId The expense ID
     * @param _participant The participant's address
     * @return Whether the participant has approved
     */
    function hasApproved(uint256 _expenseId, address _participant) external view returns (bool) {
        return expenses[_expenseId].approvals[_participant];
    }

    /**
     * @dev Get all group members for DApp display
     * @return Array of all member addresses
     */
    function getAllMembers() external view returns (address[] memory) {
        return members;
    }

    /**
     * @dev Get member's current deposit balance
     * @param _member The member's address
     * @return The current deposit balance
     */
    function getMemberBalance(address _member) external view returns (uint256) {
        return memberDeposits[_member];
    }

    /**
     * @dev Get contract's current balance for verification
     * @return The contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get the next expense ID that will be assigned
     * @return The next expense ID
     */
    function getNextExpenseId() external view returns (uint256) {
        return nextExpenseId;
    }

    // --- Utility Function ---

    /**
     * @dev Fallback function to accept Ether deposits if called without a function signature.
     */
    receive() external payable {
        deposit();
    }

    /**
     * @dev Checks if the approver of an expense is a participant of that expense.
     * @param _approver The approver of the expense
     * @param _expenseParticipants The participants of the expense
     */
    function isApproverExpenseParticipant(address _approver, address[] storage _expenseParticipants) internal view returns (bool) {
        for (uint i = 0; i < _expenseParticipants.length; i++) {
            if (_expenseParticipants[i] == _approver) {
                return true;
                
            }
        }
        return false;
    }

    /**
    * @dev Get member's reserved deposit amount
    * @param _member The member's address
    * @return The reserved deposit amount
    */
    function getReservedDeposits(address _member) external view returns (uint256) {
        return reservedDeposits[_member];
    }

    /**
    * @dev Get member's available balance (deposit minus reserved)
    * @param _member The member's address
    * @return The available balance
    */
    function getAvailableBalance(address _member) external view returns (uint256) {
        return memberDeposits[_member] - reservedDeposits[_member];
    }
}
