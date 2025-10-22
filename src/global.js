import { Link } from "react-router-dom";

export const BackgroundCovered = '#1a1a2e';
export const BackgroundUncovered = '#f5f5f5';
export const MessageColorCovered = 'white';
export const MessageColorUncovered = '#1a1a2e';

export const HighlightColor = '#16213e';
export const LinkColor = '#0f3460';
export const TopbarColor = '#16213e';
export const AccentColor = '#e94560';

export const GlobalToolBar = () => {
    return (
        <div className="global-toolbar">
            <Link to="/login">Login</Link>
            &nbsp;|&nbsp;
            <Link to="/splitters">My Splitters</Link>
            &nbsp;|&nbsp;
            <Link to="/dashboard">Dashboard</Link>
            &nbsp;|&nbsp;
            <Link to="/deposit">Deposit</Link>
            &nbsp;|&nbsp;
            <Link to="/expenses">Expenses</Link>
            &nbsp;|&nbsp;
            <Link to="/history">History</Link>
        </div>
    );
};
