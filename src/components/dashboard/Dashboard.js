import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalToolBar } from '../../global';
import './Dashboard.css';

export default function Dashboard({ 
    address, 
    balance, 
    memberDeposit, 
    reservedDeposit,
    totalPooledFunds, 
    isMember, 
    allMembers, 
    isConnected,
    activeSplitterAddress,
    refreshData,
    disconnectWallet
}) {
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isConnected) {
            navigate('/login');
        }
    }, [isConnected, navigate]);

    React.useEffect(() => {
        if (isConnected && !activeSplitterAddress) {
            navigate('/splitters');
        }
    }, [isConnected, activeSplitterAddress, navigate]);

    const availableBalance = (parseFloat(memberDeposit) - parseFloat(reservedDeposit)).toFixed(4);
    
    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div>
            <GlobalToolBar />
            <div className="page-container">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/splitters')} className="button button-secondary">
                            ← Back to Splitters
                        </button>
                        <button onClick={refreshData} className="button">
                            🔄 Refresh
                        </button>
                        <button onClick={disconnectWallet} className="button button-secondary">
                            Disconnect
                        </button>
                    </div>
                </div>

                {activeSplitterAddress && (
                    <div className="info-banner">
                        <strong>Active Splitter:</strong> {formatAddress(activeSplitterAddress)}
                        <span className="full-address" title={activeSplitterAddress}>
                            (Click to copy full address)
                        </span>
                    </div>
                )}

                {!isMember && (
                    <div className="error-message">
                        <h3>You are not a member of this expense group</h3>
                        <p>Your address: {address}</p>
                        <p>Please contact the group creator to be added as a member.</p>
                    </div>
                )}

                {isMember && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Your Wallet Balance</h3>
                                <p className="stat-value">{parseFloat(balance).toFixed(4)} ETH</p>
                                <p className="stat-label">Available in wallet</p>
                            </div>

                            <div className="stat-card">
                                <h3>Your Deposit</h3>
                                <p className="stat-value">{parseFloat(memberDeposit).toFixed(4)} ETH</p>
                                <p className="stat-label">Total deposited in contract</p>
                            </div>

                            <div className="stat-card">
                                <h3>Reserved Funds</h3>
                                <p className="stat-value warning">{parseFloat(reservedDeposit).toFixed(4)} ETH</p>
                                <p className="stat-label">Locked for pending expenses</p>
                            </div>

                            <div className="stat-card">
                                <h3>Available to Withdraw</h3>
                                <p className="stat-value success">{availableBalance} ETH</p>
                                <p className="stat-label">Can be withdrawn anytime</p>
                            </div>
                        </div>

                        <div className="card">
                            <h2>Group Information</h2>
                            <div className="group-info">
                                <div className="info-row">
                                    <span className="info-label">Total Pooled Funds:</span>
                                    <span className="info-value">{parseFloat(totalPooledFunds).toFixed(4)} ETH</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Total Members:</span>
                                    <span className="info-value">{allMembers.length}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Your Address:</span>
                                    <span className="info-value address-text">{address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2>Group Members</h2>
                            <div className="members-list">
                                {allMembers.map((member, index) => (
                                    <div key={index} className="member-item">
                                        <span className="member-number">#{index + 1}</span>
                                        <span className="member-address">{member}</span>
                                        {member.toLowerCase() === address.toLowerCase() && (
                                            <span className="member-badge">You</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button 
                                onClick={() => navigate('/expenses?tab=propose')} 
                                className="button action-button primary-action"
                            >
                                ➕ Propose Expense
                            </button>
                            <button 
                                onClick={() => navigate('/deposit')} 
                                className="button action-button"
                            >
                                💰 Deposit / Withdraw Funds
                            </button>
                            <button 
                                onClick={() => navigate('/expenses')} 
                                className="button action-button"
                            >
                                📝 Manage Expenses
                            </button>
                            <button 
                                onClick={() => navigate('/history')} 
                                className="button action-button"
                            >
                                📊 View History
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
