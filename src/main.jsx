import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage.jsx';
import ResumeBuilder from './ResumeBuilder.jsx';
import Dashboard from './Dashboard.jsx';
import LegalPage from './LegalPage.jsx';
import CoachLanding from './coach/CoachLanding.jsx';
import InterviewSetup from './coach/InterviewSetup.jsx';
import CoachCheckout from './coach/CoachCheckout.jsx';
import InterviewReport from './coach/InterviewReport.jsx';
import InterviewComplete from './coach/InterviewComplete.jsx';
import InterviewHistory from './coach/InterviewHistory.jsx';
import VoiceInterview from './coach/VoiceInterview.jsx';
import TextInterview from './coach/TextInterview.jsx';
import Tracker from './tracker/Tracker.jsx';
import JobDetail from './tracker/JobDetail.jsx';
import AdminFounding from './AdminFounding.jsx';
import './app.css';
import './coach.css';

// ── Lightweight routing ─────────────────────────────────────────────────────
// Legal pages get real paths (so they're shareable / SEO-able and survive a
// hard refresh — see vercel.json rewrites). The app views (landing / builder /
// dashboard) live at "/" and are driven by history state so the browser Back
// button works. Section anchors (#features etc.) keep native scroll behaviour.
const LEGAL_PATHS    = { '/privacy': 'privacy', '/terms': 'terms', '/about': 'about' };
const PATH_FOR_VIEW  = { privacy: '/privacy', terms: '/terms', about: '/about' };
const SECTION_HASHES = ['#resume', '#pricing', '#how', '#coach'];

// Interview Coach routes (path-based, with params). Returns null if not a coach path.
function matchCoach(path) {
    if (path === '/coach')          return { view: 'coach-landing',  params: {} };
    if (path === '/coach/new')      return { view: 'coach-setup',    params: {} };
    if (path === '/coach/checkout') return { view: 'coach-checkout', params: {} };
    if (path === '/coach/reports')  return { view: 'coach-history',  params: {} };
    let m;
    if ((m = path.match(/^\/coach\/session\/([^/]+)\/complete$/))) return { view: 'coach-complete', params: { id: m[1] } };
    if ((m = path.match(/^\/coach\/session\/([^/]+)$/)))           return { view: 'coach-session',  params: { id: m[1], mode: new URLSearchParams(window.location.search).get('mode') || 'voice' } };
    if ((m = path.match(/^\/coach\/report\/([^/]+)$/)))           return { view: 'coach-report',   params: { id: m[1] } };
    return null;
}

// Resolve the current URL → { view, params }. Path-based routes (legal, coach)
// are authoritative; everything else is the landing/builder/dashboard app at "/".
function parseLocation() {
    const path = window.location.pathname;
    if (LEGAL_PATHS[path]) return { view: LEGAL_PATHS[path], params: {} };
    if (path === '/dashboard') return { view: 'dashboard', params: {} };
    if (path === '/admin')     return { view: 'admin',     params: {} };
    if (path === '/builder')   return { view: 'builder',   params: { mode: new URLSearchParams(window.location.search).get('mode') || undefined } };
    if (path === '/tracker')   return { view: 'tracker',   params: {} };
    const jm = path.match(/^\/tracker\/job\/([^/]+)$/);
    if (jm) return { view: 'tracker-job', params: { id: jm[1] } };
    const coach = matchCoach(path);
    if (coach) return coach;
    return { view: 'landing', params: {} };
}

