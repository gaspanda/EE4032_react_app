# Trustless Expense Splitter - Setup Guide

## Quick Start Checklist

- [ ] Deploy smart contract to testnet (Sepolia)
- [ ] Get contract ABI from Remix
- [ ] Update CONTRACT_ADDRESS in config.js
- [ ] Update CONTRACT_ABI in config.js
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Connect MetaMask
- [ ] Start using the DApp!

## Detailed Setup Instructions

See main README.md for complete documentation.

### 1. Deploy Contract

```solidity
// In Remix, deploy with members array:
["0xYourAddress", "0xMember2", "0xMember3"]
```

### 2. Update config.js

```javascript
// src/contracts/config.js
export const CONTRACT_ADDRESS = "0x..."; // Your deployed address
export const CONTRACT_ABI = [...];        // Your contract ABI
```

### 3. Install & Run

```bash
npm install
npm start
```

## Testing the DApp

1. **Get Test ETH**: Visit Sepolia faucet
2. **Deploy Contract**: Use Remix IDE
3. **Connect Wallet**: Click "Connect MetaMask"
4. **Deposit**: Add 0.01 ETH to test
5. **Create Expense**: Propose a test expense
6. **Approve**: Approve with all members
7. **Check History**: View executed transactions

## Common Issues

**"Contract not deployed"**
→ Update CONTRACT_ADDRESS in config.js

**"Not a member"**
→ Add your address when deploying contract

**"Insufficient funds"**
→ Deposit more ETH first

**Transaction fails**
→ Check gas limits and network connection
