import { useState, useEffect } from 'react';
import { getJobs, createJob, deleteJob, updateJob } from '../services/jobs';
import { getRecruiterDashboard, getApplicationsForRecruiter, updateApplicationStatus } from '../services/recruiterDashboard';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

// ─── Constantes ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', description: '', companyName: '',
  location: '', contractType: 'CDI', experience: '',
  isRemote: false, skillsInput: '',
};

const STATUS_CONFIG = {
  pending:   { label: 'En attente', bg: '#FEF3C7', color: '#92400E', dot: '#D97706'  },
  reviewed:  { label: 'Consultée',  bg: '#DBEAFE', color: '#1e40af', dot: '#2563EB'  },
  interview: { label: 'Entretien',  bg: '#F3E8FF', color: '#5b21b6', dot: '#7C3AED'  },
  accepted:  { label: 'Acceptée',   bg: '#D1FAE5', color: '#065f46', dot: '#059669'  },
  rejected:  { label: 'Refusée',    bg: '#FEE2E2', color: '#991b1b', dot: '#DC2626'  },
};

const CONTRACT_COLORS = {
  CDI:        { bg: '#E6F1FB', color: '#0C447C' },
  CDD:        { bg: '#FEF3C7', color: '#92400E' },
  Stage:      { bg: '#F3E8FF', color: '#5b21b6' },
  Freelance:  { bg: '#D1FAE5', color: '#065f46' },
  Alternance: { bg: '#F1EFE8', color: '#444441' },
};