function App() {
    const [view, setView]           = useState(() => parseLocation().view);
    const [params, setParams]       = useState(() => parseLocation().params);
    const [entryMode, setEntryMode] = useState('gallery');
    const [currentUser, setCurrentUser] = useState(null);
    const viewRef = useRef(view);
    viewRef.current = view;

    // Capture a referral code from ?ref= — claimed once after sign-in (give 5 / get 5).
    useEffect(() => {
        try {
            const ref = new URLSearchParams(window.location.search).get('ref');
            if (ref) localStorage.setItem('rn-ref-code', ref.trim().toUpperCase().slice(0, 16));
        } catch {}
    }, []);

    function tryClaimReferral() {
        let code = null;
        try { code = localStorage.getItem('rn-ref-code'); } catch {}
        if (!code || !localStorage.getItem('rn-auth-token')) return;
        import('./coach/api.js').then(({ claimReferral }) => claimReferral(code))
            .then(() => { try { localStorage.removeItem('rn-ref-code'); } catch {} })
            .catch(e => {
                // Bad/own code: drop it so we never retry forever. Network errors: keep for next sign-in.
                if (e && (e.status === 400 || e.status === 404)) { try { localStorage.removeItem('rn-ref-code'); } catch {} }
            });
    }

    // Refresh the cached user from the server — the popup writes only a slim
    // {id,email,name,plan}, and any cache goes stale after a purchase or when
    // signing in on another device. This merge adds the full v14 surface.
    function refreshUserFromServer() {
        import('./coach/api.js').then(({ authMe }) => authMe()).then(fresh => {
            if (!fresh || !fresh.id) return;
            const merged = { id: fresh.id, email: fresh.email, name: fresh.name, avatarUrl: fresh.avatarUrl, plan: fresh.plan || 'free', coach: fresh.coach || null,
                credits: fresh.credits || 0, passType: fresh.passType || null, passExpiresAt: fresh.passExpiresAt || null,
                passInterviewsRemaining: fresh.passInterviewsRemaining || 0, interviewCredits: fresh.interviewCredits || 0,
                freeInterviewUsed: !!fresh.freeInterviewUsed, referralCode: fresh.referralCode || null,
                emailVerified: !!fresh.emailVerified, founding: fresh.founding || null };
            localStorage.setItem('rn-auth-user', JSON.stringify(merged));
            setCurrentUser(merged);
        }).catch(e => {
            if (e && e.status === 401) {   // token expired — sign out cleanly
                localStorage.removeItem('rn-auth-token');
                localStorage.removeItem('rn-auth-user');
                setCurrentUser(null);
            }
        });
    }

    // Restore auth session on mount, then refresh it from the server.
    useEffect(() => {
        const token = localStorage.getItem('rn-auth-token');
        const user  = localStorage.getItem('rn-auth-user');
        if (!token || !user) return;
        try { setCurrentUser(JSON.parse(user)); } catch {}
        tryClaimReferral();
        refreshUserFromServer();
    }, []);

    // Browser Back/Forward + section-anchor handling
    useEffect(() => {
        function onPop(e) {
            const loc = parseLocation();
            // Path-based routes (legal, coach) are authoritative; "/" falls back
            // to history state so the builder/dashboard views restore correctly.
            if (loc.view !== 'landing') {
                setView(loc.view); setParams(loc.params);
            } else {
                setView((e.state && e.state.view) || 'landing'); setParams({});
            }
            if (e.state && e.state.entryMode) setEntryMode(e.state.entryMode);
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
        setParams({});   // stale path params (e.g. ?mode=jobmatch) must not leak into state-driven views
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

    // Path-based navigation for Coach routes (e.g. nav('/coach/new')).
    function navPath(path) {
        window.history.pushState({}, '', path);
        const r = parseLocation();
        setView(r.view); setParams(r.params);
        window.scrollTo(0, 0);
    }

    function handleLogin() {
        const user = localStorage.getItem('rn-auth-user');
        if (user) { try { setCurrentUser(JSON.parse(user)); } catch {} }
        tryClaimReferral();
        refreshUserFromServer();   // popup cache is slim — pull referralCode/passType now
        // Return to wherever sign-in was requested from (e.g. /tracker's gate);
        // default: the builder.
        let returnTo = null;
        try { returnTo = localStorage.getItem('rn-return-to'); localStorage.removeItem('rn-return-to'); } catch {}
        if (returnTo) { navPath(returnTo); return; }
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

    if (view === 'coach-landing') {
        return <CoachLanding nav={navPath} currentUser={currentUser} onLogout={handleLogout} />;
    }
    if (view === 'coach-setup') {
        return <InterviewSetup nav={navPath} />;
    }
    if (view === 'coach-checkout') {
        return <CoachCheckout nav={navPath} />;
    }
    if (view === 'coach-session') {
        return params.mode === 'text'
            ? <TextInterview nav={navPath} id={params.id} />
            : <VoiceInterview nav={navPath} id={params.id} />;
    }
    if (view === 'coach-report') {
        return <InterviewReport nav={navPath} id={params.id} />;
    }
    if (view === 'coach-complete') {
        return <InterviewComplete nav={navPath} id={params.id} />;
    }
    if (view === 'coach-history') {
        return <InterviewHistory nav={navPath} currentUser={currentUser} />;
    }
    if (view === 'tracker') {
        return <Tracker nav={navPath} />;
    }
    if (view === 'tracker-job') {
        return <JobDetail nav={navPath} id={params.id} />;
    }
    if (view === 'admin') {
        return <AdminFounding nav={navPath} currentUser={currentUser} />;
    }

    if (view === 'builder') {
        return <ResumeBuilder
            initialMode={params.mode || entryMode}
            onGoToDashboard={goToDashboard}
            onGoToLanding={goToLanding}
        />;
    }

    if (view === 'dashboard') {
        return <Dashboard
            user={currentUser}
            onOpenBuilder={goToBuilder}
            onLogout={handleLogout}
            onNavigate={navPath}
        />;
    }

    return (
        <LandingPage
            onGetStarted={() => goToBuilder('gallery')}
            onStartAi={() => goToBuilder('ai')}
            onOpenJobMatch={() => goToBuilder('jobmatch')}
            onGoToDashboard={goToDashboard}
            onNavigate={navPath}
            onNavigateLegal={goToLegal}
            onLogin={handleLogin}
            onLogout={handleLogout}
            currentUser={currentUser}
        />
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
