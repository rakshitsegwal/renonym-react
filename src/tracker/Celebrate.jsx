import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Badge } from '../coach/primitives.jsx';
import { getUser } from './api.js';

// Offer celebration — fires when a job moves to 'offer'. Pure celebration +
// the give-5/get-5 referral share. Never gates anything.
export default function Celebrate({ job, onClose }) {
    const [copied, setCopied] = useState(false);
    const user = getUser();
    const code = user?.referralCode || null;
    const link = code ? `https://renonym.com/?ref=${code}` : 'https://renonym.com';

    function copy() {
        try {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) { /* older browsers */ }
    }
    function share() {
        if (navigator.share) {
            navigator.share({ title: 'Renonym', text: 'I just landed an offer prepping with Renonym — this link gives us both 5 free AI credits:', url: link }).catch(() => {});
        } else copy();
    }

    return (
        <div className="rn-dark" style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(4,5,7,0.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="card-gold rel" style={{ width: '100%', maxWidth: 520, padding: '40px 32px', textAlign: 'center', borderColor: 'var(--gold-line)', overflow: 'hidden' }}>
                <div className="glow-gold" style={{ width: 420, height: 320, left: '50%', top: -140, transform: 'translateX(-50%)' }} />
                <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 14, right: 14, width: 32, padding: 0 }} onClick={onClose}><X size={15} /></button>
                <div className="rel">
                    <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 14 }}>🎉</div>
                    <Badge variant="gold" dot style={{ margin: '0 auto 14px' }}>Offer</Badge>
                    <h2 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 32, color: 'var(--text)', marginBottom: 8 }}>
                        Congratulations{user?.name ? `, ${(user.name).split(' ')[0]}` : ''}!
                    </h2>
                    <p className="lead" style={{ fontSize: 17, marginBottom: 26 }}>
                        An offer from <b style={{ color: 'var(--text)' }}>{job?.company || 'them'}</b>. You earned this.
                    </p>

                    {code && (
                        <div className="card-2" style={{ padding: 20, textAlign: 'left' }}>
                            <div className="label" style={{ marginBottom: 8 }}>Pay it forward — give 5, get 5</div>
                            <p className="sm" style={{ marginBottom: 14 }}>
                                Know someone still searching? Your link gives them <b style={{ color: 'var(--gold)' }}>5 free AI credits</b> — and you get 5 too when they sign up.
                            </p>
                            <div className="row gap-8 wrap-f">
                                <code className="fill" style={{ minWidth: 180, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-1)', border: '1px solid var(--line-2)', fontSize: 13, color: 'var(--gold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</code>
                                <button className="btn btn-ghost btn-sm none" onClick={copy}>{copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
                                <button className="btn btn-gold btn-sm none" onClick={share}>Share</button>
                            </div>
                        </div>
                    )}

                    <button className="btn btn-outline" style={{ marginTop: 22 }} onClick={onClose}>Back to the pipeline</button>
                </div>
            </div>
        </div>
    );
}