// Génère initiales + couleur avatar à partir du nom d'entreprise
const AVATAR_COLORS = [
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#EAF3DE', color: '#3B6D11' },
  { bg: '#F3E8FF', color: '#5b21b6' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#FCEBEB', color: '#991b1b' },
  { bg: '#F1EFE8', color: '#444441' },
  { bg: '#E1F5EE', color: '#085041' },
];

function getAvatar(name = '') {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return { initials, ...AVATAR_COLORS[idx] };
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysAgo(d) {
  if (!d) return '';
  const diff = Math.ceil(Math.abs(new Date() - new Date(d)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return `Il y a ${diff}j`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page:        { minHeight: '100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', fontFamily: 'Inter, system-ui, sans-serif' },
  topbar:      { background: '#0B0D17', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 },
  topbarInner: { maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandIcon:   { width: 30, height: 30, borderRadius: 8, background: '#5E42F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  brandName:   { fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.3px', cursor: 'pointer' },
  divider:     { width: 1, height: 16, background: 'rgba(255,255,255,.12)', margin: '0 6px' },
  roleTag:     { fontSize: 11, fontWeight: 700, color: '#FFFFFF', background: 'rgba(255,255,255,.12)', padding: '3px 8px', borderRadius: 4, letterSpacing: '.04em', textTransform: 'uppercase' },
  logoutBtn:   { fontSize: 13, color: '#A0AAB2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 },
  inner:       { maxWidth: 1200, margin: '0 auto', padding: '40px 2rem 60px' },
  eyebrow:     { fontSize: 11, fontWeight: 700, color: '#5E42F5', textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' },
  pageTitle:   { fontSize: 28, fontWeight: 700, color: '#0B0D17', letterSpacing: '-.5px', margin: '0 0 4px' },
  pageSub:     { fontSize: 14, color: '#6b7280', margin: 0 },
  // Stats
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 },
  statCard:    { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 20, padding: '20px 16px', position: 'relative', overflow: 'hidden' },
  statAccent:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 20px 20px' },
  statLabel:   { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 },
  statSub:     { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  // Tabs
  tabsWrap:    { display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid #e5e7eb', paddingBottom: 0 },
  // Tableaux
  tableWrap:   { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 20, overflow: 'hidden' },
  th:          { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', padding: '11px 18px', textAlign: 'left', background: '#f8fafc', borderBottom: '0.5px solid #e5e7eb' },
  td:          { padding: '15px 18px', verticalAlign: 'middle' },
  badge:       { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
  dot:         { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  // Btns
  btnPrimary:  { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, background: '#5E42F5', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnEdit:     { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#E6F1FB', color: '#0C447C', border: '0.5px solid #B5D4F4', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger:   { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#FEF2F2', color: '#B91C1C', border: '0.5px solid #FECACA', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  // Modal
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(12,31,60,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' },
  modal:       { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: '36px 32px', boxSizing: 'border-box' },
  label:       { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input:       { display: 'block', width: '100%', padding: '10px 14px', fontSize: 13, color: '#111', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  // Empty
  emptyCard:   { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 20, padding: '60px 24px', textAlign: 'center' },
  emptyIcon:   { width: 56, height: 56, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accentColor, valueColor }) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>
        <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, color: valueColor || '#0B0D17' }}>
        {value ?? '—'}
      </div>
      <div style={S.statSub}>{sub}</div>
      <div style={{ ...S.statAccent, background: accentColor }} />
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '12px 18px',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? '#0B0D17' : '#9ca3af',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #5E42F5' : '2px solid transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        marginBottom: -1,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        transition: 'color .15s',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ ...S.badge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.dot}30` }}>
      <span style={{ ...S.dot, background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const [activeTab, setActiveTab]                     = useState('overview');
  const [stats, setStats]                             = useState(null);
  const [myJobs, setMyJobs]                           = useState([]);
  const [applications, setApplications]               = useState([]);
  const [selectedJobFilter, setSelectedJobFilter]     = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState('');
  const [isModalOpen, setIsModalOpen]                 = useState(false);
  const [editingJobId, setEditingJobId]               = useState(null);
  const [formData, setFormData]                       = useState(EMPTY_FORM);
  const [hoveredRow, setHoveredRow]                   = useState(null);

  const navigate   = useNavigate();
  const userName   = localStorage.getItem('userName');

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab, selectedJobFilter, selectedStatusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashData, jobsData] = await Promise.all([
        getRecruiterDashboard(),
        getJobs(),
      ]);
      setStats(dashData.stats);
      setMyJobs(jobsData.data || jobsData || []);
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await getApplicationsForRecruiter(selectedJobFilter, selectedStatusFilter);
      setApplications(data.applications || []);
    } catch {
      setError('Erreur lors du chargement des candidatures');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditClick = (job) => {
    setEditingJobId(job._id);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      companyName: job.company?.name || '',
      location: job.location || '',
      contractType: job.contractType || 'CDI',
      experience: job.experience || '',
      isRemote: job.isRemote || false,
      skillsInput: job.skills ? job.skills.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingJobId(null);
    setFormData(EMPTY_FORM);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      contractType: formData.contractType,
      experience: formData.experience,
      isRemote: formData.isRemote,
      company: { name: formData.companyName },
      skills: formData.skillsInput
        ? formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editingJobId) await updateJob(editingJobId, payload);
      else await createJob(payload);
      resetForm();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await deleteJob(jobId);
      setMyJobs((prev) => prev.filter((j) => j._id !== jobId));
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      fetchApplications();
    } catch {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleLogout = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  // ── Loader ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: '3px solid #378ADD', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Chargement du tableau de bord…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const appsByStatus = stats?.applicationsByStatus || {};
  const totalApps    = stats?.totalApplications || 0;
  const conversionRate = totalApps
    ? Math.round(((appsByStatus.accepted || 0) / totalApps) * 100)
    : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select:focus, input:focus, textarea:focus { border-color: #378ADD !important; box-shadow: 0 0 0 3px rgba(55,138,221,.1); }
        .modal-select { padding: 9px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #d1d5db; font-family: inherit; background: #fff; cursor: pointer; color: #111; width: 100%; box-sizing: border-box; }
        .app-select { padding: 6px 10px; font-size: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-family: inherit; background: #fff; cursor: pointer; color: #374151; }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={S.brandIcon} onClick={() => navigate('/')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span style={S.brandName} onClick={() => navigate('/')}>JobBoard</span>
            <div style={S.divider} />
            <span style={S.roleTag}>Recruteur</span>
            {userName && (
              <>
                <div style={S.divider} />
                <span style={{ fontSize: 13, color: '#A0AAB2' }}>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{userName}</span>
                </span>
              </>
            )}
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>
            Déconnexion
            <i className="ti ti-logout" style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div style={S.inner}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={S.eyebrow}>Espace Recruteur</p>
            <h1 style={S.pageTitle}>Tableau de bord</h1>
            <p style={S.pageSub}>Gérez vos offres et suivez vos candidatures</p>
          </div>
          <button style={S.btnPrimary} onClick={() => { setActiveTab('jobs'); setIsModalOpen(true); }}>
            <i className="ti ti-plus" style={{ fontSize: 15 }} aria-hidden="true" />
            Publier une offre
          </button>
        </div>

        {/* ── ERREUR ── */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#B91C1C', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 16 }} aria-hidden="true" />
            {error}
            <button onClick={fetchDashboardData} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
              Réessayer
            </button>
          </div>
        )}

        {/* ── STATS CARDS ── */}
        <div style={S.statsGrid}>
          <StatCard icon="ti-clipboard-list"  label="Offres publiées"   value={stats?.totalJobs}               sub="Annonces actives"      accentColor="#5E42F5" valueColor="#0B0D17" />
          <StatCard icon="ti-inbox"           label="Candidatures"      value={totalApps}                      sub="Reçues au total"        accentColor="#10B981" valueColor="#0C1F3C" />
          <StatCard icon="ti-clock"           label="En attente"        value={appsByStatus.pending}            sub="À examiner"            accentColor="#D97706" valueColor="#D97706" />
          <StatCard icon="ti-microphone"      label="Entretiens"        value={appsByStatus.interview}          sub="Planifiés"             accentColor="#7C3AED" valueColor="#7C3AED" />
          <StatCard icon="ti-circle-check"    label="Acceptées"         value={appsByStatus.accepted}           sub={`${conversionRate}% conversion`} accentColor="#059669" valueColor="#059669" />
          <StatCard icon="ti-circle-x"        label="Refusées"          value={appsByStatus.rejected}           sub="Dossiers clôturés"     accentColor="#DC2626" valueColor="#DC2626" />
        </div>

        {/* ── TABS ── */}
        <div style={S.tabsWrap}>
          <TabButton id="overview"      icon="ti-chart-bar"       label="Aperçu"        active={activeTab === 'overview'}      onClick={setActiveTab} />
          <TabButton id="applications"  icon="ti-inbox"           label="Candidatures"  active={activeTab === 'applications'}  onClick={setActiveTab} />
          <TabButton id="jobs"          icon="ti-clipboard-list"  label="Mes offres"    active={activeTab === 'jobs'}          onClick={setActiveTab} />
        </div>

        {/* ══════════════ TAB: OVERVIEW ══════════════ */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* Barre de synthèse */}
            <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 20, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Taux de conversion</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{conversionRate}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${conversionRate}%`, background: '#059669', borderRadius: 4, transition: 'width .4s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>
                  {appsByStatus.accepted || 0} recrutements sur {totalApps} candidatures
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: '#f1f5f9', flexShrink: 0 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#5E42F5' }}>{stats.totalJobs || 0}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Offres actives</div>
              </div>
              <div style={{ width: 1, height: 40, background: '#f1f5f9', flexShrink: 0 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#7C3AED' }}>{appsByStatus.interview || 0}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Entretiens</div>
              </div>
              <div style={{ width: 1, height: 40, background: '#f1f5f9', flexShrink: 0 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>{appsByStatus.pending || 0}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>En attente</div>
              </div>
            </div>

            {/* Performance par offre */}
            {stats.applicationsByJob?.length > 0 ? (
              <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3C', margin: 0 }}>Performance par offre</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Répartition des candidatures par annonce</p>
                  </div>
                  <i className="ti ti-chart-bar" style={{ fontSize: 18, color: '#d1d5db' }} aria-hidden="true" />
                </div>
                <div style={{ padding: '12px 20px' }}>
                  {stats.applicationsByJob.map((job, idx) => {
                    const maxCount = Math.max(...stats.applicationsByJob.map((j) => j.count));
                    const pct = maxCount ? Math.round((job.count / maxCount) * 100) : 0;
                    return (
                      <div key={job.jobId} style={{ padding: '12px 0', borderBottom: idx < stats.applicationsByJob.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3C' }}>{job.jobTitle}</span>
                            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{job.count} candidature{job.count > 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {Object.entries(job.byStatus || {}).map(([status, count]) =>
                              count > 0 ? (
                                <span key={status} style={{ ...S.badge, background: STATUS_CONFIG[status]?.bg, color: STATUS_CONFIG[status]?.color, border: `1px solid ${STATUS_CONFIG[status]?.dot}30`, fontSize: 10, padding: '3px 8px' }}>
                                  {STATUS_CONFIG[status]?.label} · {count}
                                </span>
                              ) : null
                            )}
                          </div>
                        </div>
                        <div style={{ height: 4, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#5E42F5', borderRadius: 4, transition: 'width .5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={S.emptyCard}>
                <div style={S.emptyIcon}>
                  <i className="ti ti-chart-bar" style={{ fontSize: 24, color: '#9ca3af' }} aria-hidden="true" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Aucune donnée disponible</p>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>Publiez vos premières offres pour voir les statistiques.</p>
                <button style={S.btnPrimary} onClick={() => { setActiveTab('jobs'); setIsModalOpen(true); }}>
                  <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
                  Publier une offre
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB: APPLICATIONS ══════════════ */}
        {activeTab === 'applications' && (
          <div>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-clipboard-list" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9ca3af', pointerEvents: 'none' }} aria-hidden="true" />
                <select
                  className="app-select"
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  style={{ paddingLeft: 30 }}
                >
                  <option value="">Toutes les offres</option>
                  {myJobs.map((job) => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <i className="ti ti-filter" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9ca3af', pointerEvents: 'none' }} aria-hidden="true" />
                <select
                  className="app-select"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  style={{ paddingLeft: 30 }}
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {(selectedJobFilter || selectedStatusFilter) && (
                <button
                  onClick={() => { setSelectedJobFilter(''); setSelectedStatusFilter(''); }}
                  style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <i className="ti ti-x" style={{ fontSize: 13 }} aria-hidden="true" />
                  Réinitialiser
                </button>
              )}

              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                {applications.length} résultat{applications.length !== 1 ? 's' : ''}
              </span>
            </div>

            {applications.length === 0 ? (
              <div style={S.emptyCard}>
                <div style={S.emptyIcon}>
                  <i className="ti ti-inbox" style={{ fontSize: 24, color: '#9ca3af' }} aria-hidden="true" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Aucune candidature trouvée</p>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Ajustez vos filtres ou attendez de nouvelles candidatures.</p>
              </div>
            ) : (
              <div style={S.tableWrap}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800, fontFamily: 'inherit' }}>
                  <thead>
                    <tr>
                      {['Candidat', 'Offre', 'Date', 'Statut', 'Changer statut'].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, i) => {
                      const av = getAvatar(`${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`);
                      const isLast = i === applications.length - 1;
                      return (
                        <tr
                          key={app._id}
                          style={{ borderBottom: isLast ? 'none' : '0.5px solid #f1f5f9', background: hoveredRow === app._id ? '#f8fafc' : 'transparent', transition: 'background .12s' }}
                          onMouseEnter={() => setHoveredRow(app._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                {av.initials}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0B0D17' }}>
                                  {app.candidate?.firstName} {app.candidate?.lastName}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{app.candidate?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={S.td}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{app.job?.title}</span>
                          </td>
                          <td style={S.td}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>{formatDate(app.createdAt)}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{daysAgo(app.createdAt)}</div>
                          </td>
                          <td style={S.td}>
                            <StatusBadge status={app.status} />
                          </td>
                          <td style={S.td}>
                            <select
                              className="app-select"
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB: JOBS ══════════════ */}
        {activeTab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button style={S.btnPrimary} onClick={() => setIsModalOpen(true)}>
                <i className="ti ti-plus" style={{ fontSize: 15 }} aria-hidden="true" />
                Nouvelle offre
              </button>
            </div>

            {myJobs.length === 0 ? (
              <div style={S.emptyCard}>
                <div style={S.emptyIcon}>
                  <i className="ti ti-clipboard-list" style={{ fontSize: 24, color: '#9ca3af' }} aria-hidden="true" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Aucune offre publiée</p>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>Créez votre première annonce et commencez à recevoir des candidatures.</p>
                <button style={S.btnPrimary} onClick={() => setIsModalOpen(true)}>
                  <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
                  Créer une offre
                </button>
              </div>
            ) : (
              <div style={S.tableWrap}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800, fontFamily: 'inherit' }}>
                  <thead>
                    <tr>
                      {['Poste', 'Localisation', 'Contrat', 'Candidatures', 'Actions'].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myJobs.map((job, i) => {
                      const count = stats?.applicationsByJob?.find((j) => j.jobId === job._id)?.count || 0;
                      const contractCfg = CONTRACT_COLORS[job.contractType] || CONTRACT_COLORS.CDI;
                      const isLast = i === myJobs.length - 1;
                      return (
                        <tr
                          key={job._id}
                          style={{ borderBottom: isLast ? 'none' : '0.5px solid #f1f5f9', background: hoveredRow === job._id ? '#f8fafc' : 'transparent', transition: 'background .12s' }}
                          onMouseEnter={() => setHoveredRow(job._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td style={S.td}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0B0D17' }}>{job.title}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className="ti ti-building" style={{ fontSize: 11 }} aria-hidden="true" />
                              {job.company?.name}
                            </div>
                          </td>
                          <td style={S.td}>
                            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <i className="ti ti-map-pin" style={{ fontSize: 13, color: '#9ca3af' }} aria-hidden="true" />
                              {job.location}
                            </div>
                            {job.isRemote && (
                              <span style={{ fontSize: 10, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                                <i className="ti ti-wifi" style={{ fontSize: 10 }} aria-hidden="true" />
                                Télétravail
                              </span>
                            )}
                          </td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, background: contractCfg.bg, color: contractCfg.color, border: `1px solid ${contractCfg.color}20` }}>
                              {job.contractType}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 18, fontWeight: 700, color: '#5E42F5' }}>{count}</span>
                              <span style={{ fontSize: 11, color: '#9ca3af' }}>candidature{count !== 1 ? 's' : ''}</span>
                            </div>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button style={S.btnEdit} onClick={() => handleEditClick(job)}>
                                <i className="ti ti-edit" style={{ fontSize: 12 }} aria-hidden="true" />
                                Modifier
                              </button>
                              <button style={S.btnDanger} onClick={() => handleDeleteJob(job._id)}>
                                <i className="ti ti-trash" style={{ fontSize: 12 }} aria-hidden="true" />
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════ MODAL OFFRE ══════════════ */}
      {isModalOpen && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div style={S.modal}>

            {/* Header modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F0EEFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={editingJobId ? 'ti ti-edit' : 'ti ti-plus'} style={{ fontSize: 16, color: '#5E42F5' }} aria-hidden="true" />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0B0D17', letterSpacing: '-.3px', margin: 0 }}>
                    {editingJobId ? "Modifier l'offre" : 'Nouvelle offre'}
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                  {editingJobId ? 'Mettez à jour les informations du poste.' : 'Remplissez les informations du poste à pourvoir.'}
                </p>
              </div>
              <button onClick={resetForm} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: 15, color: '#6b7280' }} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={S.label}>Titre du poste <span style={{ color: '#DC2626' }}>*</span></label>
                  <input style={S.input} type="text" required name="title" value={formData.title} onChange={handleInputChange} placeholder="ex : Développeur Backend Node.js" />
                </div>
                <div>
                  <label style={S.label}>Entreprise <span style={{ color: '#DC2626' }}>*</span></label>
                  <input style={S.input} type="text" required name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="ex : TechCorp Maroc" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Description <span style={{ color: '#DC2626' }}>*</span></label>
                <textarea
                  style={{ ...S.input, resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
                  required name="description" rows={4}
                  value={formData.description} onChange={handleInputChange}
                  placeholder="Missions, responsabilités, profil recherché…"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={S.label}>Localisation <span style={{ color: '#DC2626' }}>*</span></label>
                  <input style={S.input} type="text" required name="location" value={formData.location} onChange={handleInputChange} placeholder="Casablanca" />
                </div>
                <div>
                  <label style={S.label}>Type de contrat <span style={{ color: '#DC2626' }}>*</span></label>
                  <select className="modal-select" name="contractType" value={formData.contractType} onChange={handleInputChange}>
                    {['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance', 'Temps partiel'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Expérience <span style={{ color: '#DC2626' }}>*</span></label>
                  <input style={S.input} type="text" required name="experience" value={formData.experience} onChange={handleInputChange} placeholder="2 ans, Junior…" />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>
                  Compétences
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>(séparées par des virgules)</span>
                </label>
                <input style={S.input} type="text" name="skillsInput" value={formData.skillsInput} onChange={handleInputChange} placeholder="React, Node.js, MongoDB, Docker…" />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 28, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
                <input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleInputChange} style={{ width: 16, height: 16, accentColor: '#378ADD', cursor: 'pointer' }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block' }}>Poste ouvert au télétravail</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Le candidat peut travailler à distance</span>
                </div>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, borderTop: '0.5px solid #f1f5f9' }}>
                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', fontSize: 13, color: '#6b7280', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  Annuler
                </button>
                <button type="submit" style={S.btnPrimary}>
                  <i className={editingJobId ? 'ti ti-check' : 'ti ti-send'} style={{ fontSize: 14 }} aria-hidden="true" />
                  {editingJobId ? 'Enregistrer les modifications' : "Publier l'offre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}