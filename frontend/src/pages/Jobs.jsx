import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getJobs } from '../services/jobs';
import { logout } from '../services/auth';
import { applyJob } from '../services/applications';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const isAuthenticated = () => !!localStorage.getItem('userId');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data.data || data);
      } catch (err) {
        setError("Erreur lors du chargement des offres d'emploi");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyClick = (jobId) => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      setSelectedJobId(jobId);
      setCoverLetter('');
      setApplyError('');
      setApplySuccess(false);
      setIsApplyModalOpen(true);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);
      setApplyError('');
      await applyJob({ job: selectedJobId, coverLetter });
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess(false);
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Erreur lors de la soumission de votre candidature');
    } finally {
      setApplying(false);
    }
  };

  const handleLogoutClick = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      job.title?.toLowerCase().includes(q) ||
      job.company?.name?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.experience?.toLowerCase().includes(q) ||
      job.skills?.some(s => s.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Chargement des offres…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontSize: 15, color: '#B91C1C' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── TOPBAR ── */}
      <div style={{ background: '#0C1F3C', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div onClick={() => navigate('/')}  style={{cursor:'pointer', width: 28, height: 28, borderRadius: 6, background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#85B7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span onClick={() => navigate('/')} style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' ,cursor:'pointer'}}>JobBoard</span>
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
          {isAuthenticated() && (
            <div style={{ display: 'flex', gap: 24 }}>
              {localStorage.getItem('userRole') === 'candidate' ? (
                <>
                  <Link to="/jobs" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Offres</Link>
                  <Link to="/upload-cv" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Mon CV</Link>
                  <Link to="/my-applications" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Mes candidatures</Link>
                </>
              ) : (
                <Link to="/recruiter-dashboard" style={{ color: '#8CA3BE', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Espace Recruteur</Link>
              )}
            </div>
          )}

          {userName && (
            <button onClick={handleLogoutClick} style={{ fontSize: 13, color: '#8CA3BE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 2rem' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
              Espace candidat
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.5px', margin: 0 }}>
              Offres d'emploi
            </h1>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Poste, entreprise, compétence…"
              style={{
                padding: '10px 14px 10px 36px', fontSize: 14,
                border: '1px solid #d1d5db', borderRadius: 10,
                outline: 'none', background: '#fff',
                width: 300, fontFamily: 'inherit', color: '#111',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* ── GRID ── */}
        {filteredJobs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredJobs.map(job => (
              <div key={job._id} style={{
                background: '#fff', border: '1px solid #eaecf0',
                borderRadius: 20, padding: '24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                {/* Card top */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3C', margin: '0 0 4px', letterSpacing: '-0.2px' }}>
                        {job.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#378ADD', fontWeight: 500, margin: 0 }}>
                        {job.company?.name || 'Non spécifié'}
                      </p>
                    </div>
                    {job.isRemote && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', whiteSpace: 'nowrap', marginLeft: 10 }}>
                        Remote
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {job.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                        {skill}
                      </span>
                    ))}
                    {job.skills?.length > 4 && (
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#F9FAFB', color: '#9ca3af', border: '1px solid #F3F4F6' }}>
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card bottom */}
                <div>
                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 12px', background: '#f7f9fc', borderRadius: 10, border: '1px solid #eaecf0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#E6F1FB', color: '#0C447C' }}>
                      {job.contractType}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
                    <span style={{ fontSize: 12, color: '#6b7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.location}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
                    <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {job.experience || 'N/A'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyClick(job._id)}
                    style={{
                      width: '100%', padding: '11px',
                      borderRadius: 10, background: '#0C1F3C',
                      color: '#fff', border: 'none',
                      fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      letterSpacing: '-0.1px',
                    }}
                  >
                    Postuler maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 20, padding: '64px 24px', textAlign: 'center', marginTop: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 10px' }}>
              Aucun résultat pour <strong style={{ color: '#374151' }}>"{searchQuery}"</strong>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{ fontSize: 13, color: '#378ADD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Effacer la recherche
            </button>
          </div>
        )}
      </div>

      {/* ── APPLICATION MODAL ── */}
      {isApplyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0C1F3C', margin: 0 }}>
                  Postuler à l'offre
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  Votre profil et votre CV actuellement enregistrés seront attachés à cette candidature.
                </p>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af', fontFamily: 'inherit', padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </div>

            {applySuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 100, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#065F46', margin: '0 0 4px' }}>Candidature envoyée !</h4>
                <p style={{ fontSize: 13, color: '#047857', margin: 0 }}>Votre dossier a été transmis avec succès.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit}>
                {applyError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>
                    {applyError}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Lettre de motivation (optionnelle)
                  </label>
                  <textarea
                    rows={6}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Expliquez en quelques mots pourquoi vous êtes le candidat idéal pour ce poste..."
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
                      color: '#111', background: '#fff', border: '1px solid #d1d5db',
                      borderRadius: 8, outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    maxLength={3000}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#6b7280', padding: '12px 14px', background: '#f7f9fc', borderRadius: 8, border: '1px solid #eaecf0', marginBottom: 24 }}>
                  <span>Mon profil JobBoard</span>
                  <Link to="/upload-cv" style={{ color: '#378ADD', fontWeight: 600, textDecoration: 'none' }}>
                    Modifier mon CV →
                  </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    style={{ padding: '10px 20px', fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    style={{
                      padding: '10px 24px', borderRadius: 10, background: '#0C1F3C',
                      color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    {applying ? 'Envoi en cours...' : 'Confirmer ma candidature'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}