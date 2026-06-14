import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/auth';
import { getMyApplications } from '../services/applications';

const STATUS_MAP = {
  pending: { label: 'En attente', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  reviewed: { label: 'Consultée', bg: '#DBEAFE', color: '#2563EB', border: '#BFDBFE' },
  interview: { label: 'Entretien', bg: '#F3E8FF', color: '#7C3AED', border: '#E9D5FF' },
  accepted: { label: 'Acceptée', bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  rejected: { label: 'Refusée', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' }
};

export default function MyApplication() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null); // For detail modal

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  
  const isAuthenticated = () => !!localStorage.getItem('userId');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      setApplications(data || []);
    } catch (err) {
      setError('Impossible de charger vos candidatures.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  // Helper date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Statistics calculation
  const totalCount = applications.length;
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontSize: 16, color: '#6b7280' }}>Chargement de vos candidatures...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── TOPBAR ── */}
      <div style={{ background: '#0C1F3C', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', width: 28, height: 28, borderRadius: 6, background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#85B7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span onClick={() => navigate('/')} style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', cursor: 'pointer' }}>JobBoard</span>
            {userName && (
              <>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
                <span style={{ fontSize: 13, color: '#8CA3BE' }}>
                  Bonjour, <span style={{ color: '#85B7EB', fontWeight: 600 }}>{userName}</span>
                </span>
              </>
            )}
          </div>

          {/* Navigation Links for Authenticated Users */}
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/jobs" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Offres</Link>
            <Link to="/upload-cv" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Mon CV</Link>
            <Link to="/my-applications" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Mes candidatures</Link>
          </div>

          {userName && (
            <button onClick={handleLogoutClick} style={{ fontSize: 13, color: '#8CA3BE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 2rem' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
              Espace Candidat
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.5px', margin: 0 }}>
              Mes Candidatures
            </h1>
          </div>
          <button onClick={() => navigate('/jobs')} style={btnPrimary}>
            Voir d'autres offres
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#B91C1C', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* ── STATS CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>Total Candidatures</span>
            <span style={statValueStyle}>{totalCount}</span>
          </div>
          <div style={{ ...statCardStyle, borderLeft: '4px solid #D97706' }}>
            <span style={statLabelStyle}>En attente</span>
            <span style={{ ...statValueStyle, color: '#D97706' }}>{pendingCount}</span>
          </div>
          <div style={{ ...statCardStyle, borderLeft: '4px solid #7C3AED' }}>
            <span style={statLabelStyle}>Entretiens</span>
            <span style={{ ...statValueStyle, color: '#7C3AED' }}>{interviewCount}</span>
          </div>
          <div style={{ ...statCardStyle, borderLeft: '4px solid #059669' }}>
            <span style={statLabelStyle}>Acceptées</span>
            <span style={{ ...statValueStyle, color: '#059669' }}>{acceptedCount}</span>
          </div>
        </div>

        {/* ── APPLICATIONS LIST ── */}
        {applications.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 20, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 12 }}>Vous n'avez postulé à aucune offre pour le moment.</p>
            <button onClick={() => navigate('/jobs')} style={{ fontSize: 14, color: '#378ADD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Parcourir les offres d'emploi →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {applications.map((app) => {
              const statusInfo = STATUS_MAP[app.status] || { label: app.status, bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
              const jobInfo = app.job || {};

              return (
                <div key={app._id} style={appCardStyle}>
                  
                  {/* Left: Job detail info */}
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3C', margin: 0 }}>
                        {jobInfo.title || 'Poste supprimé'}
                      </h3>
                      {jobInfo.contractType && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#E6F1FB', color: '#0C447C' }}>
                          {jobInfo.contractType}
                        </span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: 14, color: '#378ADD', fontWeight: 600, margin: '0 0 4px' }}>
                      {jobInfo.company?.name || '—'}
                    </p>
                    
                    <div style={{ display: 'flex', gap: 16, color: '#6b7280', fontSize: 12.5, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {jobInfo.location || 'Non spécifié'}
                      </span>
                      <span>·</span>
                      <span>Postulé le {formatDate(app.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right: Status badge & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: 100,
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.border}`,
                      textAlign: 'center',
                      minWidth: 90
                    }}>
                      {statusInfo.label}
                    </span>

                    <button 
                      type="button" 
                      onClick={() => setSelectedApp(app)} 
                      style={btnDetailStyle}
                    >
                      Détails →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dossier de candidature
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0C1F3C', margin: '4px 0 0' }}>
                  {selectedApp.job?.title || 'Poste supprimé'}
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {selectedApp.job?.company?.name || '—'}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, margin: '24px 0', borderTop: '1px solid #eaecf0', borderBottom: '1px solid #eaecf0', padding: '20px 0' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <span style={modalMetaLabel}>Statut actuel</span>
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 100,
                      background: (STATUS_MAP[selectedApp.status] || {}).bg || '#F3F4F6',
                      color: (STATUS_MAP[selectedApp.status] || {}).color || '#374151',
                      border: `1px solid ${(STATUS_MAP[selectedApp.status] || {}).border || '#E5E7EB'}`
                    }}>
                      {(STATUS_MAP[selectedApp.status] || {}).label || selectedApp.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={modalMetaLabel}>Date de soumission</span>
                  <div style={{ fontSize: 13.5, color: '#0C1F3C', fontWeight: 600, marginTop: 4 }}>
                    {formatDate(selectedApp.createdAt)}
                  </div>
                </div>
              </div>

              <div>
                <span style={modalMetaLabel}>Détails du poste</span>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <span>📍 {selectedApp.job?.location || 'Non spécifié'}</span>
                  <span>💼 {selectedApp.job?.contractType || '—'}</span>
                  <span>🎓 {selectedApp.job?.experience || '—'}</span>
                </div>
              </div>

              <div>
                <span style={modalMetaLabel}>Lettre de motivation transmise</span>
                <div style={{
                  background: '#f7f9fc', border: '1px solid #eaecf0', borderRadius: 8,
                  padding: '12px 14px', fontSize: 13.5, color: '#4b5563',
                  lineHeight: 1.6, maxHeight: 180, overflowY: 'auto', marginTop: 6,
                  whiteSpace: 'pre-line'
                }}>
                  {selectedApp.coverLetter || "Aucune lettre de motivation n'a été rédigée pour cette candidature."}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setSelectedApp(null)} 
                style={{
                  padding: '10px 24px', borderRadius: 10, background: '#0C1F3C',
                  color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Inline Styles
const btnPrimary = {
  padding: '10px 20px',
  borderRadius: 8,
  background: '#0C1F3C',
  color: '#fff',
  border: 'none',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const statCardStyle = {
  background: '#fff',
  border: '1px solid #eaecf0',
  borderRadius: 12,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 8,
};

const statLabelStyle = {
  fontSize: 12,
  color: '#9ca3af',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.03em'
};

const statValueStyle = {
  fontSize: 24,
  fontWeight: 800,
  color: '#0C1F3C',
  letterSpacing: '-0.5px'
};

const appCardStyle = {
  background: '#fff',
  border: '1px solid #eaecf0',
  borderRadius: 16,
  padding: '20px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 20,
  flexWrap: 'wrap',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  transition: 'box-shadow 0.2s',
};

const btnDetailStyle = {
  padding: '8px 16px',
  borderRadius: 8,
  background: '#fff',
  border: '1px solid #d1d5db',
  color: '#374151',
  fontSize: 12.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background-color 0.2s',
};

const modalMetaLabel = {
  display: 'block',
  fontSize: 11.5,
  fontWeight: 700,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};
