# TrustlessExpenseSplitter DApp

A decentralized application for trustless expense splitting using Ethereum smart contracts with a **factory pattern** for creating multiple independent expense groups.

## 🌟 Features

- **Factory Pattern**: Create unlimited expense splitter groups from a single deployed factory
- **Multi-Group Management**: Users can be members of multiple splitter groups
- **MetaMask Integration**: Secure wallet connection
- **Deposit Management**: Add and withdraw ETH with reserved funds protection
- **Expense Proposals**: Propose shared expenses with custom participant splits
- **Multi-Party Approval**: Expenses require approval from all participants
- **Reserved Deposits**: Funds are reserved upon approval to prevent race conditions
- **Transaction History**: View all group activities
- **Member Dashboard**: Real-time balance and group information

## 🏗️ Architecture

### Smart Contracts

1. **TrustlessExpenseSplitterFactory.sol** (Deploy this)
   - Creates new splitter instances
   - Tracks all splitters
   - User splitter lookup

2. **TrustlessExpenseSplitter.sol** (Auto-deployed by factory)
   - Manages one group's expenses
   - Independent instance per group

### React Application

- React 19.x
- React Router 7.x for navigation
- Web3.js for blockchain interaction
- ethers.js for utilities
- Modular component architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

```bash
cd react_test_proj
npm install
```

### Configuration

1. Deploy `TrustlessExpenseSplitterFactory.sol` to testnet (see FACTORY_PATTERN_GUIDE.md)
2. Update `src/contracts/config.js`:
   - Set `FACTORY_ADDRESS` to your deployed factory address
   - Paste `FACTORY_ABI` from compilation
   - Paste `SPLITTER_ABI` from compilation

### Run Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[FACTORY_PATTERN_GUIDE.md](FACTORY_PATTERN_GUIDE.md)** - Complete factory pattern documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[HOW_TO_GET_ABI.md](HOW_TO_GET_ABI.md)** - ABI extraction guide
- **[TODO.md](TODO.md)** - Development roadmap

## 🎯 User Workflow

1. **Connect MetaMask** → Login with your wallet
2. **View Splitters** → See all your expense groups
3. **Create Splitter** → Start a new group with members
4. **Select Splitter** → Choose which group to manage
5. **Manage Expenses** → Deposit, propose, approve, execute
6. **Withdraw Funds** → Get your remaining balance back

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## 🔐 Security Features

- Reserved deposits prevent double-spending
- Multi-party approval required
- Member-only access control
- Factory enforces creator inclusion
- No factory address as member

## 🌐 Deployment

### GitHub Pages (Recommended)

```bash
npm run build
# Deploy build folder to GitHub Pages
```

### Other Platforms

The build folder can be deployed to any static hosting:
- Vercel
- Netlify
- AWS S3
- IPFS

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router 7
- **Blockchain**: Web3.js 4.x, ethers.js 5.x
- **Styling**: Custom CSS
- **Smart Contracts**: Solidity 0.8.x
- **Network**: Ethereum Sepolia Testnet

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
