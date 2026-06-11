import { useState, useEffect } from 'react';
import { getJobs, createJob, deleteJob, updateJob } from '../services/jobs';
import { logout } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';

const EMPTY_FORM = {
  title: '', description: '', companyName: '',
  location: '', contractType: 'CDI', experience: '',
  isRemote: false, skillsInput: '',
};

export default function RecruiterDashboard() {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const navigate = useNavigate();

  useEffect(() => { fetchRecruiterJobs(); }, []);

  const fetchRecruiterJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      setMyJobs(response.data || response || []);
    } catch (err) {
      setError('Impossible de charger vos offres.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        ? formData.skillsInput.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editingJobId) {
        await updateJob(editingJobId, payload);
      } else {
        await createJob(payload);
      }
      resetForm();
      fetchRecruiterJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await deleteJob(jobId);
      setMyJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleLogoutClick = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 16, color: '#6b7280' }}>Chargement de votre espace…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── TOPBAR ── */}
      <div style={{ background: '#0C1F3C', padding: '0 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div onClick={() => navigate('/')} style={{cursor:'pointer', width: 28, height: 28, borderRadius: 6, background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#85B7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span onClick={() => navigate('/')} style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px',cursor:'pointer' }}>JobBoard</span>
          </div>
          <button onClick={handleLogoutClick} style={{ fontSize: 13, color: '#8CA3BE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Déconnexion →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 2rem' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
              Espace recruteur
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.5px', margin: 0 }}>
              Vos offres publiées
            </h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={btnPrimary}>
            + Publier une offre
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {myJobs.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 20, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 12 }}>Aucune offre publiée pour le moment.</p>
            <button onClick={() => setIsModalOpen(true)} style={{ fontSize: 14, color: '#378ADD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Créer votre première annonce →
            </button>
          </div>
        ) : (

          /* ── TABLE ── */
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960, fontFamily: 'inherit' }}>
                <thead>
                  <tr style={{ background: '#f7f9fc', borderBottom: '1px solid #eaecf0' }}>
                    {['Poste & Entreprise', 'Description', 'Contrat / Expérience', 'Localisation', 'Compétences', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myJobs.map((job, i) => (
                    <tr key={job._id} style={{ borderBottom: i < myJobs.length - 1 ? '1px solid #f3f4f6' : 'none', verticalAlign: 'top' }}>

                      <td style={{ padding: '16px 20px', maxWidth: 200 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3C' }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: '#378ADD', marginTop: 3, fontWeight: 500 }}>{job.company?.name || '—'}</div>
                      </td>

                      <td style={{ padding: '16px 20px', maxWidth: 240 }}>
                        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {job.description}
                        </p>
                      </td>

                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', background: '#E6F1FB', color: '#0C447C', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, marginBottom: 6 }}>
                          {job.contractType}
                        </span>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{job.experience || '—'}</div>
                      </td>

                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{job.location}</div>
                        <div style={{ marginTop: 6 }}>
                          {job.isRemote ? (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>Télétravail</span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 100, background: '#F3F4F6', color: '#6b7280', border: '1px solid #E5E7EB' }}>Sur site</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', maxWidth: 200 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {job.skills && job.skills.length > 0 ? job.skills.map((skill, idx) => (
                            <span key={idx} style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 100, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                              {skill}
                            </span>
                          )) : <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button onClick={() => handleEditClick(job)} style={btnEdit}>Modifier</button>
                          <button onClick={() => handleDeleteJob(job._id)} style={btnDelete}>Supprimer</button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: '36px 32px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.3px', margin: 0 }}>
                  {editingJobId ? "Modifier l'offre" : "Nouvelle offre"}
                </h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
                  {editingJobId ? "Mettez à jour les informations du poste." : "Remplissez les informations du poste."}
                </p>
              </div>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22, lineHeight: 1, padding: 4, fontFamily: 'inherit' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Titre du poste *</label>
                  <input style={inputStyle} type="text" required name="title" value={formData.title} onChange={handleInputChange} placeholder="ex : Développeur Backend" />
                </div>
                <div>
                  <label style={labelStyle}>Entreprise *</label>
                  <input style={inputStyle} type="text" required name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="ex : TechCorp" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} required name="description" rows={4} value={formData.description} onChange={handleInputChange} placeholder="Missions, responsabilités, profil recherché…" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Localisation *</label>
                  <input style={inputStyle} type="text" required name="location" value={formData.location} onChange={handleInputChange} placeholder="Casablanca" />
                </div>
                <div>
                  <label style={labelStyle}>Contrat *</label>
                  <select style={inputStyle} name="contractType" value={formData.contractType} onChange={handleInputChange}>
                    {['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Expérience *</label>
                  <input style={inputStyle} type="text" required name="experience" value={formData.experience} onChange={handleInputChange} placeholder="2 ans, Junior…" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Compétences <span style={{ fontWeight: 400, color: '#9ca3af' }}>(séparées par des virgules)</span></label>
                <input style={inputStyle} type="text" name="skillsInput" value={formData.skillsInput} onChange={handleInputChange} placeholder="React, Node.js, MongoDB" />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 28 }}>
                <input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleInputChange} style={{ width: 16, height: 16, accentColor: '#378ADD' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Poste ouvert au télétravail (100% remote)</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Annuler
                </button>
                <button type="submit" style={btnPrimary}>
                  {editingJobId ? "Enregistrer" : "Publier l'offre"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary = {
  padding: '11px 24px', borderRadius: 10,
  background: '#0C1F3C', color: '#fff',
  border: 'none', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};

const btnEdit = {
  padding: '6px 14px', borderRadius: 8,
  background: '#E6F1FB', color: '#0C447C',
  border: '1px solid #B5D4F4', fontSize: 12,
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

const btnDelete = {
  padding: '6px 14px', borderRadius: 8,
  background: '#FEF2F2', color: '#B91C1C',
  border: '1px solid #FECACA', fontSize: 12,
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block', fontSize: 13,
  fontWeight: 600, color: '#374151', marginBottom: 6,
};

const inputStyle = {
  display: 'block', width: '100%',
  padding: '10px 14px', fontSize: 14,
  color: '#111', background: '#fff',
  border: '1px solid #d1d5db', borderRadius: 8,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};