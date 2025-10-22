# TODO: Complete These Steps Before Running

## ⚠️ CRITICAL: Update Contract Configuration

### 1. Deploy Your Smart Contract
- [ ] Open Remix IDE (https://remix.ethereum.org/)
- [ ] Copy `BlockchainEngineeringProject/TrustlessExpenseSplitter.sol`
- [ ] Compile with Solidity 0.8.0+
- [ ] Switch MetaMask to Sepolia testnet
- [ ] Deploy contract with initial members array
  - Example: `["0xYourAddress", "0xMember2Address"]`
- [ ] Copy the deployed contract address
- [ ] Save transaction hash for reference

### 2. Get Contract ABI
- [ ] In Remix, go to "Solidity Compiler" tab
- [ ] Click "Compilation Details" button
- [ ] Find and copy the entire ABI array
- [ ] Keep it ready for next step

### 3. Update src/contracts/config.js
```javascript
// REPLACE THIS:
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// WITH YOUR DEPLOYED ADDRESS:
export const CONTRACT_ADDRESS = "0xYourActualContractAddress";

// AND REPLACE THE EMPTY ABI ARRAY WITH YOUR ACTUAL ABI
export const CONTRACT_ABI = [
  // Paste your entire ABI here from Remix
];
```

### 4. Install Dependencies
```bash
cd react_test/react_test_proj
npm install
```

If you get errors, install packages individually:
```bash
npm install react-router-dom
npm install ethers
npm install web3
```

### 5. Run the DApp
```bash
npm start
```

## 🎯 Testing Checklist

### Initial Testing
- [ ] DApp opens in browser (http://localhost:3000)
- [ ] MetaMask extension is installed
- [ ] Connected to Sepolia testnet
- [ ] Have test ETH in wallet (get from faucet)
- [ ] Can connect wallet successfully
- [ ] Shows correct member status

### Function Testing
- [ ] Deposit funds works
- [ ] Balance updates correctly
- [ ] Can propose expense
- [ ] Can approve expense
- [ ] Expense executes when fully approved
- [ ] Can withdraw available funds
- [ ] History shows all transactions
- [ ] Reserved funds prevent withdrawal

## 📝 Notes

### Get Sepolia Test ETH
- Sepolia Faucet: https://sepoliafaucet.com/
- Alchemy Faucet: https://sepoliafaucet.com/
- Request 0.1 ETH minimum for testing

### Verify Deployment
- Check on Sepolia Etherscan: https://sepolia.etherscan.io/
- Verify your contract address appears
- Check initial members are set correctly

### GitHub Pages (Optional)
- [ ] Update package.json homepage
- [ ] Run `npm run deploy`
- [ ] Enable GitHub Pages in repo settings
- [ ] Access at https://yourusername.github.io/repo-name

## 🚨 If You Encounter Issues

1. **"Cannot read properties of null"**
   - Check if CONTRACT_ADDRESS is updated
   - Verify ABI is correctly pasted

2. **"MetaMask not detected"**
   - Install MetaMask extension
   - Refresh the page

3. **"Wrong network"**
   - Switch MetaMask to Sepolia
   - Reload DApp

4. **"Transaction failed"**
   - Check you have enough test ETH
   - Verify you're a contract member
   - Check gas settings

## 📚 Documentation

- Contract: `BlockchainEngineeringProject/TrustlessExpenseSplitter.sol`
- Setup Guide: `SETUP_GUIDE.md`
- Full README: Check main README for detailed docs

---

**IMPORTANT**: This DApp will NOT work until you complete steps 1-3 above!
