import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';

const SAMPLE_JOBS = [
  { id: 1, title: 'Backend Developer', company: 'TechCorp', location: 'Casablanca', type: 'Full-time', skills: ['Node.js', 'MongoDB', 'Docker'], ago: '2j' },
  { id: 2, title: 'Frontend React Developer', company: 'StartupXYZ', location: 'Télétravail', type: 'Remote', skills: ['React', 'TypeScript', 'Tailwind'], ago: '5j' },
  { id: 3, title: 'DevOps Engineer', company: 'CloudSys', location: 'Rabat', type: 'Full-time', skills: ['Kubernetes', 'CI/CD', 'AWS'], ago: '1j' },
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Dépôt de CV',
    desc: 'Téléversez votre CV, visible par les recruteurs.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
    title: 'Candidature rapide',
    desc: 'Postulez en un clic avec votre profil.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: 'Alertes emploi',
    desc: 'Recevez les offres selon vos critères.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: 'Dashboard',
    desc: 'Suivez vos candidatures en temps réel.',
  },
];

const STATS = [
  ['12 800', 'Offres actives'],
  ['3 200', 'Entreprises'],
  ['48 000', 'Candidats'],
  ['91%', 'Satisfaction'],
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff' }}>

      {/* ── HERO ── */}
      <section style={{ background: '#0C1F3C', padding: '100px 2rem 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontWeight: 600,
            padding: '4px 14px', borderRadius: 100,
            background: 'rgba(55,138,221,0.15)', color: '#85B7EB',
            border: '1px solid rgba(55,138,221,0.25)',
            letterSpacing: '0.05em', marginBottom: 28,
          }}>
            +50 offres publiées ce mois
          </span>
          <h1 style={{
            fontSize: 48, fontWeight: 700, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 20px',
          }}>
            Trouvez l'emploi qui vous<br />
            <span style={{ color: '#378ADD' }}>correspond vraiment</span>
          </h1>
          <p style={{ fontSize: 17, color: '#8CA3BE', lineHeight: 1.75, margin: '0 auto 36px', maxWidth: 440 }}>
            Des milliers d'offres tech, dev et IT. Déposez votre CV, postulez en un clic.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={btnPrimary}>
              Commencer gratuitement
            </button>
            <button onClick={() => navigate('/jobs')} style={btnGhost}>
              Voir les offres →
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {STATS.map(([n, l], i) => (
          <div key={l} style={{
            padding: '32px 52px', textAlign: 'center',
            borderRight: i < STATS.length - 1 ? '1px solid #eaecf0' : 'none',
          }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-1px' }}>{n}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ background: '#f7f9fc', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 48, letterSpacing: '-0.5px', color: '#0C1F3C' }}>
            Tout ce dont vous avez besoin
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: 16,
                border: '1px solid #eaecf0', padding: '28px 22px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: '#E6F1FB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#0C1F3C', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOB LIST ── */}
      <section style={{ padding: '80px 2rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
                Dernières offres
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.5px', color: '#0C1F3C' }}>Offres récentes</h2>
            </div>
            <button onClick={() => navigate('/jobs')} style={btnOutline}>Toutes les offres →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SAMPLE_JOBS.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ background: '#0C1F3C', padding: '64px 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Prêt à trouver votre prochain poste ?
        </h2>
        <p style={{ color: '#8CA3BE', fontSize: 16, margin: '0 0 28px' }}>
          Rejoignez 48 000 candidats déjà inscrits.
        </p>
        <button onClick={() => navigate('/register')} style={btnPrimary}>
          Créer un compte gratuitement
        </button>
      </section>

    </div>
  );
}

const btnPrimary = {
  padding: '13px 28px', borderRadius: 10,
  background: '#378ADD', color: '#fff',
  border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer',
};

const btnGhost = {
  padding: '13px 28px', borderRadius: 10,
  background: 'transparent', color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  fontSize: 15, cursor: 'pointer',
};

const btnOutline = {
  padding: '10px 20px', borderRadius: 8,
  background: '#fff', border: '1px solid #d1d5db',
  fontSize: 14, cursor: 'pointer', color: '#374151', fontWeight: 500,
};