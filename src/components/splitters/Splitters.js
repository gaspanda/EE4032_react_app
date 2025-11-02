import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalToolBar } from '../../global';
import { ethers } from "ethers";
import { SPLITTER_ABI } from '../../contracts/config';
import './Splitters.css';

export default function Splitters({ 
    factoryContract,
    address, 
    isConnected,
    onSelectSplitter
}) {
    const navigate = useNavigate();
    const [userSplitters, setUserSplitters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // Create splitter form states
    const [memberAddresses, setMemberAddresses] = useState('');
    const [creating, setCreating] = useState(false);
    
    // Editable name states
    const [editingName, setEditingName] = useState({});
    const [splitterNames, setSplitterNames] = useState({});
    
    // Final settlement states
    const [settlementLoading, setSettlementLoading] = useState({});
    const [showSettlementConfirm, setShowSettlementConfirm] = useState({});

    useEffect(() => {
        if (!isConnected) {
            navigate('/login');
        }
    }, [isConnected, navigate]);

    useEffect(() => {
        if (factoryContract && address) {
            loadUserSplitters();
        }
    }, [factoryContract, address]);

    const loadUserSplitters = async () => {
        if (!factoryContract || !address) return;

        try {
            setLoading(true);
            setError(null);

            const splitters = await factoryContract.getUserSplitters(address);
            
            // Load metadata for each splitter
            const splittersWithInfo = await Promise.all(
                splitters.map(async (splitterAddress) => {
                    try {
                        const info = await factoryContract.getSplitterInfo(splitterAddress);
                        return {
                            address: splitterAddress,
                            creator: info.creator || info[0],
                            createdAt: info.createdAt || info[1],
                            members: info.members || info[2]
                        };
                    } catch (err) {
                        console.error(`Error loading info for splitter ${splitterAddress}:`, err);
                        return {
                            address: splitterAddress,
                            creator: 'Unknown',
                            createdAt: 0,
                            members: []
                        };
                    }
                })
            );

            setUserSplitters(splittersWithInfo);
        } catch (err) {
            console.error("Error loading splitters:", err);
            setError("Failed to load your splitters");
        } finally {
            setLoading(false);
        }
    };

    // Load saved splitter names from localStorage
    useEffect(() => {
        const savedNames = localStorage.getItem('splitterNames');
        if (savedNames) {
            setSplitterNames(JSON.parse(savedNames));
        }
    }, []);

    // Save splitter names to localStorage
    const saveSplitterNames = (names) => {
        localStorage.setItem('splitterNames', JSON.stringify(names));
        setSplitterNames(names);
    };

    // Handle name editing
    const handleNameEdit = (splitterAddress, newName) => {
        const updatedNames = {
            ...splitterNames,
            [splitterAddress]: newName
        };
        saveSplitterNames(updatedNames);
        setEditingName({ ...editingName, [splitterAddress]: false });
    };

    // Handle final settlement
    const handleFinalSettlement = async (splitterAddress) => {
        try {
            setSettlementLoading({ ...settlementLoading, [splitterAddress]: true });
            setError(null);

            // Check if we have a valid provider
            if (!window.ethereum) {
                throw new Error("No Web3 provider found. Please install MetaMask.");
            }

            // Get the splitter contract instance
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Use the proper SPLITTER_ABI instead of manual ABI
            const splitterContract = new ethers.Contract(
                splitterAddress,
                SPLITTER_ABI,
                signer
            );

            // Verify the contract is valid by calling a view function
            try {
                await splitterContract.getAllMembers();
            } catch (contractError) {
                throw new Error("Invalid contract address or contract not deployed");
            }

            // Check if user is a member
            const isMemberResult = await splitterContract.isMember(address);
            if (!isMemberResult) {
                throw new Error("You must be a member to initiate final settlement");
            }

            // Check if there are funds to settle
            const totalFunds = await splitterContract.totalPooledFunds();
            if (totalFunds.eq(0)) {
                throw new Error("No funds available for settlement");
            }

            // Execute final settlement
            const tx = await splitterContract.finalSettlement();
            await tx.wait();

            // Refresh the splitters list
            await loadUserSplitters();
            
            setShowSettlementConfirm({ ...showSettlementConfirm, [splitterAddress]: false });
            alert("Final settlement completed successfully! All funds have been distributed to members.");

        } catch (err) {
            console.error("Final settlement error:", err);
            setError(`Final settlement failed: ${err.message}`);
        } finally {
            setSettlementLoading({ ...settlementLoading, [splitterAddress]: false });
        }
    };

    const handleCreateSplitter = async (e) => {
        e.preventDefault();
        
        if (!factoryContract || !address) {
            setError("Factory contract not initialized");
            return;
        }

        try {
            setCreating(true);
            setError(null);

            // Parse member addresses
            const addresses = memberAddresses
                .split(',')
                .map(addr => addr.trim())
                .filter(addr => addr.length > 0);

            if (addresses.length === 0) {
                setError("Please enter at least one member address");
                return;
            }

            // Check if user included themselves
            const userIncluded = addresses.some(addr => addr.toLowerCase() === address.toLowerCase());
            if (!userIncluded) {
                // Automatically add the user
                addresses.unshift(address);
            }

            // Validate addresses
            for (const addr of addresses) {
                if (!ethers.utils.isAddress(addr)) {
                    setError(`Invalid Ethereum address: ${addr}`);
                    return;
                }
            }

            // Create the splitter (ethers.js syntax)
            const tx = await factoryContract.createSplitter(addresses);
            const receipt = await tx.wait();

            console.log("Splitter created:", receipt);
            
            // Refresh the list
            await loadUserSplitters();
            
            // Reset form
            setMemberAddresses('');
            setShowCreateForm(false);
            
        } catch (err) {
            console.error("Error creating splitter:", err);
            setError(err.message || "Failed to create splitter");
        } finally {
            setCreating(false);
        }
    };

    const handleSelectSplitter = (splitterAddress) => {
        onSelectSplitter(splitterAddress);
        navigate('/dashboard');
    };

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return 'Unknown';
        return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
    };

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div>
            <GlobalToolBar />
            <div className="page-container">
                <div className="dashboard-header">
                    <h1>Your Expense Splitters</h1>
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)} 
                        className="button"
                    >
                        {showCreateForm ? '❌ Cancel' : '➕ Create New Splitter'}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {showCreateForm && (
                    <div className="card">
                        <h2>Create New Expense Splitter</h2>
                        <form onSubmit={handleCreateSplitter}>
                            <div className="form-group">
                                <label>Member Addresses (comma-separated)</label>
                                <textarea
                                    value={memberAddresses}
                                    onChange={(e) => setMemberAddresses(e.target.value)}
                                    placeholder="0x123..., 0x456..., 0x789..."
                                    rows="4"
                                    required
                                />
                                <small>
                                    Enter Ethereum addresses separated by commas. 
                                    Your address ({formatAddress(address)}) will be included automatically if not present.
                                </small>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="button" 
                                disabled={creating || !memberAddresses.trim()}
                            >
                                {creating ? 'Creating...' : 'Create Splitter'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="card">
                    <h2>Your Splitters</h2>
                    
                    {loading && <p>Loading your splitters...</p>}
                    
                    {!loading && userSplitters.length === 0 && (
                        <div className="empty-state">
                            <p>You don't have any expense splitters yet.</p>
                            <p>Create one to start splitting expenses with your group!</p>
                        </div>
                    )}
                    
                    {!loading && userSplitters.length > 0 && (
                        <div className="splitters-grid">
                            {userSplitters.map((splitter, index) => (
                                <div key={index} className="splitter-card">
                                    <div className="splitter-header">
                                        {editingName[splitter.address] ? (
                                            <input
                                                type="text"
                                                className="editable-name-input"
                                                defaultValue={splitterNames[splitter.address] || `Splitter #${index + 1}`}
                                                onBlur={(e) => handleNameEdit(splitter.address, e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleNameEdit(splitter.address, e.target.value);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <h3 
                                                className="editable-name"
                                                onClick={() => setEditingName({ ...editingName, [splitter.address]: true })}
                                                title="Click to edit name"
                                            >
                                                {splitterNames[splitter.address] || `Splitter #${index + 1}`}
                                                <span className="edit-icon">✏️</span>
                                            </h3>
                                        )}
                                        <span className="splitter-date">
                                            Created: {formatDate(splitter.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <div className="splitter-info">
                                        <div className="info-row">
                                            <span className="info-label">Address:</span>
                                            <span className="info-value address-text" title={splitter.address}>
                                                {formatAddress(splitter.address)}
                                            </span>
                                        </div>
                                        
                                        <div className="info-row">
                                            <span className="info-label">Creator:</span>
                                            <span className="info-value address-text" title={splitter.creator}>
                                                {formatAddress(splitter.creator)}
                                                {splitter.creator && splitter.creator.toLowerCase() === address.toLowerCase() && 
                                                    <span className="badge">You</span>
                                                }
                                            </span>
                                        </div>
                                        
                                        <div className="info-row">
                                            <span className="info-label">Members:</span>
                                            <span className="info-value">{splitter.members.length}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="splitter-actions">
                                        <button 
                                            onClick={() => handleSelectSplitter(splitter.address)}
                                            className="button button-primary"
                                        >
                                            Open Splitter
                                        </button>
                                        
                                        {splitter.creator && splitter.creator.toLowerCase() === address.toLowerCase() && (
                                            <button 
                                                onClick={() => setShowSettlementConfirm({ ...showSettlementConfirm, [splitter.address]: true })}
                                                className="button button-danger"
                                                disabled={settlementLoading[splitter.address]}
                                            >
                                                {settlementLoading[splitter.address] ? 'Settling...' : '⚠️ Final Settlement'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Final Settlement Confirmation Modal */}
                                    {showSettlementConfirm[splitter.address] && (
                                        <div className="settlement-modal">
                                            <div className="settlement-modal-content">
                                                <h3>⚠️ Final Settlement</h3>
                                                <p>This will distribute all remaining funds to group members and effectively close this splitter.</p>
                                                <p><strong>This action cannot be undone!</strong></p>
                                                <div className="settlement-actions">
                                                    <button 
                                                        onClick={() => handleFinalSettlement(splitter.address)}
                                                        className="button button-danger"
                                                        disabled={settlementLoading[splitter.address]}
                                                    >
                                                        {settlementLoading[splitter.address] ? 'Processing...' : 'Confirm Settlement'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowSettlementConfirm({ ...showSettlementConfirm, [splitter.address]: false })}
                                                        className="button button-secondary"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
