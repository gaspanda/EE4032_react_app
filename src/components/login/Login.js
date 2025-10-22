import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login({ connectWallet, haveMetamask, isConnected, address, loading, error }) {
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isConnected) {
            navigate('/dashboard');
        }
    }, [isConnected, navigate]);

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Trustless Expense Splitter</h1>
                <p className="subtitle">Connect your wallet to manage shared expenses</p>
                
                {!haveMetamask && (
                    <div className="error-message">
                        <p>MetaMask is not installed!</p>
                        <p>Please install MetaMask to use this DApp</p>
                        <a 
                            href="https://metamask.io/download/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="button"
                        >
                            Install MetaMask
                        </a>
                    </div>
                )}

                {haveMetamask && !isConnected && (
                    <div className="connect-section">
                        <button 
                            onClick={connectWallet} 
                            className="button button-primary"
                            disabled={loading}
                        >
                            {loading ? 'Connecting...' : 'Connect MetaMask'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {isConnected && address && (
                    <div className="success-message">
                        <p>✓ Connected</p>
                        <p className="address">{address.slice(0, 6)}...{address.slice(-4)}</p>
                    </div>
                )}

                <div className="features">
                    <h3>Features:</h3>
                    <ul>
                        <li>Pool funds with group members</li>
                        <li>Propose shared expenses</li>
                        <li>Multi-party approval system</li>
                        <li>Automatic payment execution</li>
                        <li>Transparent transaction history</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
