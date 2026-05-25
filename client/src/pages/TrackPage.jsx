import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const STATUS_STEPS = [
  { key: 'pending', label: 'Request Received' },
  { key: 'dispatched', label: 'Technician Dispatched' },
  { key: 'en_route', label: 'En Route' },
  { key: 'arrived', label: 'Technician Arrived' },
  { key: 'completed', label: 'Service Complete' },
];

function statusIndex(status) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function TrackPage() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/requests/${requestId}`);
        const data = await res.json();
        if (active) setRequest(data);
      } catch (e) {
        if (active) setError('Could not load request');
      }
    }
    poll();
    const interval = setInterval(poll, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [requestId]);

  if (error) return <PageWrap><div style={styles.error}>{error}</div></PageWrap>;
  if (!request) return <PageWrap><div style={styles.loading}>Loading...</div></PageWrap>;

  const currentIdx = statusIndex(request.status);

  return (
    <PageWrap>
      <div style={styles.card}>
        <h2 style={styles.title}>Request #{request.id}</h2>
        <p style={styles.sub}>{request.serviceType.charAt(0).toUpperCase() + request.serviceType.slice(1)} service for {request.vehicleYear} {request.vehicleMake} {request.vehicleModel}</p>

        <div style={styles.timeline}>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step.key} style={styles.timelineRow}>
                <div style={styles.timelineLeft}>
                  <div style={{ ...styles.dot, background: done ? '#48bb78' : '#e2e8f0', border: active ? '3px solid #2f855a' : '2px solid transparent' }} />
                  {i < STATUS_STEPS.length - 1 && <div style={{ ...styles.line, background: i < currentIdx ? '#48bb78' : '#e2e8f0' }} />}
                </div>
                <span style={{ ...styles.stepLabel, fontWeight: active ? 600 : 400, color: done ? '#2d3748' : '#a0aec0' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {request.technician && (
          <div style={styles.techBox}>
            <strong>{request.technician.name}</strong>
            <span style={{ color: '#718096', fontSize: 14 }}>{request.technician.phone}</span>
            {request.technician.specialty && <span style={{ color: '#718096', fontSize: 13 }}>Specialty: {request.technician.specialty}</span>}
          </div>
        )}

        <p style={styles.refresh}>Status refreshes automatically every 10 seconds</p>
      </div>
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', justifyContent: 'center', padding: '40px 16px' }}><div style={{ width: '100%', maxWidth: 560 }}>{children}</div></div>;
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#718096', marginBottom: 32 },
  timeline: { margin: '0 0 24px' },
  timelineRow: { display: 'flex', alignItems: 'flex-start', gap: 16, minHeight: 48 },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 },
  dot: { width: 20, height: 20, borderRadius: '50%', flexShrink: 0 },
  line: { width: 2, flex: 1, minHeight: 24, marginTop: 2 },
  stepLabel: { paddingTop: 1, fontSize: 15 },
  techBox: { background: '#f7fafc', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 },
  refresh: { color: '#a0aec0', fontSize: 12, textAlign: 'center' },
  loading: { textAlign: 'center', padding: 40, color: '#718096' },
  error: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: 16, color: '#c53030' },
};
