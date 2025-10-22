// Contract configuration
// TODO: Replace with your deployed contract address after deployment
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace after deployment

// TODO: Replace with your contract ABI after compilation
// You can get this from Remix IDE after compiling TrustlessExpenseSplitter.sol
export const CONTRACT_ABI = [
    // This is a placeholder. After you compile your contract in Remix:
    // 1. Go to the "Solidity Compiler" tab
    // 2. Click "Compilation Details"
    // 3. Copy the ABI array and paste it here
    
    // For now, I'm including the expected ABI based on your contract
    // You should replace this with the actual ABI after compilation
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
