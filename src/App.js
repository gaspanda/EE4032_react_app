import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3 from "web3";

import './App.css';
import './global.css';
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Deposit from "./components/deposit/Deposit";
import Expenses from "./components/expenses/Expenses";
import History from "./components/history/History";
import { CONTRACT_ABI, CONTRACT_ADDRESS, EXPECTED_NETWORK } from "./contracts/config";

export default function App() {
    // MetaMask connection states
    const [haveMetamask, setHaveMetamask] = useState(true);
    const [address, setAddress] = useState(null);
    const [network, setNetwork] = useState(null);
    const [balance, setBalance] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Contract states
    const [contract, setContract] = useState(null);
    const [memberDeposit, setMemberDeposit] = useState(0);
    const [reservedDeposit, setReservedDeposit] = useState(0);
    const [totalPooledFunds, setTotalPooledFunds] = useState(0);
    const [isMember, setIsMember] = useState(false);
    const [allMembers, setAllMembers] = useState([]);

    // Expense states
    const [expenses, setExpenses] = useState([]);
    const [nextExpenseId, setNextExpenseId] = useState(0);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { ethereum } = window;

    // Initialize Web3 and contract
    useEffect(() => {
        checkMetaMaskAvailable();
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            initializeContract();
        }
    }, [isConnected, address]);

    // Check if MetaMask is installed
    const checkMetaMaskAvailable = () => {
        if (!window.ethereum) {
            setHaveMetamask(false);
            setError("Please install MetaMask to use this DApp");
        }
    };

    // Connect to MetaMask
    const connectWallet = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!window.ethereum) {
                setHaveMetamask(false);
                setError("MetaMask is not installed");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            
            if (accounts.length > 0) {
                const signer = provider.getSigner();
                const userAddress = await signer.getAddress();
                const networkInfo = await provider.getNetwork();
                const userBalance = await provider.getBalance(userAddress);

                setAddress(userAddress);
                setNetwork(networkInfo.name);
                setBalance(ethers.utils.formatEther(userBalance));
                setIsConnected(true);

                // Check if on correct network
                if (networkInfo.chainId.toString() !== parseInt(EXPECTED_NETWORK.chainId, 16).toString()) {
                    setError(`Please switch to ${EXPECTED_NETWORK.chainName}`);
                }

                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Error connecting wallet:", err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setLoading(false);
        }
    };

    // Initialize contract instance
    const initializeContract = async () => {
        try {
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
                setError("Contract not deployed yet. Please update CONTRACT_ADDRESS in config.js");
                return;
            }

            const web3 = new Web3(window.ethereum);
            const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            setContract(contractInstance);

            // Load initial contract data
            await loadContractData(contractInstance);
        } catch (err) {
            console.error("Error initializing contract:", err);
            setError("Failed to initialize contract");
        }
    };

    // Load contract data
    const loadContractData = async (contractInstance) => {
        if (!contractInstance || !address) return;

        try {
            setLoading(true);

            // Check if user is a member
            const memberStatus = await contractInstance.methods.isMember(address).call();
            setIsMember(memberStatus);

            if (memberStatus) {
                // Get member's deposit
                const deposit = await contractInstance.methods.getMemberBalance(address).call();
                setMemberDeposit(ethers.utils.formatEther(deposit));

                // Get reserved deposit
                const reserved = await contractInstance.methods.reservedDeposits(address).call();
                setReservedDeposit(ethers.utils.formatEther(reserved));

                // Get total pooled funds
                const total = await contractInstance.methods.totalPooledFunds().call();
                setTotalPooledFunds(ethers.utils.formatEther(total));

                // Get all members
                const members = await contractInstance.methods.getAllMembers().call();
                setAllMembers(members);

                // Get next expense ID
                const nextId = await contractInstance.methods.getNextExpenseId().call();
                setNextExpenseId(parseInt(nextId));
            }
        } catch (err) {
            console.error("Error loading contract data:", err);
            setError("Failed to load contract data");
        } finally {
            setLoading(false);
        }
    };

    // Refresh contract data
    const refreshData = () => {
        if (contract) {
            loadContractData(contract);
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    setIsConnected(true);
                } else {
                    disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, []);

    // Disconnect wallet
    const disconnectWallet = () => {
        setAddress(null);
        setIsConnected(false);
        setIsMember(false);
        setContract(null);
        navigate("/");
    };

    return (
        <div className="App">
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <Login 
                            connectWallet={connectWallet}
                            haveMetamask={haveMetamask}
                            isConnected={isConnected}
                            address={address}
                            loading={loading}
                            error={error}
                        />
                    } 
                />
                <Route 
                    path="/login" 
                    element={
                        <Login 
                            connectWallet={connectWallet}
                            haveMetamask={haveMetamask}
                            isConnected={isConnected}
                            address={address}
                            loading={loading}
                            error={error}
                        />
                    } 
                />
                <Route 
                    path="/dashboard" 
                    element={
                        <Dashboard 
                            address={address}
                            balance={balance}
                            memberDeposit={memberDeposit}
                            reservedDeposit={reservedDeposit}
                            totalPooledFunds={totalPooledFunds}
                            isMember={isMember}
                            allMembers={allMembers}
                            isConnected={isConnected}
                            refreshData={refreshData}
                            disconnectWallet={disconnectWallet}
                        />
                    } 
                />
                <Route 
                    path="/deposit" 
                    element={
                        <Deposit 
                            contract={contract}
                            address={address}
                            memberDeposit={memberDeposit}
                            reservedDeposit={reservedDeposit}
                            isConnected={isConnected}
                            isMember={isMember}
                            refreshData={refreshData}
                        />
                    } 
                />
                <Route 
                    path="/expenses" 
                    element={
                        <Expenses 
                            contract={contract}
                            address={address}
                            allMembers={allMembers}
                            nextExpenseId={nextExpenseId}
                            isConnected={isConnected}
                            isMember={isMember}
                            refreshData={refreshData}
                        />
                    } 
                />
                <Route 
                    path="/history" 
                    element={
                        <History 
                            contract={contract}
                            address={address}
                            isConnected={isConnected}
                            isMember={isMember}
                        />
                    } 
                />
            </Routes>
        </div>
    );
}

