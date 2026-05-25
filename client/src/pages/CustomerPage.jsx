import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceRequestForm from '../components/ServiceRequestForm';
import PaymentStep from '../components/PaymentStep';

const STEPS = ['Service Info', 'Payment', 'Confirmation'];

export default function CustomerPage() {
  const [step, setStep] = useState(0);
  const [requestData, setRequestData] = useState(null);
  const [createdRequest, setCreatedRequest] = useState(null);
  const navigate = useNavigate();

  async function handleFormSubmit(formData) {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create request');
    }
    const data = await res.json();
    setCreatedRequest(data);
    setRequestData(formData);
    setStep(1);
  }

  function handlePaymentSuccess() {
    setStep(2);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <ServiceRequestForm onSubmit={handleFormSubmit} />
        )}

        {step === 1 && createdRequest && (
          <PaymentStep
            requestId={createdRequest.id}
            amountCents={createdRequest.amountCents}
            serviceType={createdRequest.serviceType}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {step === 2 && createdRequest && (
          <Confirmation
            request={createdRequest}
            customerEmail={requestData?.customerEmail}
            onTrack={() => navigate(`/track/${createdRequest.id}`)}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ steps, current }) {
  return (
    <div style={styles.stepper}>
      {steps.map((s, i) => (
        <div key={s} style={styles.stepItem}>
          <div style={{ ...styles.stepCircle, background: i <= current ? '#1a56db' : '#e2e8f0', color: i <= current ? '#fff' : '#718096' }}>
            {i + 1}
          </div>
          <span style={{ ...styles.stepLabel, color: i === current ? '#1a56db' : '#718096' }}>{s}</span>
          {i < steps.length - 1 && <div style={{ ...styles.stepLine, background: i < current ? '#1a56db' : '#e2e8f0' }} />}
        </div>
      ))}
    </div>
  );
}

function Confirmation({ request, customerEmail, onTrack }) {
  return (
    <div style={styles.card}>
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={styles.checkmark}>✓</div>
        <h2 style={styles.confirmTitle}>Request Confirmed!</h2>
        <p style={styles.confirmSub}>Request #{request.id} — A technician has been notified and will contact you shortly.</p>

        <div style={styles.notifList}>
          <div style={styles.notifRow}>
            <span style={styles.notifIcon}>💬</span>
            <span>Confirmation SMS sent to <strong>{request.customerPhone}</strong></span>
          </div>
          {customerEmail ? (
            <div style={styles.notifRow}>
              <span style={styles.notifIcon}>✉️</span>
              <span>Confirmation email sent to <strong>{customerEmail}</strong></span>
            </div>
          ) : (
            <div style={{ ...styles.notifRow, opacity: 0.5 }}>
              <span style={styles.notifIcon}>✉️</span>
              <span>No email provided — <a href="#" onClick={e => e.preventDefault()} style={{ color: '#1a56db' }}>add one next time</a> for a receipt</span>
            </div>
          )}
        </div>

        <button onClick={onTrack} style={styles.btn}>Track My Request</button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 68px)', display: 'flex', justifyContent: 'center', padding: '40px 16px' },
  container: { width: '100%', maxWidth: 640 },
  stepper: { display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 },
  stepItem: { display: 'flex', alignItems: 'center', flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 },
  stepLabel: { fontSize: 12, fontWeight: 500, marginLeft: 8, whiteSpace: 'nowrap' },
  stepLine: { flex: 1, height: 2, margin: '0 8px' },
  card: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  checkmark: { width: 64, height: 64, background: '#48bb78', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', margin: '0 auto 20px' },
  confirmTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  confirmSub: { color: '#4a5568', marginBottom: 20 },
  notifList: { display: 'inline-flex', flexDirection: 'column', gap: 10, background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 20px', marginBottom: 24, textAlign: 'left' },
  notifRow: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#4a5568' },
  notifIcon: { fontSize: 18, flexShrink: 0 },
  btn: { background: '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
};
