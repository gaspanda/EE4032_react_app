import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalToolBar } from '../../global';
import './Deposit.css';

export default function Deposit({ 
    contract, 
    address, 
    memberDeposit, 
    reservedDeposit,
    isConnected, 
    isMember,
    refreshData 
}) {
    const [depositAmount, setDepositAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isConnected) {
            navigate('/login');
        }
    }, [isConnected, navigate]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!contract) {
                throw new Error("Contract not initialized");
            }

            if (!depositAmount || parseFloat(depositAmount) <= 0) {
                throw new Error("Please enter a valid amount");
            }

            const amountInWei = window.web3.utils.toWei(depositAmount, 'ether');

            await contract.methods.deposit().send({
                from: address,
                value: amountInWei,
                gas: 300000
            });

            setSuccess(`Successfully deposited ${depositAmount} ETH!`);
            setDepositAmount('');
            
            // Refresh data after 2 seconds
            setTimeout(() => {
                refreshData();
            }, 2000);

        } catch (err) {
            console.error("Deposit error:", err);
            setError(err.message || "Failed to deposit funds");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!contract) {
                throw new Error("Contract not initialized");
            }

            const availableToWithdraw = parseFloat(memberDeposit) - parseFloat(reservedDeposit);

            if (availableToWithdraw <= 0) {
                throw new Error("No funds available to withdraw. All your deposits are reserved for pending expenses.");
            }

            await contract.methods.withdrawMoney().send({
                from: address,
                gas: 300000
            });

            setSuccess(`Successfully withdrew ${availableToWithdraw.toFixed(4)} ETH!`);
            
            // Refresh data after 2 seconds
            setTimeout(() => {
                refreshData();
            }, 2000);

        } catch (err) {
            console.error("Withdraw error:", err);
            setError(err.message || "Failed to withdraw funds");
        } finally {
            setLoading(false);
        }
    };

    if (!isMember) {
        return (
            <div>
                <GlobalToolBar />
                <div className="page-container">
                    <div className="error-message">
                        <h3>You are not a member of this expense group</h3>
                        <p>You need to be a member to deposit or withdraw funds.</p>
                    </div>
                </div>
            </div>
        );
    }

    const availableToWithdraw = (parseFloat(memberDeposit) - parseFloat(reservedDeposit)).toFixed(4);

    return (
        <div>
            <GlobalToolBar />
            <div className="page-container">
                <h1>Deposit & Withdraw</h1>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="deposit-grid">
                    <div className="card">
                        <h2>Deposit Funds</h2>
                        <p>Add ETH to your account in the shared pool</p>

                        <form onSubmit={handleDeposit} className="deposit-form">
                            <div className="form-group">
                                <label>Amount (ETH)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    placeholder="0.0"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="input-field"
                                    disabled={loading}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="button button-primary"
                                disabled={loading || !depositAmount}
                            >
                                {loading ? 'Processing...' : 'Deposit'}
                            </button>
                        </form>

                        <div className="quick-amounts">
                            <p>Quick amounts:</p>
                            <div className="quick-buttons">
                                <button 
                                    onClick={() => setDepositAmount('0.01')} 
                                    className="button-quick"
                                    disabled={loading}
                                >
                                    0.01 ETH
                                </button>
                                <button 
                                    onClick={() => setDepositAmount('0.05')} 
                                    className="button-quick"
                                    disabled={loading}
                                >
                                    0.05 ETH
                                </button>
                                <button 
                                    onClick={() => setDepositAmount('0.1')} 
                                    className="button-quick"
                                    disabled={loading}
                                >
                                    0.1 ETH
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2>Withdraw Funds</h2>
                        <p>Withdraw your available balance back to your wallet</p>

                        <div className="balance-info">
                            <div className="balance-row">
                                <span>Total Deposit:</span>
                                <span className="balance-value">{parseFloat(memberDeposit).toFixed(4)} ETH</span>
                            </div>
                            <div className="balance-row">
                                <span>Reserved (Pending Expenses):</span>
                                <span className="balance-value warning">-{parseFloat(reservedDeposit).toFixed(4)} ETH</span>
                            </div>
                            <div className="balance-row total">
                                <span>Available to Withdraw:</span>
                                <span className="balance-value success">{availableToWithdraw} ETH</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleWithdraw}
                            className="button button-secondary withdraw-button"
                            disabled={loading || parseFloat(availableToWithdraw) <= 0}
                        >
                            {loading ? 'Processing...' : 'Withdraw All Available'}
                        </button>

                        {parseFloat(reservedDeposit) > 0 && (
                            <div className="info-box">
                                <p>⚠️ Some of your funds are reserved for pending expenses you've approved.</p>
                                <p>These funds cannot be withdrawn until the expenses are executed or cancelled.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
