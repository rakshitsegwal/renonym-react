import React, { useState, useEffect } from 'react';
import { adminFounding } from './coach/api.js';

// Admin-only view of the Founding User Beta Program. Access is enforced
// server-side (requireAuth + ADMIN_EMAILS allowlist); this just renders the
// data or a 403 message.
export default function AdminFounding({ nav, currentUser }) {
    const [data, setData] = useState(null);
    const [err, setErr]   = useState('');

    useEffect(() => {
        let alive = true;
        adminFounding()
            .then(d => { if (alive) setData(d); })
            .catch(e => { if (alive) setErr(e.status === 403 ? 'forbidden' : (e.message || 'Failed to load.')); });
        return () => { alive = false; };
    }, []);

    if (err === 'forbidden') {
        return (
            <div className="rn-dark" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
                <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 420 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                    <h2 className="h3" style={{ marginBottom: 8 }}>Admins only</h2>
                    <p className="sm" style={{ marginBottom: 20 }}>Your account isn’t on the admin allowlist.</p>
                    <button className="btn btn-outline" onClick={() => nav('/dashboard')}>Back to dashboard</button>
                </div>
            </div>
        );
    }

    const a = data?.analytics;
    const fmt = (d) => { try { return d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'; } catch { return '—'; } };

    return (
        <div className="rn-dark" style={{ minHeight: '100vh', padding: '32px 24px' }}>
            <div className="wrap-wide">
                <div className="row ac jsb" style={{ marginBottom: 24 }}>
                    <div>
                        <div className="label" style={{ color: 'var(--gold)' }}>Admin</div>
                        <h1 className="h2" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, marginTop: 4 }}>Founding User Beta</h1>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav('/dashboard')}>← Dashboard</button>
                </div>

                {err && err !== 'forbidden' && <p className="sm" style={{ color: 'var(--rose)', marginBottom: 16 }}>{err}</p>}
                {!data && !err && <p className="sm">Loading…</p>}

                {data && (
                    <>
                        <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', marginBottom: 24 }}>
                            <Stat label="Claimed" value={`${data.claimed} / ${data.cap}`} gold />
                            <Stat label="Slots left" value={data.remaining} />
                            <Stat label="Verified" value={`${a.verificationRate}%`} />
                            <Stat label="Trial activated" value={`${a.trialActivationRate}%`} />
                            <Stat label="Converted to paid" value={`${a.conversionRate}%`} gold />
                            <Stat label="Used 30% discount" value={`${a.discountRedemptionRate}%`} />
                        </div>

                        {a.topFeatures?.length > 0 && (
                            <div className="card" style={{ padding: 18, marginBottom: 24 }}>
                                <div className="label" style={{ marginBottom: 10 }}>Most-used features during trials</div>
                                <div className="row gap-8 wrap-f">
                                    {a.topFeatures.map((f, i) => (
                                        <span key={i} className="chip">{(f.reason || '').replace('spend:/', '')} · {f.n}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="card" style={{ padding: '6px 4px', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--faint)' }}>
                                        {['#', 'Email', 'Verified', 'Trial ends', 'Trial', 'Actions', 'Discount', 'Converted'].map(h =>
                                            <th key={h} style={{ padding: '10px 14px', fontWeight: 500, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.04em' }}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.users.map((u, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                                            <td style={{ padding: '10px 14px', color: 'var(--gold)', fontWeight: 600 }}>{u.founding_number}</td>
                                            <td style={{ padding: '10px 14px' }}>{u.email}</td>
                                            <td style={{ padding: '10px 14px' }}>{u.email_verified ? '✅' : '—'}</td>
                                            <td style={{ padding: '10px 14px' }}>{fmt(u.trial_ends_at)}</td>
                                            <td style={{ padding: '10px 14px' }}>{u.trial_active ? <span style={{ color: 'var(--green)' }}>active</span> : <span className="faint">ended</span>}</td>
                                            <td style={{ padding: '10px 14px' }}>{u.trial_actions}</td>
                                            <td style={{ padding: '10px 14px' }}>{u.founding_discount_used ? 'used' : '—'}</td>
                                            <td style={{ padding: '10px 14px' }}>{u.converted ? <span style={{ color: 'var(--gold)' }}>paid</span> : '—'}</td>
                                        </tr>
                                    ))}
                                    {data.users.length === 0 && (
                                        <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--faint)' }}>No founding users yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value, gold }) {
    return (
        <div className="card" style={{ padding: '16px 18px' }}>
            <div className="label">{label}</div>
            <div className={'h3' + (gold ? ' gold' : '')} style={{ marginTop: 6 }}>{value}</div>
        </div>
    );
}
