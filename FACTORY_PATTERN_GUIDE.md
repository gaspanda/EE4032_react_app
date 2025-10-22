# TrustlessExpenseSplitter DApp - Factory Pattern Guide

## 🏗️ Architecture Overview

This DApp now uses a **Factory Pattern** to allow users to create and manage multiple independent expense splitter groups.

### Smart Contracts

1. **TrustlessExpenseSplitterFactory.sol** - Factory contract (deploy this one)
   - Creates new splitter instances
   - Tracks all splitters and their members
   - Provides user-specific splitter lookups

2. **TrustlessExpenseSplitter.sol** - Splitter contract (deployed automatically by factory)
   - Manages deposits, expenses, and approvals for one group
   - Each group gets its own independent instance

## 📋 Deployment Steps

### 1. Compile Both Contracts

In Remix IDE:
1. Open `TrustlessExpenseSplitter.sol` and compile it
2. Copy its ABI (you'll need this for the React app)
3. Open `TrustlessExpenseSplitterFactory.sol` and compile it
4. Copy its ABI

### 2. Deploy the Factory Contract

1. In Remix, deploy **TrustlessExpenseSplitterFactory.sol** (NOT TrustlessExpenseSplitter)
2. Copy the deployed factory contract address
3. The factory will deploy splitter instances automatically when users create groups

### 3. Update React App Configuration

Update `src/contracts/config.js`:

```javascript
export const FACTORY_ADDRESS = "0xYourFactoryAddress"; // Factory contract address

export const FACTORY_ABI = [ /* Paste factory ABI here */ ];

export const SPLITTER_ABI = [ /* Paste splitter ABI here */ ];
```

## 🔄 User Workflow

### For Users:

1. **Connect Wallet** - MetaMask login
2. **View Splitters** - See all splitter groups you're part of
3. **Create New Splitter** - Create a new expense group with specific members
4. **Select Splitter** - Choose which group to interact with
5. **Use Features** - Deposit, propose expenses, approve, withdraw (same as before)

### Creating a New Splitter:

```
1. Click "Create New Splitter" on the Splitters page
2. Enter member addresses (comma-separated):
   0x123..., 0x456..., 0x789...
3. Click "Create Splitter"
4. Factory deploys a new TrustlessExpenseSplitter instance
5. You can now interact with that splitter
```

## 🎯 Key Changes from Previous Version

### Old (Single Contract):
- One deployed contract = one group
- All users must be added at deployment
- Required new deployment for each group

### New (Factory Pattern):
- One factory deployment = unlimited groups
- Users create groups dynamically
- Each group is independent with its own members and funds

## 📱 React App Structure

### New Components:

**Splitters.js** - Manage splitter groups
- View all your splitters
- Create new splitters
- Select active splitter

### Updated Components:

**App.js**
- Now manages factory contract and active splitter contract separately
- Routes through Splitters page before Dashboard

**Dashboard.js**
- Shows which splitter is currently active
- Displays group-specific data

**Other components** (Deposit, Expenses, History)
- Work with the selected splitter contract
- No changes to their internal logic

## 🔐 Security Features

### Factory Contract:
- ✅ Enforces creator must be in members list
- ✅ Tracks all splitters for transparency
- ✅ Provides user-specific lookups

### Splitter Contract:
- ✅ No longer auto-adds deployer (factory) as member
- ✅ Only addresses in members array can interact
- ✅ Reserved deposits prevent race conditions
- ✅ All original security features maintained

## 🚀 Getting Started

### Prerequisites:
- MetaMask installed
- Sepolia testnet ETH
- Both contracts compiled and factory deployed

### Installation:

```bash
cd react_test_proj
npm install
npm start
```

### First-Time Setup:

1. Deploy TrustlessExpenseSplitterFactory.sol to testnet
2. Update config.js with factory address and both ABIs
3. Run the React app
4. Connect MetaMask
5. Create your first splitter group

## 📊 Gas Costs

- **Factory Deployment**: ~1.5M gas (one-time)
- **Create Splitter**: ~2-3M gas per group
- **Regular Operations**: Same as before (deposit, approve, execute)

## 🔍 Troubleshooting

### "Factory contract not deployed"
- Check FACTORY_ADDRESS in config.js is not 0x000...
- Ensure you deployed TrustlessExpenseSplitterFactory, not TrustlessExpenseSplitter

### "Not a member"
- Ensure you included your address when creating the splitter
- Check you're viewing the correct splitter

### "Failed to create splitter"
- Verify all addresses are valid Ethereum addresses
- Ensure you have enough gas
- Check you included your own address in the members list

## 📝 Example Member Addresses for Testing

```
Your address: 0xYourMetaMaskAddress
Member 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Member 3: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

## 🎓 Learning Resources

- [Factory Pattern in Solidity](https://docs.soliditylang.org/en/latest/contracts.html#creating-contracts)
- [React Router v7](https://reactrouter.com/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify contract addresses and ABIs
3. Ensure correct network (Sepolia)
4. Check MetaMask connection

## 🔮 Future Enhancements

- [ ] Add splitter naming/descriptions
- [ ] Archive/close completed splitters
- [ ] Multi-signature admin features
- [ ] Export transaction history
- [ ] Mobile-responsive improvements
