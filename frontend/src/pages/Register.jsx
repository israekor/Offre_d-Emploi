import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', role: 'candidate', phone: '', location: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = field => e => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register({
        name: form.firstName.trim() + ' ' + form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        avatar: null,
        phone: form.phone,
        location: form.location,
      });
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      if (user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div style={wrap}>
      <form onSubmit={handleSubmit} style={card}>


      {/* Logo / brand mark */}
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, cursor: 'pointer' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#0C1F3C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.3px' }}>JobBoard</span>
      </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
          Créer un compte
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>
          Rejoignez des milliers de candidats.
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#B91C1C', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Prénom</label>
            <input style={inputStyle} placeholder="Prénom" value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div>
            <label style={labelStyle}>Nom</label>
            <input style={inputStyle} placeholder="Nom" value={form.lastName} onChange={set('lastName')} required />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Adresse email</label>
          <input style={inputStyle} type="email" placeholder="vous@exemple.com" value={form.email} onChange={set('email')} required />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Mot de passe</label>
          <input style={inputStyle} type="password" placeholder="8 caractères minimum" value={form.password} onChange={set('password')} required minLength={8} />
        </div>

        {/* Phone + Location row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input style={inputStyle} type="tel" placeholder="06 00 00 00 00" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label style={labelStyle}>Localisation</label>
            <input style={inputStyle} type="text" placeholder="Casablanca, Rabat…" value={form.location} onChange={set('location')} />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>Je suis</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
            {[
              { value: 'candidate', label: 'Candidat', sub: 'Je cherche un emploi' },
              { value: 'recruiter', label: 'Recruteur', sub: 'Je publie des offres' },
            ].map(opt => (
              <label key={opt.value} style={{
                display: 'flex', flexDirection: 'column', gap: 2,
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                border: form.role === opt.value ? '2px solid #378ADD' : '1px solid #d1d5db',
                background: form.role === opt.value ? '#E6F1FB' : '#fff',
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio" name="role" value={opt.value}
                  checked={form.role === opt.value}
                  onChange={set('role')}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: form.role === opt.value ? '#0C447C' : '#374151' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: 11, color: form.role === opt.value ? '#185FA5' : '#9ca3af' }}>
                  {opt.sub}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={btnPrimary}>
          Créer mon compte
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', margin: '20px 0 0' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#378ADD', fontWeight: 500, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

      </form>
    </div>
  );
}

const wrap = {
  minHeight: '100vh',
  background: '#f7f9fc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const card = {
  background: '#fff',
  border: '1px solid #eaecf0',
  borderRadius: 20,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 480,
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  color: '#111',
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const btnPrimary = {
  display: 'block',
  width: '100%',
  marginTop: 20,
  padding: '12px',
  borderRadius: 10,
  background: '#0C1F3C',
  color: '#fff',
  border: 'none',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '-0.1px',
  fontFamily: 'inherit',
};