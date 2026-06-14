import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/auth';
import { getCandidateDashboard, getApplicationsByStatus } from '../services/dashboardService';

// Status color mapping
const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', color: '#D97706', label: 'En attente', icon: '⏳' },
  reviewed: { bg: '#DBEAFE', color: '#2563EB', label: 'Consultée', icon: '👁️' },
  interview: { bg: '#F3E8FF', color: '#7C3AED', label: 'Entretien', icon: '🎤' },
  accepted: { bg: '#D1FAE5', color: '#059669', label: 'Acceptée', icon: '✅' },
  rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Refusée', icon: '❌' },
};

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  const isAuthenticated = () => !!userId;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCandidateDashboard();
      
      setUser(data.user);
      setStats(data.stats);
      setApplications(data.applications || []);
      setFilteredApps(data.applications || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Impossible de charger votre tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  // Filter applications by status
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    if (status === 'all') {
      setFilteredApps(applications);
    } else {
      setFilteredApps(applications.filter(app => app.status === status));
    }
  };

  const handleLogoutClick = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate days ago
  const daysAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffDays} jours`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: '3px solid #378ADD', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 12, margin: 0 }}>Chargement de votre tableau de bord...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
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

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/jobs" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Offres</Link>
            <Link to="/upload-cv" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Mon CV</Link>
            <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Tableau de bord</Link>
          </div>

          {userName && (
            <button onClick={handleLogoutClick} style={{ fontSize: 13, color: '#8CA3BE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 2rem' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
            Espace Candidat
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
            Tableau de Bord
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Suivez vos candidatures en temps réel
          </p>
        </div>

        {/* ── ERROR STATE ── */}
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#B91C1C', marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── STATS CARDS ── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0C1F3C' }}>{stats.total}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Total</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: '16px', textAlign: 'center', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#D97706' }}>{stats.pending}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>En attente</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: '16px', textAlign: 'center', borderLeft: '4px solid #7C3AED' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#7C3AED' }}>{stats.interview}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Entretiens</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: '16px', textAlign: 'center', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{stats.accepted}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Acceptées</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: '16px', textAlign: 'center', borderLeft: '4px solid #DC2626' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>{stats.rejected}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Refusées</div>
            </div>
          </div>
        )}

        {/* ── STATUS FILTER BUTTONS ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleStatusFilter('all')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: selectedStatus === 'all' ? '#0C1F3C' : '#fff',
              color: selectedStatus === 'all' ? '#fff' : '#6b7280',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Tous
          </button>
          {Object.entries(STATUS_COLORS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStatusFilter(key)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${value.color}`,
                background: selectedStatus === key ? value.bg : '#fff',
                color: value.color,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {value.label}
            </button>
          ))}
        </div>

        {/* ── APPLICATIONS TABLE ── */}
        {filteredApps.length > 0 ? (
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7f9fc', borderBottom: '1px solid #eaecf0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Poste</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Entreprise</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Localisation</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Statut</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app, idx) => {
                    const statusInfo = STATUS_COLORS[app.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={app._id} style={{ borderBottom: idx < filteredApps.length - 1 ? '1px solid #eaecf0' : 'none' }}>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#0C1F3C' }}>
                          {app.job?.title || 'Poste non disponible'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
                          {app.job?.company?.name || 'Entreprise non disponible'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
                          {app.job?.location || 'N/A'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              fontSize: 12,
                              fontWeight: 600,
                              border: `1px solid ${statusInfo.color}`,
                            }}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>
                          {daysAgo(app.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 10px' }}>
              {selectedStatus !== 'all' 
                ? `Aucune candidature avec le statut "${STATUS_COLORS[selectedStatus]?.label || 'inconnu'}"`
                : 'Aucune candidature pour le moment'
              }
            </p>
            {selectedStatus !== 'all' && (
              <button
                onClick={() => handleStatusFilter('all')}
                style={{ fontSize: 13, color: '#378ADD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
              >
                Voir toutes les candidatures
              </button>
            )}
            {selectedStatus === 'all' && (
              <button
                onClick={() => navigate('/jobs')}
                style={{ fontSize: 13, color: '#378ADD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
              >
                Consulter les offres d'emploi
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
