# How to Get Your Contract ABI

## Step-by-Step Guide

### Using Remix IDE

1. **Compile Your Contract**
   - Open Remix IDE: https://remix.ethereum.org/
   - Create a new file: `TrustlessExpenseSplitter.sol`
   - Paste your contract code
   - Go to "Solidity Compiler" tab (left sidebar)
   - Click "Compile TrustlessExpenseSplitter.sol"
   - Wait for green checkmark

2. **Get the ABI**
   - Click "Compilation Details" button (below Compile button)
   - Scroll down to find "ABI" section
   - Click the copy icon next to ABI
   - This copies the entire ABI array to clipboard

3. **Paste into config.js**
   ```javascript
   // src/contracts/config.js
   export const CONTRACT_ABI = [
     // PASTE HERE - it will look like:
     {
       "inputs": [...],
       "stateMutability": "...",
       "type": "..."
     },
     {
       "inputs": [...],
       ...
     }
     // ... many more objects
   ];
   ```

### ABI Structure

The ABI is an array of objects that describe:
- **Constructor**: How to deploy the contract
- **Functions**: All public/external functions
- **Events**: All contract events
- **State Variables**: Public variables

### Important Functions in Your ABI

Your contract should have these functions:
- ✅ `deposit()` - Deposit ETH
- ✅ `withdrawMoney()` - Withdraw funds
- ✅ `proposeExpense()` - Create expense
- ✅ `approveExpense()` - Approve expense
- ✅ `_executeExpense()` - Execute expense
- ✅ `getExpenseDetails()` - View function
- ✅ `getAllMembers()` - View function
- ✅ `isMember()` - View function
- ✅ `getMemberBalance()` - View function

### Verification

After pasting ABI, check:
```javascript
console.log(CONTRACT_ABI.length); // Should be > 0
console.log(CONTRACT_ABI[0]); // Should show an object
```

### Common Mistakes

❌ **Don't copy partial ABI**
   - Copy the ENTIRE array from [ to ]

❌ **Don't add quotes around ABI**
   - It's already an array, no need for quotes

❌ **Don't modify the ABI**
   - Use exactly as copied from Remix

✅ **Correct format:**
```javascript
export const CONTRACT_ABI = [{...}, {...}, ...];
```

### Alternative: Using Hardhat/Truffle

If you compiled with Hardhat/Truffle:
```bash
# ABI location:
# Hardhat: artifacts/contracts/TrustlessExpenseSplitter.sol/TrustlessExpenseSplitter.json
# Truffle: build/contracts/TrustlessExpenseSplitter.json

# Extract ABI:
cat artifacts/.../TrustlessExpenseSplitter.json | jq '.abi'
```

### Need Help?

If ABI doesn't work:
1. Recompile contract in Remix
2. Check for compilation errors
3. Verify Solidity version matches
4. Copy ABI again
5. Check browser console for errors
