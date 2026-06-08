import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage.jsx';
import ResumeBuilder from './ResumeBuilder.jsx';
import './app.css';

function App() {
    const [view, setView]     = useState('landing'); // 'landing' | 'builder'
    const [entryMode, setEntryMode] = useState('gallery'); // 'gallery' | 'ai'
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

    if (view === 'builder') {
        return <ResumeBuilder initialMode={entryMode} />;
    }

    return (
        <LandingPage
            onGetStarted={() => goToBuilder('gallery')}
            onStartAi={() => goToBuilder('ai')}
            onLogin={() => goToBuilder('gallery')}
            currentUser={currentUser}
        />
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
