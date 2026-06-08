import React, { useState, useEffect } from 'react';

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

// Load Razorpay checkout script once
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

// ─── PaymentButton ────────────────────────────────────────────────────────────
// Props:
//   planId      — 'pro_monthly' | 'pro_yearly' | 'team_monthly' | 'team_yearly'
//   label       — button text
//   className   — css class
//   user        — { id, name, email } from auth state (optional)
//   onSuccess   — callback(paymentResult) after verified payment
//   onError     — callback(errorMessage)

export default function PaymentButton({ planId, label, className, user, onSuccess, onError }) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            // 1. Load Razorpay SDK
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) {
                throw new Error('Failed to load Razorpay. Check your internet connection.');
            }

            // 2. Create order on our server
            const orderRes = await fetch(`${RAILWAY_URL}/create-order`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ planId, userId: user?.id || null })
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

            // 3. Open Razorpay checkout modal
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
                        name:  user?.name  || '',
                        email: user?.email || '',
                    },
                    theme:       { color: '#6d28d9' },

                    handler: async (response) => {
                        try {
                            // 4. Verify signature on our server
                            const verifyRes = await fetch(`${RAILWAY_URL}/verify-payment`, {
                                method:  'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body:    JSON.stringify({
                                    razorpay_order_id:   response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature:  response.razorpay_signature,
                                    planId,
                                    userId: user?.id || null
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

                            resolve(verifyData);
                        } catch (err) {
                            reject(err);
                        }
                    },

                    modal: {
                        ondismiss: () => reject(new Error('CANCELLED'))
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response) => {
                    reject(new Error(response.error?.description || 'Payment failed'));
                });
                rzp.open();
            });

            if (onSuccess) onSuccess({ planId });

        } catch (err) {
            if (err.message !== 'CANCELLED') {
                if (onError) onError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            className={className}
            onClick={handleClick}
            disabled={loading}
        >
            {loading ? 'Processing…' : label}
        </button>
    );
}
