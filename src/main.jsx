import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage.jsx';
import ResumeBuilder from './ResumeBuilder.jsx';
import Dashboard from './Dashboard.jsx';
import LegalPage from './LegalPage.jsx';
import './app.css';

// ── Lightweight routing ─────────────────────────────────────────────────────
// Legal pages get real paths (so they're shareable / SEO-able and survive a
// hard refresh — see vercel.json rewrites). The app views (landing / builder /
// dashboard) live at "/" and are driven by history state so the browser Back
// button works. Section anchors (#features etc.) keep native scroll behaviour.
const LEGAL_PATHS    = { '/privacy': 'privacy', '/terms': 'terms', '/about': 'about' };
const PATH_FOR_VIEW  = { privacy: '/privacy', terms: '/terms', about: '/about' };
const SECTION_HASHES = ['#features', '#templates', '#pricing'];

function viewFromLocation() {
    return LEGAL_PATHS[window.location.pathname] || 'landing';
}

function App() {
    const [view, setView]           = useState(viewFromLocation);
    const [entryMode, setEntryMode] = useState('gallery');
    const [currentUser, setCurrentUser] = useState(null);
    const viewRef = useRef(view);
    viewRef.current = view;

    // Restore auth session
    useEffect(() => {
        const token = localStorage.getItem('rn-auth-token');
        const user  = localStorage.getItem('rn-auth-user');
        if (token && user) {
            try { setCurrentUser(JSON.parse(user)); } catch {}
        }
    }, []);

    // Browser Back/Forward + section-anchor handling
    useEffect(() => {
        function onPop(e) {
            const next = (e.state && e.state.view) || viewFromLocation();
            if (e.state && e.state.entryMode) setEntryMode(e.state.entryMode);
            setView(next);
        }
        function onHash() {
            // Clicking a section anchor while inside an app view returns to the
            // landing page and scrolls to that section (fixes hash-ignored bug).
            if (SECTION_HASHES.includes(window.location.hash) && viewRef.current !== 'landing') {
                const target = window.location.hash;
                setView('landing');
                setTimeout(() => {
                    const el = document.querySelector(target);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 60);
            }
        }
        window.addEventListener('popstate', onPop);
        window.addEventListener('hashchange', onHash);
        return () => {
            window.removeEventListener('popstate', onPop);
            window.removeEventListener('hashchange', onHash);
        };
    }, []);

    // Push a history entry and switch the view (so Back returns to the prior view)
    function navigate(nextView, mode) {
        const path  = PATH_FOR_VIEW[nextView] || '/';
        const state = { view: nextView, entryMode: mode || entryMode };
        window.history.pushState(state, '', path);
        if (mode) setEntryMode(mode);
        setView(nextView);
        window.scrollTo(0, 0);
    }

    function goToBuilder(mode = 'gallery') { navigate('builder', mode); }

    function goToDashboard() {
        const user = localStorage.getItem('rn-auth-user');
        if (user) { try { setCurrentUser(JSON.parse(user)); } catch {} }
        navigate('dashboard');
    }

    function goToLanding() { navigate('landing'); }
    function goToLegal(page) { navigate(page); }

    function handleLogin() {
        const user = localStorage.getItem('rn-auth-user');
        if (user) { try { setCurrentUser(JSON.parse(user)); } catch {} }
        // After login from landing — go to builder
        goToBuilder('gallery');
    }

    function handleLogout() {
        localStorage.removeItem('rn-auth-token');
        localStorage.removeItem('rn-auth-user');
        setCurrentUser(null);
        navigate('landing');
    }

    if (view === 'privacy' || view === 'terms' || view === 'about') {
        return <LegalPage page={view} onHome={goToLanding} />;
    }

    if (view === 'builder') {
        return <ResumeBuilder
            initialMode={entryMode}
            onGoToDashboard={goToDashboard}
            onGoToLanding={goToLanding}
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
            onGoToDashboard={goToDashboard}
            onNavigateLegal={goToLegal}
            onLogin={handleLogin}
            currentUser={currentUser}
        />
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
