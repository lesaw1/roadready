import { useState } from 'react';

const SERVICE_TYPES = [
  { value: 'battery', label: 'Jump Start', price: '$75', icon: '🔋' },
  { value: 'tire', label: 'Flat Tire', price: '$60', icon: '🛞' },
  { value: 'fuel', label: 'Fuel Delivery', price: '$50', icon: '⛽' },
  { value: 'other', label: 'Other', price: '$80', icon: '🔧' },
];

const initialForm = {
  customerName: '', customerPhone: '', customerEmail: '',
  vehicleMake: '', vehicleModel: '', vehicleYear: '', vehicleColor: '',
  serviceType: '', description: '', locationAddress: '',
};

export default function ServiceRequestForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!form.customerPhone.trim()) e.customerPhone = 'Phone is required';
    if (!form.vehicleMake.trim()) e.vehicleMake = 'Make is required';
    if (!form.vehicleModel.trim()) e.vehicleModel = 'Model is required';
    if (!form.vehicleYear.trim()) e.vehicleYear = 'Year is required';
    if (!form.serviceType) e.serviceType = 'Please select a service';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setApiError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <h2 style={styles.title}>Request Roadside Assistance</h2>

      <Section label="Service Needed">
        <div style={styles.serviceGrid}>
          {SERVICE_TYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, serviceType: s.value }))}
              style={{
                ...styles.serviceCard,
                ...(form.serviceType === s.value ? styles.serviceCardActive : {}),
              }}
            >
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <span style={styles.serviceLabel}>{s.label}</span>
              <span style={styles.servicePrice}>{s.price}</span>
            </button>
          ))}
        </div>
        {errors.serviceType && <ErrorMsg msg={errors.serviceType} />}
      </Section>

      <Section label="Your Information">
        <div style={styles.row}>
          <Field label="Full Name" error={errors.customerName}>
            <input style={styles.input} value={form.customerName} onChange={set('customerName')} placeholder="Jane Smith" />
          </Field>
          <Field label="Phone Number" error={errors.customerPhone}>
            <input style={styles.input} value={form.customerPhone} onChange={set('customerPhone')} placeholder="+1 (555) 000-0000" type="tel" />
          </Field>
        </div>
        <Field label="Email (optional)">
          <input style={styles.input} value={form.customerEmail} onChange={set('customerEmail')} placeholder="jane@example.com" type="email" />
        </Field>
      </Section>

      <Section label="Vehicle Details">
        <div style={styles.row}>
          <Field label="Make" error={errors.vehicleMake}>
            <input style={styles.input} value={form.vehicleMake} onChange={set('vehicleMake')} placeholder="Toyota" />
          </Field>
          <Field label="Model" error={errors.vehicleModel}>
            <input style={styles.input} value={form.vehicleModel} onChange={set('vehicleModel')} placeholder="Camry" />
          </Field>
        </div>
        <div style={styles.row}>
          <Field label="Year" error={errors.vehicleYear}>
            <input style={styles.input} value={form.vehicleYear} onChange={set('vehicleYear')} placeholder="2020" maxLength={4} />
          </Field>
          <Field label="Color (optional)">
            <input style={styles.input} value={form.vehicleColor} onChange={set('vehicleColor')} placeholder="Silver" />
          </Field>
        </div>
      </Section>

      <Section label="Location">
        <Field label="Address or Landmark">
          <input style={styles.input} value={form.locationAddress} onChange={set('locationAddress')} placeholder="123 Main St or 'Near highway exit 5'" />
        </Field>
      </Section>

      <Section label="Additional Details">
        <textarea
          style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
          value={form.description}
          onChange={set('description')}
          placeholder="Describe your situation..."
        />
      </Section>

      {apiError && <div style={styles.apiError}>{apiError}</div>}

      <button type="submit" style={styles.submitBtn} disabled={loading}>
        {loading ? 'Submitting...' : 'Continue to Payment →'}
      </button>
    </form>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={styles.sectionLabel}>{label}</h3>
      {children}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

function ErrorMsg({ msg }) {
  return <span style={styles.error}>{msg}</span>;
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 12 },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  serviceCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', border: '2px solid #e2e8f0', borderRadius: 10, background: '#fff', cursor: 'pointer', transition: 'all 0.15s', gap: 4 },
  serviceCardActive: { border: '2px solid #1a56db', background: '#ebf5ff' },
  serviceLabel: { fontSize: 13, fontWeight: 600, color: '#2d3748' },
  servicePrice: { fontSize: 12, color: '#718096' },
  row: { display: 'flex', gap: 12, marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 4 },
  input: { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  error: { display: 'block', color: '#e53e3e', fontSize: 12, marginTop: 2 },
  apiError: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '10px 14px', color: '#c53030', marginBottom: 16, fontSize: 14 },
  submitBtn: { width: '100%', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
};
