import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchJobs } from '../services/jobs';
import { logout } from '../services/auth';
import { applyJob } from '../services/applications';
import { Link } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  // Application modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const debounceTimer = useRef(null);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const isAuthenticated = () => !!localStorage.getItem('userId');

  // Fonction pour appeler l'API de recherche
  const performSearch = async (filters) => {
    try {
      setIsSearching(true);
      setError('');
      const data = await searchJobs(filters);
      setJobs(data.data || data);
    } catch (err) {
      setError("Erreur lors de la recherche d'offres");
      setJobs([]);
    } finally {
      setIsSearching(false);
    }
  };

  // useEffect avec debounce pour la recherche
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const filters = {};
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (location.trim()) filters.location = location.trim();
      if (jobType.trim()) filters.jobType = jobType.trim();

      performSearch(filters);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [keyword, location, jobType]);

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

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── TOPBAR ── */}
      <div style={{ background: '#0B0D17', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div onClick={() => navigate('/')}  style={{cursor:'pointer', width: 28, height: 28, borderRadius: 6, background: '#5E42F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span onClick={() => navigate('/')} style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' ,cursor:'pointer'}}>JobBoard</span>
            {userName && (
              <>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
                <span style={{ fontSize: 13, color: '#A0AAB2' }}>
                  Bonjour, <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{userName}</span>
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
                  <Link to="/upload-cv" style={{ color: '#A0AAB2', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Profil</Link>
                  <Link to="/my-applications" style={{ color: '#A0AAB2', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Mes candidatures</Link>
                </>
              ) : (
                <Link to="/recruiter-dashboard" style={{ color: '#A0AAB2', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Espace Recruteur</Link>
              )}
            </div>
          )}

          {userName && (
            <button onClick={handleLogoutClick} style={{ fontSize: 13, color: '#A0AAB2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 2rem' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#5E42F5', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
              Espace candidat
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0B0D17', letterSpacing: '-0.5px', margin: 0 }}>
              Offres d'emploi
            </h1>
          </div>

          {/* ── SEARCH & FILTER FORM ── */}
          <div style={{ 
            background: '#fff', 
            border: '1px solid #eaecf0', 
            borderRadius: 16, 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column',
            gap: 16
          }}>
            {/* Row 1: Keyword search */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                Mot-clé
              </label>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', marginTop: 10 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Ex: developer, designer, react…"
                style={{
                  padding: '10px 14px 10px 36px', fontSize: 14,
                  border: '1px solid #d1d5db', borderRadius: 10,
                  outline: 'none', background: '#fff',
                  width: '100%', fontFamily: 'inherit', color: '#111',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Row 2: Location & Job Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Location */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Localisation
                </label>
                <svg style={{ position: 'absolute', left: 12, top: '58px', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex: Casablanca, Paris…"
                  style={{
                    padding: '10px 14px 10px 36px', fontSize: 14,
                    border: '1px solid #d1d5db', borderRadius: 10,
                    outline: 'none', background: '#fff',
                    width: '100%', fontFamily: 'inherit', color: '#111',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Job Type */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Type de contrat
                </label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  style={{
                    padding: '10px 14px', fontSize: 14,
                    border: '1px solid #d1d5db', borderRadius: 10,
                    outline: 'none', background: '#fff',
                    width: '100%', fontFamily: 'inherit', color: '#111',
                    boxSizing: 'border-box', cursor: 'pointer',
                  }}
                >
                  <option value="">Tous les types</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Alternance">Alternance</option>
                  <option value="Temps partiel">Temps partiel</option>
                </select>
              </div>
            </div>

            {/* Reset button */}
            {(keyword || location || jobType) && (
              <button
                onClick={handleResetFilters}
                style={{
                  alignSelf: 'flex-end',
                  fontSize: 13, color: '#5E42F5', fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textDecoration: 'underline',
                }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* ── RESULTS INFO ── */}
        {!isSearching && jobs.length > 0 && (
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, fontWeight: 500 }}>
            {jobs.length} offre{jobs.length > 1 ? 's' : ''} trouvée{jobs.length > 1 ? 's' : ''}
          </p>
        )}

        {/* ── LOADING STATE ── */}
        {isSearching && (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 16, border: '1px solid #eaecf0' }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: '3px solid #5E42F5', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 12, margin: 0 }}>Recherche en cours…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {error && !isSearching && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: '#991B1B', margin: 0 }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* ── GRID ── */}
        {!isSearching && jobs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {jobs.map(job => (
              <div key={job._id} style={{
                background: '#fff', border: '1px solid #eaecf0',
                borderRadius: 20, padding: '24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                {/* Card top */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B0D17', margin: '0 0 4px', letterSpacing: '-0.2px' }}>
                        {job.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#5E42F5', fontWeight: 500, margin: 0 }}>
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
                      borderRadius: 10, background: '#5E42F5',
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
        ) : !isSearching ? (
          /* ── EMPTY STATE ── */
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 20, padding: '64px 24px', textAlign: 'center', marginTop: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 10px' }}>
              {keyword || location || jobType ? (
                <>Aucun résultat pour vos critères</>
              ) : (
                <>Aucune offre disponible</>
              )}
            </p>
            {(keyword || location || jobType) && (
              <button
                onClick={handleResetFilters}
                style={{ fontSize: 13, color: '#5E42F5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* ── APPLICATION MODAL ── */}
      {isApplyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0B0D17', margin: 0 }}>
                  Postuler à l'offre
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  Votre profil et vos informations actuellement enregistrées seront attachés à cette candidature.
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
                  <Link to="/upload-cv" style={{ color: '#5E42F5', fontWeight: 600, textDecoration: 'none' }}>
                    Modifier mon Profil →
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
                      padding: '10px 24px', borderRadius: 10, background: '#5E42F5',
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