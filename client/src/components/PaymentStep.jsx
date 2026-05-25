import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe publishable key — safe to expose to client
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function PaymentStep({ requestId, amountCents, serviceType, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch((e) => setError(e.message));
  }, [requestId]);

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.errorBox}>{error}</div>
        <p style={{ color: '#718096', fontSize: 14, marginTop: 12 }}>
          Make sure STRIPE_SECRET_KEY is set in .env and restart the server.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return <div style={styles.card}><div style={styles.loading}>Loading payment...</div></div>;
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Payment</h2>
      <div style={styles.summary}>
        <span>{serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service</span>
        <span style={styles.price}>${(amountCents / 100).toFixed(2)}</span>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <CheckoutForm requestId={requestId} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}

function CheckoutForm({ requestId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, paymentIntentId: paymentIntent.id }),
      });
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div style={styles.errorBox}>{error}</div>}
      <button type="submit" disabled={!stripe || loading} style={styles.btn}>
        {loading ? 'Processing...' : 'Pay & Confirm Request'}
      </button>
    </form>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  summary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f7fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 16 },
  price: { fontWeight: 700, fontSize: 20, color: '#1a56db' },
  loading: { textAlign: 'center', color: '#718096', padding: '40px 0' },
  errorBox: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '10px 14px', color: '#c53030', marginTop: 12, fontSize: 14 },
  btn: { width: '100%', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 20 },
};
