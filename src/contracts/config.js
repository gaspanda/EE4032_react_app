// Factory Contract Configuration
// TODO: Replace with your deployed FACTORY contract address after deployment
export const FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace after deployment

// TODO: Replace with your FACTORY contract ABI after compilation
export const FACTORY_ABI = [
    // This is a placeholder. After you compile TrustlessExpenseSplitterFactory.sol in Remix:
    // 1. Go to the "Solidity Compiler" tab
    // 2. Click "Compilation Details"
    // 3. Copy the ABI array and paste it here
];

// TrustlessExpenseSplitter Contract ABI
// This is needed to interact with deployed splitter instances
// TODO: Replace with your SPLITTER contract ABI after compilation
export const SPLITTER_ABI = [
    // This is a placeholder. After you compile TrustlessExpenseSplitter.sol in Remix:
    // 1. Go to the "Solidity Compiler" tab
    // 2. Click "Compilation Details"
    // 3. Copy the ABI array and paste it here
];

// Network configuration
export const SUPPORTED_NETWORKS = {
    SEPOLIA: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Test Network',
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io/']
    },
    GOERLI: {
        chainId: '0x5',
        chainName: 'Goerli Test Network',
        rpcUrls: ['https://goerli.infura.io/v3/'],
        blockExplorerUrls: ['https://goerli.etherscan.io/']
    }
};

export const EXPECTED_NETWORK = SUPPORTED_NETWORKS.SEPOLIA; // Change as needed
