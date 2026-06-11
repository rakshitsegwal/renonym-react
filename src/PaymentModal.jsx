import React, { useState } from 'react';

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

const API_SECRET = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_SECRET : undefined;

const secureHeaders = () => ({
    'Content-Type': 'application/json',
    ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {})
});

function loadRazorpay() {
    return new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });
}

export default function PaymentModal({ user, onSuccess, onClose, reason = 'download' }) {
    const [period, setPeriod] = useState('yearly');
    const [loading, setLoading] = useState(null);
    const [err, setErr] = useState('');

    const PLANS = {
        pro_monthly: { amount: 59900, label: '₹599/mo', price: 599, per: '/month' },
        pro_yearly:  { amount: 598800, label: '₹5,988/yr', price: 5988, per: '/year', equiv: '₹499/month, billed yearly' }
    };

    const triggerCopy = {
        download:   { icon: '⬇', text: 'Unlock your PDF download' },
        export:     { icon: '📄', text: 'Unlock your PDF/DOCX export' },
        ai_rewrite: { icon: '✦', text: 'Unlock AI Resume Rewrite' },
        interview:  { icon: '🎤', text: 'Unlock Interview Coach' },
        default:    { icon: '🔓', text: 'Unlock Pro features' },
    };
    const trigger = triggerCopy[reason] || triggerCopy.default;

    async function handlePay(planId) {
        setLoading(planId);
        setErr('');
        try {
            const sdkOk = await loadRazorpay();
            if (!sdkOk) throw new Error('Failed to load Razorpay. Check your connection.');

            const orderRes = await fetch(`${RAILWAY_URL}/create-order`, {
                method: 'POST', headers: secureHeaders(),
                body: JSON.stringify({ planId, userId: user?.id || null })
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

            await new Promise((resolve, reject) => {
                const rzp = new window.Razorpay({
                    key:         orderData.key_id,
                    amount:      orderData.amount,
                    currency:    orderData.currency,
                    order_id:    orderData.order_id,
                    name:        'Renonym AI',
                    description: PLANS[planId].label,
                    prefill:     { name: user?.name || '', email: user?.email || '' },
                    theme:       { color: '#E8C994' },
                    handler: async (response) => {
                        const verifyRes = await fetch(`${RAILWAY_URL}/verify-payment`, {
                            method: 'POST', headers: secureHeaders(),
                            body: JSON.stringify({
                                razorpay_order_id:   response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature:  response.razorpay_signature,
                                planId, userId: user?.id || null
                            })
                        });
                        const vd = await verifyRes.json();
                        if (!verifyRes.ok) reject(new Error(vd.error || 'Verification failed'));
                        else resolve(vd);
                    },
                    modal: { ondismiss: () => reject(new Error('CANCELLED')) }
                });
                rzp.on('payment.failed', e => reject(new Error(e.error?.description || 'Payment failed')));
                rzp.open();
            });

            if (onSuccess) onSuccess({ planId });
        } catch (e) {
            if (e.message !== 'CANCELLED') setErr(e.message);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="pm-modal">
                <button className="pm-modal__close" onClick={onClose}>✕</button>

                {/* LEFT: Blurred preview */}
                <div className="pm-modal__left">
                    <div className="pm-preview">
                        <div className="pm-preview__doc">
                            <div className="pm-preview__doc-header" />
                            {[100,80,65,90,72,58,84,68,76,60].map((w,i) => (
                                <div key={i} className="pm-preview__doc-line" style={{width:w+'%'}} />
                            ))}
                        </div>
                        <div className="pm-preview__blur" />
                        <div className="pm-preview__lock">
                            <div className="pm-preview__lock-icon">🔒</div>
                            <div className="pm-preview__lock-text">{trigger.icon} {trigger.text}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Pricing */}
                <div className="pm-modal__right">
                    <div className="pm-modal__tag">One last step</div>
                    <h2 className="pm-modal__h2">Unlock your resume.<br />Start applying today.</h2>
                    <p className="pm-modal__sub">Your resume, ATS analysis, and design customisation are all saved and waiting.</p>

                    <div className="pm-toggle">
                        <button className={`pm-t-btn${period==='monthly'?' pm-t-btn--on':''}`} onClick={() => setPeriod('monthly')}>Monthly</button>
                        <button className={`pm-t-btn${period==='yearly'?' pm-t-btn--on':''}`} onClick={() => setPeriod('yearly')}>
                            Yearly <span className="pm-t-btn__save">Best value</span>
                        </button>
                    </div>

                    {period === 'yearly' ? (
                        <div className="pm-plan pm-plan--featured">
                            <div className="pm-plan__tag">Most popular · Save 16%</div>
                            <div className="pm-plan__price">₹5,988<span className="pm-plan__per">/year</span></div>
                            <div className="pm-plan__equiv">₹499/month, billed yearly</div>
                            <ul className="pm-plan__feats">
                                {['Unlimited PDF & DOCX export','No watermarks','AI style generator','AI resume rewrite','Job match optimizer','All future features'].map(f => (
                                    <li key={f}><span>✓</span>{f}</li>
                                ))}
                            </ul>
                            <button
                                className="pm-pay-btn"
                                onClick={() => handlePay('pro_yearly')}
                                disabled={loading === 'pro_yearly'}
                            >
                                {loading === 'pro_yearly' ? 'Processing…' : 'Unlock for ₹5,988/year →'}
                            </button>
                        </div>
                    ) : (
                        <div className="pm-plan">
                            <div className="pm-plan__price">₹599<span className="pm-plan__per">/month</span></div>
                            <ul className="pm-plan__feats">
                                {['Unlimited PDF & DOCX export','No watermarks','AI style generator','AI resume rewrite','Job match optimizer'].map(f => (
                                    <li key={f}><span>✓</span>{f}</li>
                                ))}
                            </ul>
                            <button
                                className="pm-pay-btn"
                                onClick={() => handlePay('pro_monthly')}
                                disabled={loading === 'pro_monthly'}
                            >
                                {loading === 'pro_monthly' ? 'Processing…' : 'Unlock for ₹599/month →'}
                            </button>
                        </div>
                    )}

                    {err && <div className="pm-err">{err}</div>}

                    <div className="pm-trust">
                        <span>🔒 Secured by Razorpay</span>
                        <span>7-day money-back</span>
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
