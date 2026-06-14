import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/auth';
import { getCandidateDashboard } from '../services/dashboardService';

// ─── Palette statuts ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'En attente', bg: '#FEF3C7', color: '#92400E', dot: '#D97706',  icon: 'ti-clock'         },
  reviewed:  { label: 'Consultée',  bg: '#DBEAFE', color: '#1e40af', dot: '#2563EB',  icon: 'ti-eye'           },
  interview: { label: 'Entretien',  bg: '#F3E8FF', color: '#5b21b6', dot: '#7C3AED',  icon: 'ti-microphone'    },
  accepted:  { label: 'Acceptée',   bg: '#D1FAE5', color: '#065f46', dot: '#059669',  icon: 'ti-circle-check'  },
  rejected:  { label: 'Refusée',    bg: '#FEE2E2', color: '#991b1b', dot: '#DC2626',  icon: 'ti-circle-x'     },
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

function getCompanyAvatar(name = '') {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return { initials, ...AVATAR_COLORS[idx] };
}

// Helpers date
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function daysAgo(d) {
  if (!d) return '';
  const diff = Math.ceil(Math.abs(new Date() - new Date(d)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return `Il y a ${diff}j`;
}

// ─── Icônes Tabler (webfont doit être chargée dans index.html) ───────────────
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">

// ─── Styles inline centralisés ───────────────────────────────────────────────
const S = {
  page:       { minHeight: '100vh', background: '#f7f9fc', fontFamily: 'Inter, system-ui, sans-serif' },
  // Topbar
  topbar:     { background: '#0C1F3C', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 },
  topbarInner:{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandIcon:  { width: 30, height: 30, borderRadius: 8, background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:  { fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.3px', cursor: 'pointer' },
  divider:    { width: 1, height: 16, background: 'rgba(255,255,255,.12)', margin: '0 6px' },
  greeting:   { fontSize: 13, color: '#8CA3BE' },
  greetName:  { color: '#85B7EB', fontWeight: 600 },
  navLink:    { fontSize: 13, fontWeight: 500, color: '#8CA3BE', textDecoration: 'none' },
  navLinkActive:{ fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none' },
  logoutBtn:  { fontSize: 13, color: '#8CA3BE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  // Content
  inner:      { maxWidth: 1200, margin: '0 auto', padding: '40px 2rem 60px' },
  eyebrow:    { fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' },
  pageTitle:  { fontSize: 28, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-.5px', margin: '0 0 4px' },
  pageSub:    { fontSize: 14, color: '#6b7280', margin: 0 },
  // Stats grid
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 },
  statCard:   { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14, padding: '20px 16px', position: 'relative', overflow: 'hidden' },
  statAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 14px 14px' },
  statLabel:  { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 },
  statSub:    { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  // Summary bar
  summaryBar: { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24 },
  summaryDivider: { width: 1, height: 40, background: '#f1f5f9', flexShrink: 0 },
  summaryNum: { fontSize: 20, fontWeight: 700, color: '#0C1F3C', textAlign: 'center' },
  summaryLabel:{ fontSize: 11, color: '#9ca3af', marginTop: 2, textAlign: 'center' },
  progressWrap:{ flex: 1 },
  progressBar: { height: 4, borderRadius: 4, background: '#f1f5f9', marginTop: 8, overflow: 'hidden' },
  // Section row
  sectionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  sectionTitle:{ fontSize: 15, fontWeight: 600, color: '#0C1F3C' },
  // Filter pills
  pillsWrap:  { display: 'flex', gap: 6, flexWrap: 'wrap' },
  // Table
  tableWrap:  { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' },
  tableHead:  { display: 'grid', gridTemplateColumns: '2.5fr 1.8fr 1.4fr 1.2fr 1fr', padding: '10px 20px', background: '#f8fafc', borderBottom: '0.5px solid #e5e7eb' },
  th:         { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' },
  row:        { display: 'grid', gridTemplateColumns: '2.5fr 1.8fr 1.4fr 1.2fr 1fr', padding: '16px 20px', borderBottom: '0.5px solid #f1f5f9', alignItems: 'center' },
  jobTitle:   { fontSize: 13, fontWeight: 600, color: '#0C1F3C', lineHeight: 1.3 },
  jobContract:{ fontSize: 11, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 },
  companyCell:{ display: 'flex', alignItems: 'center', gap: 10 },
  avatar:     { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  companyName:{ fontSize: 13, fontWeight: 500, color: '#374151' },
  locationCell:{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 },
  badge:      { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
  dot:        { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  dateMain:   { fontSize: 12, fontWeight: 500, color: '#6b7280' },
  dateSub:    { fontSize: 11, color: '#9ca3af' },
  // Empty state
  emptyWrap:  { background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14, padding: '60px 24px', textAlign: 'center' },
  emptyIcon:  { width: 56, height: 56, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' },
  emptySub:   { fontSize: 13, color: '#9ca3af', margin: '0 0 20px' },
  ctaBtn:     { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#0C1F3C', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  // Loader
  loaderWrap: { minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' },
  spinner:    { display: 'inline-block', width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: '3px solid #378ADD', animation: 'spin 1s linear infinite' },
};

// ─── Pill de filtre ───────────────────────────────────────────────────────────
function FilterPill({ status, label, count, selected, onClick }) {
  const cfg = STATUS_CONFIG[status];
  const isAll = status === 'all';
  const active = selected === status;
  const base = {
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    border: `1px solid ${isAll ? '#d1d5db' : cfg.dot}`,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
    background: active ? (isAll ? '#0C1F3C' : cfg.bg) : '#fff',
    color: active ? (isAll ? '#fff' : cfg.color) : (isAll ? '#374151' : cfg.dot),
  };
  return (
    <button style={base} onClick={onClick}>
      {label}{' '}
      <span style={{ opacity: .55 }}>{count}</span>
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accentColor, valueColor }) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>
        <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, color: valueColor || '#0C1F3C' }}>
        {value}
      </div>
      <div style={S.statSub}>{sub}</div>
      <div style={{ ...S.statAccent, background: accentColor }} />
    </div>
  );
}

// ─── Ligne du tableau ─────────────────────────────────────────────────────────
function AppRow({ app, isLast }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const av = getCompanyAvatar(app.job?.company?.name || '');

  return (
    <div
      style={{
        ...S.row,
        borderBottom: isLast ? 'none' : '0.5px solid #f1f5f9',
        background: hovered ? '#f8fafc' : 'transparent',
        transition: 'background .12s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poste */}
      <div>
        <div style={S.jobTitle}>{app.job?.title || 'Poste non disponible'}</div>
        <div style={S.jobContract}>
          <i className="ti ti-tag" style={{ fontSize: 11 }} aria-hidden="true" />
          {app.job?.contractType || 'CDI'}
        </div>
      </div>

      {/* Entreprise */}
      <div style={S.companyCell}>
        <div style={{ ...S.avatar, background: av.bg, color: av.color }}>
          {av.initials}
        </div>
        <span style={S.companyName}>{app.job?.company?.name || 'N/A'}</span>
      </div>

      {/* Localisation */}
      <div style={S.locationCell}>
        <i className="ti ti-map-pin" style={{ fontSize: 14, color: '#9ca3af' }} aria-hidden="true" />
        {app.job?.location || 'N/A'}
      </div>

      {/* Statut */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            ...S.badge,
            background: status.bg,
            color: status.color,
            border: `1px solid ${status.dot}30`,
          }}
        >
          <span style={{ ...S.dot, background: status.dot }} />
          {status.label}
        </span>
      </div>

      {/* Date */}
      <div>
        <div style={S.dateMain}>{formatDate(app.createdAt)}</div>
        <div style={S.dateSub}>{daysAgo(app.createdAt)}</div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const [stats, setStats]             = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const navigate  = useNavigate();
  const userName  = localStorage.getItem('userName');
  const userId    = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCandidateDashboard();
      setStats(data.stats);
      setApplications(data.applications || []);
      setFilteredApps(data.applications || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger votre tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (status) => {
    setSelectedStatus(status);
    setFilteredApps(
      status === 'all' ? applications : applications.filter((a) => a.status === status)
    );
  };

  const handleLogout = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  // Calculs stats côté client (si l'API ne les retourne pas)
  const computedStats = stats || {
    total:     applications.length,
    pending:   applications.filter((a) => a.status === 'pending').length,
    reviewed:  applications.filter((a) => a.status === 'reviewed').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    accepted:  applications.filter((a) => a.status === 'accepted').length,
    rejected:  applications.filter((a) => a.status === 'rejected').length,
  };

  const responseRate = computedStats.total
    ? Math.round(((computedStats.total - computedStats.pending) / computedStats.total) * 100)
    : 0;

  const successRate = computedStats.total
    ? Math.round((computedStats.accepted / computedStats.total) * 100)
    : 0;

  // ── Loader ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={S.loaderWrap}>
        <div style={{ textAlign: 'center' }}>
          <div style={S.spinner} />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 12 }}>
            Chargement de votre tableau de bord…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── TOPBAR ── */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>

          {/* Brand + greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={S.brandIcon} onClick={() => navigate('/')}>
              <i className="ti ti-briefcase" style={{ fontSize: 15, color: '#85B7EB' }} aria-hidden="true" />
            </div>
            <span style={S.brandName} onClick={() => navigate('/')}>JobBoard</span>
            {userName && (
              <>
                <div style={S.divider} />
                <span style={S.greeting}>
                  Bonjour,{' '}
                  <span style={S.greetName}>{userName}</span>
                </span>
              </>
            )}
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Link to="/jobs"       style={S.navLink}>Offres</Link>
            <Link to="/upload-cv"  style={S.navLink}>Profil</Link>
            <Link to="/dashboard"  style={S.navLinkActive}>Tableau de bord</Link>
          </nav>

          {/* Logout */}
          {userName && (
            <button style={S.logoutBtn} onClick={handleLogout}>Déconnexion</button>
          )}
        </div>
      </div>

      <div style={S.inner}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={S.eyebrow}>Espace Candidat</p>
          <h1 style={S.pageTitle}>Mes candidatures</h1>
          <p style={S.pageSub}>Suivez l'avancement de vos dossiers en temps réel</p>
        </div>

        {/* ── ERREUR ── */}
        {error && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FECACA',
            borderRadius: 12, padding: '12px 16px',
            fontSize: 13, color: '#B91C1C', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 16 }} aria-hidden="true" />
            {error}
            <button
              onClick={fetchDashboard}
              style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── STATS ── */}
        <div style={S.statsGrid}>
          <StatCard icon="ti-files"        label="Total"      value={computedStats.total}     sub="Toutes candidatures"    accentColor="#378ADD" valueColor="#0C1F3C" />
          <StatCard icon="ti-clock"        label="En attente" value={computedStats.pending}    sub="En cours d'examen"     accentColor="#D97706" valueColor="#D97706" />
          <StatCard icon="ti-microphone"   label="Entretiens" value={computedStats.interview}  sub="À venir"               accentColor="#7C3AED" valueColor="#7C3AED" />
          <StatCard icon="ti-circle-check" label="Acceptées"  value={computedStats.accepted}   sub="Félicitations !"       accentColor="#059669" valueColor="#059669" />
          <StatCard icon="ti-circle-x"     label="Refusées"   value={computedStats.rejected}   sub="Continuez vos efforts" accentColor="#DC2626" valueColor="#DC2626" />
        </div>

        {/* ── BARRE SYNTHÈSE ── */}
        <div style={S.summaryBar}>
          <div style={S.progressWrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Taux de réponse</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#378ADD' }}>{responseRate}%</span>
            </div>
            <div style={S.progressBar}>
              <div style={{ height: '100%', width: `${responseRate}%`, background: '#378ADD', borderRadius: 4, transition: 'width .4s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>
              {computedStats.total - computedStats.pending} réponses sur {computedStats.total} candidatures
            </div>
          </div>

          <div style={S.summaryDivider} />

          <div>
            <div style={{ ...S.summaryNum, color: '#7C3AED' }}>{computedStats.interview}</div>
            <div style={S.summaryLabel}>Entretiens</div>
          </div>

          <div style={S.summaryDivider} />

          <div>
            <div style={{ ...S.summaryNum, color: '#059669' }}>{successRate}%</div>
            <div style={S.summaryLabel}>Taux de succès</div>
          </div>

          <div style={S.summaryDivider} />

          <div>
            <div style={{ ...S.summaryNum, color: '#0C1F3C' }}>{computedStats.accepted}</div>
            <div style={S.summaryLabel}>Offres reçues</div>
          </div>
        </div>

        {/* ── SECTION HEADER + FILTRES ── */}
        <div style={S.sectionRow}>
          <p style={S.sectionTitle}>Liste des candidatures</p>
          <div style={S.pillsWrap}>
            <FilterPill
              status="all" label="Tous" count={applications.length}
              selected={selectedStatus} onClick={() => handleFilter('all')}
            />
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <FilterPill
                key={key}
                status={key}
                label={cfg.label}
                count={applications.filter((a) => a.status === key).length}
                selected={selectedStatus}
                onClick={() => handleFilter(key)}
              />
            ))}
          </div>
        </div>

        {/* ── TABLEAU ── */}
        {filteredApps.length > 0 ? (
          <div style={S.tableWrap}>
            <div style={S.tableHead}>
              <div style={S.th}>Poste</div>
              <div style={S.th}>Entreprise</div>
              <div style={S.th}>Localisation</div>
              <div style={{ ...S.th, textAlign: 'center' }}>Statut</div>
              <div style={S.th}>Date</div>
            </div>
            {filteredApps.map((app, idx) => (
              <AppRow
                key={app._id}
                app={app}
                isLast={idx === filteredApps.length - 1}
              />
            ))}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div style={S.emptyWrap}>
            <div style={S.emptyIcon}>
              <i className="ti ti-clipboard-list" style={{ fontSize: 24, color: '#9ca3af' }} aria-hidden="true" />
            </div>
            <p style={S.emptyTitle}>
              {selectedStatus !== 'all'
                ? `Aucune candidature "${STATUS_CONFIG[selectedStatus]?.label}"`
                : 'Aucune candidature pour le moment'}
            </p>
            <p style={S.emptySub}>
              {selectedStatus !== 'all'
                ? 'Essayez un autre filtre ou revenez à la liste complète.'
                : 'Parcourez les offres disponibles et postulez dès maintenant.'}
            </p>
            {selectedStatus !== 'all' ? (
              <button style={S.ctaBtn} onClick={() => handleFilter('all')}>
                <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden="true" />
                Voir toutes
              </button>
            ) : (
              <button style={S.ctaBtn} onClick={() => navigate('/jobs')}>
                <i className="ti ti-search" style={{ fontSize: 14 }} aria-hidden="true" />
                Voir les offres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}