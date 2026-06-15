import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/auth';
import { getMyCV, uploadCV } from '../services/cv';

export default function UploadCV() {
  const [cvData, setCvData] = useState({
    headline: '',
    summary: '',
    skills: { technical: [], soft: [] },
    experiences: [],
    education: [],
    languages: [],
    links: { linkedin: '', github: '', portfolio: '' },
    fileName: '',
    fileUrl: '',
    profilePicUrl: '',
    coverPicUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [file, setFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverPicFile, setCoverPicFile] = useState(null);

  // Editor states for sub-items
  const [newExp, setNewExp] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [showExpForm, setShowExpForm] = useState(false);

  const [newEd, setNewEd] = useState({ degree: '', school: '', location: '', startDate: '', endDate: '', isCurrent: false, grade: '' });
  const [showEdForm, setShowEdForm] = useState(false);

  const [newLang, setNewLang] = useState({ name: '', level: 'Intermédiaire' });
  const [showLangForm, setShowLangForm] = useState(false);

  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  const fileInputRef = useRef(null);
  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  
  const isAuthenticated = () => !!localStorage.getItem('userId');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCV();
  }, [navigate]);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const data = await getMyCV();
      if (data) {
        setCvData({
          headline: data.headline || '',
          summary: data.summary || '',
          skills: data.skills || { technical: [], soft: [] },
          experiences: data.experiences || [],
          education: data.education || [],
          languages: data.languages || [],
          links: data.links || { linkedin: '', github: '', portfolio: '' },
          fileName: data.fileName || '',
          fileUrl: data.fileUrl || '',
          profilePicUrl: data.profilePicUrl || '',
          coverPicUrl: data.coverPicUrl || ''
        });
      }
    } catch (err) {
      console.error('Aucun CV trouvé ou erreur de chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try { await logout({}); } catch (_) {}
    finally { localStorage.clear(); window.location.href = '/login'; }
  };

  // Base input change handler
  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({ ...prev, [name]: value }));
  };

  // Nested links change handler
  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({
      ...prev,
      links: { ...prev.links, [name]: value }
    }));
  };

  // Add tag skills
  const addTechSkill = () => {
    if (!techInput.trim()) return;
    setCvData(prev => {
      const current = prev.skills?.technical || [];
      if (current.includes(techInput.trim())) return prev;
      return {
        ...prev,
        skills: { ...prev.skills, technical: [...current, techInput.trim()] }
      };
    });
    setTechInput('');
  };

  const removeTechSkill = (tag) => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter(s => s !== tag)
      }
    }));
  };

  const addSoftSkill = () => {
    if (!softInput.trim()) return;
    setCvData(prev => {
      const current = prev.skills?.soft || [];
      if (current.includes(softInput.trim())) return prev;
      return {
        ...prev,
        skills: { ...prev.skills, soft: [...current, softInput.trim()] }
      };
    });
    setSoftInput('');
  };

  const removeSoftSkill = (tag) => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: prev.skills.soft.filter(s => s !== tag)
      }
    }));
  };

  // Experience handlers
  const addExperience = () => {
    if (!newExp.title || !newExp.company || !newExp.startDate) {
      alert('Veuillez remplir au moins l\'intitulé du poste, l\'entreprise et la date de début.');
      return;
    }
    setCvData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
    setNewExp({ title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    setShowExpForm(false);
  };

  const removeExperience = (index) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  // Education handlers
  const addEducation = () => {
    if (!newEd.degree || !newEd.school || !newEd.startDate) {
      alert('Veuillez remplir au moins le diplôme, l\'établissement et la date de début.');
      return;
    }
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEd]
    }));
    setNewEd({ degree: '', school: '', location: '', startDate: '', endDate: '', isCurrent: false, grade: '' });
    setShowEdForm(false);
  };

  const removeEducation = (index) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Language handlers
  const addLanguage = () => {
    if (!newLang.name) return;
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, newLang]
    }));
    setNewLang({ name: '', level: 'Intermédiaire' });
    setShowLangForm(false);
  };

  const removeLanguage = (index) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  // File selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage({ text: `Fichier sélectionné : ${e.target.files[0].name}`, type: 'success' });
    }
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleCoverPicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPicFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Save full CV profile
  const handleSaveCV = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });

      const formData = new FormData();
      if (file) {
        formData.append('cvFile', file);
      }
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }
      if (coverPicFile) {
        formData.append('coverPic', coverPicFile);
      }
      formData.append('headline', cvData.headline);
      formData.append('summary', cvData.summary);
      formData.append('skills', JSON.stringify(cvData.skills));
      formData.append('experiences', JSON.stringify(cvData.experiences));
      formData.append('education', JSON.stringify(cvData.education));
      formData.append('languages', JSON.stringify(cvData.languages));
      formData.append('links', JSON.stringify(cvData.links));

      const updated = await uploadCV(formData);
      if (updated) {
        setCvData({
          headline: updated.headline || '',
          summary: updated.summary || '',
          skills: updated.skills || { technical: [], soft: [] },
          experiences: updated.experiences || [],
          education: updated.education || [],
          languages: updated.languages || [],
          links: updated.links || { linkedin: '', github: '', portfolio: '' },
          fileName: updated.fileName || '',
          fileUrl: updated.fileUrl || '',
          profilePicUrl: updated.profilePicUrl || '',
          coverPicUrl: updated.coverPicUrl || ''
        });
        setFile(null);
        setProfilePicFile(null);
        setCoverPicFile(null);
        setMessage({ text: 'Votre CV et profil ont été enregistrés avec succès.', type: 'success' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontSize: 16, color: '#6b7280' }}>Chargement de votre profil CV...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── TOPBAR ── */}
      <div style={{ background: '#0B0D17', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', width: 28, height: 28, borderRadius: 6, background: '#5E42F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span onClick={() => navigate('/')} style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', cursor: 'pointer' }}>JobBoard</span>
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
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/jobs" style={{ color: '#A0AAB2', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Offres</Link>
            <Link to="/upload-cv" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Profil</Link>
            <Link to="/my-applications" style={{ color: '#A0AAB2', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Mes candidatures</Link>
          </div>

          {userName && (
            <button onClick={handleLogoutClick} style={{ fontSize: 13, color: '#8CA3BE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 2rem' }}>
        
        {/* ── PROFILE HEADER (LINKEDIN STYLE) ── */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #eaecf0', marginBottom: 32, position: 'relative' }}>
          {/* Cover Image */}
          <div 
            onClick={() => coverPicRef.current.click()}
            style={{ 
            height: 180, 
            background: coverPicFile ? `url(${URL.createObjectURL(coverPicFile)})` : cvData.coverPicUrl ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cvData.coverPicUrl})` : 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 12, pointerEvents: 'none' }}>
              Modifier l'arrière-plan
            </div>
            <input type="file" ref={coverPicRef} onChange={handleCoverPicChange} accept="image/*" style={{ display: 'none' }} />
          </div>
          
          {/* Avatar & Basic Info */}
          <div style={{ padding: '0 24px 24px', position: 'relative' }}>
            <div 
              onClick={() => profilePicRef.current.click()}
              style={{ 
              width: 120, height: 120, borderRadius: '50%', background: '#fff', 
              padding: 4, marginTop: -60, position: 'relative', zIndex: 10,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer'
            }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', background: profilePicFile ? `url(${URL.createObjectURL(profilePicFile)})` : cvData.profilePicUrl ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cvData.profilePicUrl})` : '#5E42F5', 
                backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#fff', fontSize: 40, fontWeight: 700 
              }}>
                {(!profilePicFile && !cvData.profilePicUrl) && (userName ? userName.charAt(0).toUpperCase() : 'U')}
              </div>
              <input type="file" ref={profilePicRef} onChange={handleProfilePicChange} accept="image/*" style={{ display: 'none' }} />
            </div>
            
            <div style={{ marginTop: 16 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0B0D17', margin: '0 0 4px' }}>
                {userName || 'Candidat'}
              </h1>
              <p style={{ fontSize: 16, color: '#4b5563', margin: 0, fontWeight: 500 }}>
                {cvData.headline || 'Ajoutez un titre professionnel...'}
              </p>
            </div>
          </div>
        </div>

        {/* ── HEADER TITLE ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#5E42F5', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
            Espace Candidat
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0B0D17', letterSpacing: '-0.5px', margin: 0 }}>
            Mon CV & Profil Numérique
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Complétez votre profil pour être visible par les recruteurs et postuler en un clic.
          </p>
        </div>

        {message.text && (
          <div style={{
            background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            borderRadius: 12, padding: '14px 18px', fontSize: 14,
            color: message.type === 'success' ? '#065F46' : '#B91C1C',
            marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              {message.type === 'success' ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              )}
            </svg>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveCV} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* ── FILE & LINKS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, order: 2 }}>
            
            {/* FILE UPLOAD CARD */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Fichier CV</h3>
              <div 
                onClick={triggerFileSelect}
                style={{
                  border: '2px dashed #B5D4F4', borderRadius: 12, background: '#F4F9FD',
                  padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s', margin: '12px 0'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#378ADD'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#B5D4F4'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0EEFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E42F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0B0D17', margin: '0 0 4px' }}>
                  Téléverser un nouveau CV
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                  PDF, DOCX jusqu'à 10 Mo
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx" 
                  style={{ display: 'none' }} 
                />
              </div>

              {cvData.fileName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, marginTop: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span style={{ fontSize: 12, color: '#374151', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                    {cvData.fileName}
                  </span>
                  {cvData.fileUrl && (
                    <a 
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cvData.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: 11, color: '#5E42F5', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Voir
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* LINKS CARD */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Réseaux & Liens</h3>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>LinkedIn</label>
                  <input 
                    type="url" 
                    name="linkedin" 
                    value={cvData.links.linkedin || ''} 
                    onChange={handleLinkChange} 
                    placeholder="https://linkedin.com/in/..." 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>GitHub</label>
                  <input 
                    type="url" 
                    name="github" 
                    value={cvData.links.github || ''} 
                    onChange={handleLinkChange} 
                    placeholder="https://github.com/..." 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Portfolio / Site web</label>
                  <input 
                    type="url" 
                    name="portfolio" 
                    value={cvData.links.portfolio || ''} 
                    onChange={handleLinkChange} 
                    placeholder="https://monportfolio.com" 
                    style={inputStyle} 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── DIGITAL PROFILE BUILDER ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, order: 1 }}>
            
            {/* GENERAL PROFILE INFORMATION */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Présentation</h3>
              
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <label style={labelStyle}>Titre professionnel *</label>
                <input 
                  type="text" 
                  name="headline" 
                  value={cvData.headline} 
                  onChange={handleBaseChange} 
                  required
                  placeholder="ex : Développeur React & Node.js" 
                  style={inputStyle} 
                />
              </div>

              <div>
                <label style={labelStyle}>Résumé de votre parcours</label>
                <textarea 
                  name="summary" 
                  rows={5} 
                  value={cvData.summary} 
                  onChange={handleBaseChange} 
                  placeholder="Décrivez brièvement votre expérience, vos spécialités et vos aspirations professionnelles..." 
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} 
                />
              </div>
            </div>

            {/* SKILLS TAGS */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Compétences</h3>
              
              {/* Technical skills */}
              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <label style={labelStyle}>Compétences Techniques</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input 
                    type="text" 
                    value={techInput} 
                    onChange={e => setTechInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechSkill())}
                    placeholder="ex : MongoDB (puis Entrée)" 
                    style={inputStyle} 
                  />
                  <button type="button" onClick={addTechSkill} style={btnInlineAdd}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(cvData.skills?.technical || []).map(tag => (
                    <span key={tag} style={tagStyle}>
                      {tag}
                      <button type="button" onClick={() => removeTechSkill(tag)} style={tagCloseStyle}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft skills */}
              <div>
                <label style={labelStyle}>Qualités & Soft Skills</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input 
                    type="text" 
                    value={softInput} 
                    onChange={e => setSoftInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                    placeholder="ex : Leadership (puis Entrée)" 
                    style={inputStyle} 
                  />
                  <button type="button" onClick={addSoftSkill} style={btnInlineAdd}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(cvData.skills?.soft || []).map(tag => (
                    <span key={tag} style={{ ...tagStyle, background: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
                      {tag}
                      <button type="button" onClick={() => removeSoftSkill(tag)} style={{ ...tagCloseStyle, color: '#166534' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* EXPERIENCE HISTORY */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={cardTitleStyle}>Expériences Professionnelles</h3>
                <button type="button" onClick={() => setShowExpForm(!showExpForm)} style={btnOutline}>
                  {showExpForm ? 'Fermer' : '+ Ajouter'}
                </button>
              </div>

              {/* Exp form */}
              {showExpForm && (
                <div style={inlineFormStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Poste *</label>
                      <input type="text" value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} placeholder="ex : Développeur Backend" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Entreprise *</label>
                      <input type="text" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} placeholder="ex : Orange" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Date de début *</label>
                      <input type="date" value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Date de fin</label>
                      <input type="date" disabled={newExp.isCurrent} value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={newExp.isCurrent} onChange={e => setNewExp({ ...newExp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : newExp.endDate })} style={{ width: 15, height: 15 }} />
                      Poste actuel
                    </label>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Description des missions</label>
                    <textarea rows={3} value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} placeholder="Réalisations, projets menés, technos utilisées..." style={inputStyle} />
                  </div>

                  <button type="button" onClick={addExperience} style={btnSaveItem}>Ajouter l'expérience</button>
                </div>
              )}

              {/* Exp list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {cvData.experiences.map((exp, idx) => (
                  <div key={idx} style={itemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0B0D17', margin: 0 }}>{exp.title}</h4>
                        <span style={{ fontSize: 12, color: '#5E42F5', fontWeight: 600 }}>{exp.company}</span>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {formatDate(exp.startDate)} - {exp.isCurrent ? 'Présent' : formatDate(exp.endDate)}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeExperience(idx)} style={btnDeleteText}>Supprimer</button>
                    </div>
                    {exp.description && <p style={{ fontSize: 12.5, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5 }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* EDUCATION HISTORY */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={cardTitleStyle}>Formation & Diplômes</h3>
                <button type="button" onClick={() => setShowEdForm(!showEdForm)} style={btnOutline}>
                  {showEdForm ? 'Fermer' : '+ Ajouter'}
                </button>
              </div>

              {showEdForm && (
                <div style={inlineFormStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Diplôme *</label>
                      <input type="text" value={newEd.degree} onChange={e => setNewEd({ ...newEd, degree: e.target.value })} placeholder="ex : Master Informatique" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Établissement *</label>
                      <input type="text" value={newEd.school} onChange={e => setNewEd({ ...newEd, school: e.target.value })} placeholder="ex : Université de Casablanca" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Date de début *</label>
                      <input type="date" value={newEd.startDate} onChange={e => setNewEd({ ...newEd, startDate: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Date de fin</label>
                      <input type="date" disabled={newEd.isCurrent} value={newEd.endDate} onChange={e => setNewEd({ ...newEd, endDate: e.target.value })} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={newEd.isCurrent} onChange={e => setNewEd({ ...newEd, isCurrent: e.target.checked, endDate: e.target.checked ? '' : newEd.endDate })} style={{ width: 15, height: 15 }} />
                      En cours d'études
                    </label>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Grade / Mention</label>
                    <input type="text" value={newEd.grade} onChange={e => setNewEd({ ...newEd, grade: e.target.value })} placeholder="ex : Mention Bien" style={inputStyle} />
                  </div>

                  <button type="button" onClick={addEducation} style={btnSaveItem}>Ajouter la formation</button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {cvData.education.map((ed, idx) => (
                  <div key={idx} style={itemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0B0D17', margin: 0 }}>{ed.degree}</h4>
                        <span style={{ fontSize: 12, color: '#5E42F5', fontWeight: 600 }}>{ed.school}</span>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {formatDate(ed.startDate)} - {ed.isCurrent ? 'Présent' : formatDate(ed.endDate)}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeEducation(idx)} style={btnDeleteText}>Supprimer</button>
                    </div>
                    {ed.grade && <span style={{ display: 'inline-block', fontSize: 11, background: '#F3F4F6', color: '#4b5563', padding: '2px 8px', borderRadius: 4, marginTop: 8 }}>{ed.grade}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* LANGUAGES */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={cardTitleStyle}>Langues</h3>
                <button type="button" onClick={() => setShowLangForm(!showLangForm)} style={btnOutline}>
                  {showLangForm ? 'Fermer' : '+ Ajouter'}
                </button>
              </div>

              {showLangForm && (
                <div style={inlineFormStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Langue *</label>
                      <input type="text" value={newLang.name} onChange={e => setNewLang({ ...newLang, name: e.target.value })} placeholder="ex : Anglais" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Niveau *</label>
                      <select value={newLang.level} onChange={e => setNewLang({ ...newLang, level: e.target.value })} style={inputStyle}>
                        {['Débutant', 'Intermédiaire', 'Avancé', 'Courant', 'Natif'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={addLanguage} style={btnSaveItem}>Ajouter la langue</button>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {cvData.languages.map((lang, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 100, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#0B0D17', fontWeight: 600 }}>{lang.name}</span>
                    <span style={{ fontSize: 11, color: '#5E42F5', background: '#F0EEFE', padding: '1px 6px', borderRadius: 100 }}>{lang.level}</span>
                    <button type="button" onClick={() => removeLanguage(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>×</button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SAVE FORM BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, order: 3 }}>
            <button 
              type="button" 
              onClick={() => navigate('/jobs')} 
              style={{
                padding: '12px 24px', fontSize: 15, fontWeight: 500, color: '#4b5563',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={saving}
              style={{
                padding: '12px 32px', borderRadius: 10, background: '#5E42F5',
                color: '#fff', border: 'none', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 6px -1px rgba(94, 66, 245, 0.2)'
              }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer mon Profil CV'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// Inline Styles
const cardStyle = {
  background: '#fff',
  border: '1px solid #eaecf0',
  borderRadius: 20,
  padding: '24px',
};

const cardTitleStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: '#0B0D17',
  margin: 0,
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  fontSize: 13.5,
  color: '#111',
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const tagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11.5,
  fontWeight: 500,
  padding: '4px 10px',
  borderRadius: 100,
  background: '#F0EEFE',
  color: '#5E42F5',
  border: '1px solid #D9D2FC',
};

const tagCloseStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  fontSize: 14,
  fontWeight: 'bold',
  color: '#5E42F5',
  lineHeight: 1,
};

const btnInlineAdd = {
  width: 36,
  height: 36,
  borderRadius: 8,
  background: '#0B0D17',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 600,
};

const btnOutline = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#374151',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const inlineFormStyle = {
  background: '#f7f9fc',
  border: '1px solid #eaecf0',
  borderRadius: 12,
  padding: '16px',
  marginTop: 12,
};

const btnSaveItem = {
  padding: '8px 16px',
  borderRadius: 8,
  background: '#0B0D17',
  color: '#fff',
  border: 'none',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const itemStyle = {
  background: '#f9fafb',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  padding: '14px',
};

const btnDeleteText = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
