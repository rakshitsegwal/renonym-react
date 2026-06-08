import React, { useState } from 'react';
import { AuthModal } from './AuthModal.jsx';

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

const API_SECRET = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_SECRET
    : undefined;

const secureHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
    ...extra
});

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload  = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function PaymentButton({ planId, label, className, user, onSuccess, onError }) {
    const [loading, setLoading]         = useState(false);
    const [showAuth, setShowAuth]       = useState(false);
    const [authedUser, setAuthedUser]   = useState(user || null);

    // Use prop user or locally authed user
    const currentUser = authedUser || user;

    async function startPayment(loggedInUser) {
        setLoading(true);
        try {
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) throw new Error('Failed to load Razorpay. Check your internet connection.');

            const orderRes = await fetch(`${RAILWAY_URL}/create-order`, {
                method:  'POST',
                headers: secureHeaders(),
                body:    JSON.stringify({ planId, userId: loggedInUser?.id || null })
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

            await new Promise((resolve, reject) => {
                const options = {
                    key:         orderData.key_id,
                    amount:      orderData.amount,
                    currency:    orderData.currency,
                    order_id:    orderData.order_id,
                    name:        'Renonym AI',
                    description: label,
                    image:       'https://renonym.com/favicon.ico',
                    prefill: {
                        name:  loggedInUser?.name  || '',
                        email: loggedInUser?.email || '',
                    },
                    theme: { color: '#6d28d9' },

                    handler: async (response) => {
                        try {
                            const verifyRes = await fetch(`${RAILWAY_URL}/verify-payment`, {
                                method:  'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body:    JSON.stringify({
                                    razorpay_order_id:   response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature:  response.razorpay_signature,
                                    planId,
                                    userId: loggedInUser?.id || null
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
                            resolve(verifyData);
                        } catch (err) { reject(err); }
                    },

                    modal: { ondismiss: () => reject(new Error('CANCELLED')) }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response) => {
                    reject(new Error(response.error?.description || 'Payment failed'));
                });
                rzp.open();
            });

            if (onSuccess) onSuccess({ planId, user: loggedInUser });

        } catch (err) {
            if (err.message !== 'CANCELLED') {
                if (onError) onError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    function handleClick() {
        // Gate: must be logged in before paying
        if (!currentUser) {
            setShowAuth(true);
            return;
        }
        startPayment(currentUser);
    }

    function handleAuthSuccess(token, user) {
        // Store auth token
        localStorage.setItem('rn-auth-token', token);
        localStorage.setItem('rn-auth-user', JSON.stringify(user));
        setAuthedUser(user);
        setShowAuth(false);
        // Proceed straight to payment after login
        startPayment(user);
    }

    return (
        <>
            {showAuth && (
                <AuthModal
                    onAuth={handleAuthSuccess}
                    onClose={() => setShowAuth(false)}
                    reason="payment"
                />
            )}
            <button
                className={className}
                onClick={handleClick}
                disabled={loading}
            >
                {loading ? 'Processing…' : label}
            </button>
        </>
    );
}
