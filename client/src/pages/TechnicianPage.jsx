import { useState, useEffect } from 'react';

const JOB_STATUSES = ['assigned', 'accepted', 'en_route', 'arrived', 'completed'];

const STATUS_LABELS = {
  assigned: 'New Job',
  accepted: 'Accepted',
  en_route: 'En Route',
  arrived: 'Arrived',
  completed: 'Completed',
};

const STATUS_COLORS = {
  assigned: '#ed8936',
  accepted: '#4299e1',
  en_route: '#805ad5',
  arrived: '#38b2ac',
  completed: '#48bb78',
};

const REQUEST_STATUS_COLORS = {
  pending: '#ed8936',
  dispatched: '#4299e1',
  en_route: '#805ad5',
  arrived: '#38b2ac',
  completed: '#48bb78',
  cancelled: '#e53e3e',
};

export default function TechnicianPage() {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(false);
  const [newTech, setNewTech] = useState({ name: '', phone: '', specialty: '' });
  const [showNewTech, setShowNewTech] = useState(false);

  useEffect(() => {
    fetchTechnicians();
    fetchAllRequests();
  }, []);

  useEffect(() => {
    if (selectedTech) fetchJobs(selectedTech.id);
  }, [selectedTech]);

  async function fetchTechnicians() {
    const res = await fetch('/api/technicians');
    const data = await res.json();
    setTechnicians(data);
    if (data.length && !selectedTech) setSelectedTech(data[0]);
  }

  async function fetchJobs(techId) {
    setLoading(true);
    const res = await fetch(`/api/jobs/technician/${techId}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }

  async function fetchAllRequests() {
    const res = await fetch('/api/requests');
    const data = await res.json();
    setAllRequests(data);
  }

  async function updateJobStatus(jobId, status) {
    await fetch(`/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (selectedTech) fetchJobs(selectedTech.id);
    fetchAllRequests();
  }

  async function assignTech(requestId) {
    if (!selectedTech) return;
    await fetch(`/api/technicians/${selectedTech.id}/assign/${requestId}`, { method: 'POST' });
    fetchJobs(selectedTech.id);
    fetchAllRequests();
  }

  async function createTechnician() {
    if (!newTech.name || !newTech.phone) return;
    await fetch('/api/technicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTech),
    });
    setNewTech({ name: '', phone: '', specialty: '' });
    setShowNewTech(false);
    fetchTechnicians();
  }

  const pendingRequests = allRequests.filter((r) => r.status === 'pending');
  const activeJobs = jobs.filter((j) => j.status !== 'completed');
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Technicians</h3>
          <button onClick={() => setShowNewTech(!showNewTech)} style={styles.addBtn}>+ Add</button>
        </div>

        {showNewTech && (
          <div style={styles.newTechForm}>
            <input style={styles.input} placeholder="Name" value={newTech.name} onChange={(e) => setNewTech((t) => ({ ...t, name: e.target.value }))} />
            <input style={styles.input} placeholder="Phone" value={newTech.phone} onChange={(e) => setNewTech((t) => ({ ...t, phone: e.target.value }))} />
            <input style={styles.input} placeholder="Specialty (optional)" value={newTech.specialty} onChange={(e) => setNewTech((t) => ({ ...t, specialty: e.target.value }))} />
            <button onClick={createTechnician} style={styles.saveBtn}>Save</button>
          </div>
        )}

        {technicians.map((tech) => (
          <div
            key={tech.id}
            onClick={() => setSelectedTech(tech)}
            style={{ ...styles.techItem, ...(selectedTech?.id === tech.id ? styles.techItemActive : {}) }}
          >
            <div style={styles.techAvatar}>{tech.name[0]}</div>
            <div>
              <div style={styles.techName}>{tech.name}</div>
              <div style={styles.techMeta}>{tech.specialty || 'General'}</div>
            </div>
          </div>
        ))}

        {technicians.length === 0 && <p style={styles.emptyMeta}>No technicians yet</p>}
      </div>

      <div style={styles.main}>
        <div style={styles.tabs}>
          {[['jobs', 'My Jobs'], ['requests', `Incoming Requests${pendingRequests.length ? ` (${pendingRequests.length})` : ''}`], ['all', 'All Requests']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'jobs' && (
          <div>
            <h3 style={styles.sectionTitle}>Active Jobs {selectedTech ? `— ${selectedTech.name}` : ''}</h3>
            {loading && <p style={styles.loadingMsg}>Loading...</p>}
            {!loading && activeJobs.length === 0 && <EmptyState text="No active jobs" />}
            {activeJobs.map((job) => <JobCard key={job.id} job={job} onStatusChange={updateJobStatus} />)}

            {completedJobs.length > 0 && (
              <>
                <h3 style={{ ...styles.sectionTitle, marginTop: 32 }}>Completed</h3>
                {completedJobs.map((job) => <JobCard key={job.id} job={job} onStatusChange={updateJobStatus} />)}
              </>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h3 style={styles.sectionTitle}>Pending Requests — Assign to {selectedTech?.name || 'a technician'}</h3>
            {pendingRequests.length === 0 && <EmptyState text="No pending requests" />}
            {pendingRequests.map((req) => (
              <RequestCard key={req.id} request={req}>
                <button
                  onClick={() => assignTech(req.id)}
                  style={styles.assignBtn}
                  disabled={!selectedTech}
                >
                  Assign to {selectedTech?.name || '—'}
                </button>
              </RequestCard>
            ))}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h3 style={styles.sectionTitle}>All Service Requests</h3>
            {allRequests.length === 0 && <EmptyState text="No requests yet" />}
            {allRequests.map((req) => <RequestCard key={req.id} request={req} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, onStatusChange }) {
  const req = job.serviceRequest;
  const nextStatuses = JOB_STATUSES.slice(JOB_STATUSES.indexOf(job.status) + 1);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <span style={{ ...styles.badge, background: STATUS_COLORS[job.status] }}>{STATUS_LABELS[job.status]}</span>
          <span style={styles.reqId}>Request #{req.id}</span>
        </div>
        <span style={styles.service}>{req.serviceType}</span>
      </div>
      <div style={styles.cardBody}>
        <InfoRow label="Customer" value={req.customerName} />
        <InfoRow label="Phone" value={req.customerPhone} />
        <InfoRow label="Vehicle" value={`${req.vehicleYear} ${req.vehicleMake} ${req.vehicleModel}${req.vehicleColor ? ` (${req.vehicleColor})` : ''}`} />
        {req.locationAddress && <InfoRow label="Location" value={req.locationAddress} />}
        {req.description && <InfoRow label="Notes" value={req.description} />}
      </div>
      {nextStatuses.length > 0 && (
        <div style={styles.cardActions}>
          {nextStatuses.map((s) => (
            <button key={s} onClick={() => onStatusChange(job.id, s)} style={{ ...styles.statusBtn, background: STATUS_COLORS[s] }}>
              Mark {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <span style={{ ...styles.badge, background: REQUEST_STATUS_COLORS[request.status] || '#718096' }}>
            {request.status}
          </span>
          <span style={styles.reqId}>Request #{request.id}</span>
        </div>
        <span style={styles.service}>{request.serviceType}</span>
      </div>
      <div style={styles.cardBody}>
        <InfoRow label="Customer" value={request.customerName} />
        <InfoRow label="Phone" value={request.customerPhone} />
        <InfoRow label="Vehicle" value={`${request.vehicleYear} ${request.vehicleMake} ${request.vehicleModel}`} />
        {request.locationAddress && <InfoRow label="Location" value={request.locationAddress} />}
        {request.technician && <InfoRow label="Assigned to" value={request.technician.name} />}
        {request.amountCents && <InfoRow label="Amount" value={`$${(request.amountCents / 100).toFixed(2)}`} />}
      </div>
      {children && <div style={styles.cardActions}>{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={styles.empty}>{text}</div>;
}

const styles = {
  page: { display: 'flex', minHeight: 'calc(100vh - 68px)' },
  sidebar: { width: 240, background: '#fff', borderRight: '1px solid #e2e8f0', padding: 16, flexShrink: 0, overflowY: 'auto' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sidebarTitle: { fontSize: 14, fontWeight: 600, color: '#4a5568' },
  addBtn: { background: '#1a56db', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  newTechForm: { background: '#f7fafc', borderRadius: 8, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  input: { border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px', fontSize: 13, width: '100%' },
  saveBtn: { background: '#48bb78', color: '#fff', border: 'none', borderRadius: 6, padding: '6px', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  techItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 4 },
  techItemActive: { background: '#ebf5ff' },
  techAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#1a56db', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  techName: { fontSize: 14, fontWeight: 600 },
  techMeta: { fontSize: 12, color: '#718096' },
  emptyMeta: { fontSize: 13, color: '#a0aec0', textAlign: 'center', marginTop: 16 },
  main: { flex: 1, padding: 24, overflowY: 'auto' },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #e2e8f0' },
  tab: { padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#718096', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#1a56db', borderBottomColor: '#1a56db' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#2d3748' },
  loadingMsg: { color: '#718096', fontSize: 14 },
  card: { background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12, overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f7fafc', borderBottom: '1px solid #e2e8f0' },
  badge: { color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.5px' },
  reqId: { color: '#718096', fontSize: 13, marginLeft: 10 },
  service: { fontSize: 13, fontWeight: 500, color: '#4a5568', textTransform: 'capitalize' },
  cardBody: { padding: '12px 16px' },
  infoRow: { display: 'flex', gap: 8, marginBottom: 4 },
  infoLabel: { fontSize: 12, color: '#a0aec0', width: 80, flexShrink: 0 },
  infoValue: { fontSize: 13, color: '#2d3748' },
  cardActions: { display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' },
  statusBtn: { color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  assignBtn: { background: '#1a56db', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#a0aec0', padding: '40px 0', fontSize: 14 },
};
