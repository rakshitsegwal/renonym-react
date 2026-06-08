import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage.jsx';
import ResumeBuilder from './ResumeBuilder.jsx';
import Dashboard from './Dashboard.jsx';
import './app.css';

function App() {
    const [view, setView]           = useState('landing'); // 'landing' | 'builder' | 'dashboard'
    const [entryMode, setEntryMode] = useState('gallery');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('rn-auth-token');
        const user  = localStorage.getItem('rn-auth-user');
        if (token && user) {
            try { setCurrentUser(JSON.parse(user)); } catch {}
        }
    }, []);

    function goToBuilder(mode = 'gallery') {
        setEntryMode(mode);
        setView('builder');
    }

    function goToDashboard() {
        const user = localStorage.getItem('rn-auth-user');
        if (user) {
            try { setCurrentUser(JSON.parse(user)); } catch {}
        }
        setView('dashboard');
    }

    function handleLogin() {
        const user = localStorage.getItem('rn-auth-user');
        if (user) {
            try { setCurrentUser(JSON.parse(user)); } catch {}
        }
        // After login from landing — go to builder
        goToBuilder('gallery');
    }

    function handleLogout() {
        localStorage.removeItem('rn-auth-token');
        localStorage.removeItem('rn-auth-user');
        setCurrentUser(null);
        setView('landing');
    }

    if (view === 'builder') {
        return <ResumeBuilder
            initialMode={entryMode}
            onGoToDashboard={goToDashboard}
            onGoToLanding={() => setView('landing')}
        />;
    }

    if (view === 'dashboard') {
        return <Dashboard
            user={currentUser}
            onOpenBuilder={goToBuilder}
            onLogout={handleLogout}
        />;
    }

    return (
        <LandingPage
            onGetStarted={() => goToBuilder('gallery')}
            onStartAi={() => goToBuilder('ai')}
            onOpenJobMatch={() => goToBuilder('jobmatch')}
            onLogin={handleLogin}
            onGoToDashboard={goToDashboard}
            currentUser={currentUser}
        />
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
