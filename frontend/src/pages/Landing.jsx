import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';

const SAMPLE_JOBS = [
  { id: 1, title: 'Backend Developer', company: 'TechCorp', location: 'Casablanca', type: 'Full-time', skills: ['Node.js', 'MongoDB', 'Docker'], ago: '2j' },
  { id: 2, title: 'Frontend React Developer', company: 'StartupXYZ', location: 'Télétravail', type: 'Remote', skills: ['React', 'TypeScript', 'Tailwind'], ago: '5j' },
  { id: 3, title: 'DevOps Engineer', company: 'CloudSys', location: 'Rabat', type: 'Full-time', skills: ['Kubernetes', 'CI/CD', 'AWS'], ago: '1j' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#F8F9FA', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── TOP NAVIGATION ── */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '24px 48px', maxWidth: 1400, margin: '0 auto' 
      }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
          JobBoard
        </div>
        
        {/* User asked to remove the middle links (Home, About Us, etc.) */}
        <div style={{ display: 'none' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'transparent', border: '1px solid #111', borderRadius: 24, 
              padding: '10px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#111' 
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            style={{ 
              background: '#5E42F5', border: 'none', borderRadius: 24, 
              padding: '10px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#fff' 
            }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{ 
        position: 'relative', maxWidth: 1400, margin: '0 auto', padding: '40px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40
      }}>
        
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(235,248,235,0.8) 0%, rgba(248,249,250,0) 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '20%', right: '-5%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(255,245,230,0.8) 0%, rgba(248,249,250,0) 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '30%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(230,240,255,0.8) 0%, rgba(248,249,250,0) 70%)', zIndex: 0 }} />

        {/* LEFT TEXT CONTENT */}
        <div style={{ flex: '1.2', position: 'relative', zIndex: 10, paddingRight: 40 }}>
          <h1 style={{ 
            fontSize: 72, fontWeight: 800, color: '#111', lineHeight: 1.05, 
            letterSpacing: '-2px', margin: '0 0 24px' 
          }}>
            Trouvez l'emploi<br/>
            qui vous <span style={{ color: '#5E42F5' }}>correspond<br/>vraiment</span>
          </h1>
          <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, margin: '0 0 40px', maxWidth: 480 }}>
            Des milliers d'offres tech, dev et IT. Déposez votre CV, postulez en un clic. L'emploi idéal à portée de main.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 60 }}>
            <button 
              onClick={() => navigate('/register')}
              style={{ 
                background: '#5E42F5', color: '#fff', border: 'none', borderRadius: 30, 
                padding: '16px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(94, 66, 245, 0.25)'
              }}
            >
              Commencer gratuitement
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5E42F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Assistance 24/7
            </div>
          </div>

          {/* Floating cards at the bottom left */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginTop: 40 }}>
            {/* Dark Card */}
            <div style={{ 
              background: '#0B0D17', borderRadius: 16, padding: '32px 24px', 
              color: '#fff', width: 220, textAlign: 'center', position: 'relative', zIndex: 20
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 24 }}>Nouvelle levée<br/>de fonds</div>
              {/* Circular progress graphic */}
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#333" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00E5FF" strokeWidth="3" strokeDasharray="75, 100" />
                </svg>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, letterSpacing: '-1px' }}>2.7k</div>
              <div style={{ fontSize: 12, color: '#A0AAB2', lineHeight: 1.4 }}>D'un autre côté,<br/>finance d'entreprise</div>
            </div>

            {/* Purple Card */}
            <div style={{ 
              background: '#B3A4FF', borderRadius: 16, padding: '24px', 
              width: 200, position: 'relative', zIndex: 20
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 4 }}>5000+</div>
              <div style={{ fontSize: 14, color: '#333', fontWeight: 500, marginBottom: 24 }}>Candidats</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFC107', border: '2px solid #B3A4FF', marginLeft: 0 }} />
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E91E63', border: '2px solid #B3A4FF', marginLeft: -12 }} />
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', border: '2px solid #B3A4FF', marginLeft: -12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 500 }}>+</div>
              </div>
            </div>
            
            {/* Rotating stamp graphic (simplified as static text/icon) */}
            <div style={{ position: 'absolute', right: -40, bottom: 120, width: 120, height: 120, animation: 'spin 10s linear infinite' }}>
               <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                 <path id="curve" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent"/>
                 <text width="500">
                   <textPath href="#curve" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2 }}>
                     PLANNING TODAY FOR A PROSPEROUS TOMORROW •
                   </textPath>
                 </text>
                 <path d="M 50 35 L 50 65 M 35 50 L 65 50 M 39 39 L 61 61 M 39 61 L 61 39" stroke="#111" strokeWidth="2" />
               </svg>
               <style>
                 {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
               </style>
            </div>
          </div>
        </div>

        {/* RIGHT GRAPHICS CONTENT */}
        <div style={{ flex: '1', position: 'relative', height: 700 }}>
          
          {/* Main Character Image */}
          <div style={{ 
            position: 'absolute', top: 0, left: '10%', width: '80%', height: 450, 
            background: 'transparent', borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {/* The image is loaded from the public folder. Please ensure your image is named 'guy.jpg' and placed in the 'public' directory of the frontend. */}
            <img 
              src="/guy.jpg" 
              alt="Candidat" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback silhouette if image not found */}
            <div style={{ display: 'none', width: '100%', height: '100%', background: '#e2e8f0', alignItems: 'flex-end', justifyContent: 'center' }}>
                <svg width="200" height="250" viewBox="0 0 24 24" fill="#cbd5e1">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
          </div>

        </div>

      </section>

      {/* ── BOTTOM STATS ROW ── */}
      <section style={{ 
        maxWidth: 1400, margin: '60px auto 100px', padding: '0 48px',
        display: 'flex', justifyContent: 'flex-end', gap: 60, position: 'relative', zIndex: 10
      }}>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#111', letterSpacing: '-1px' }}>49.4K</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Téléchargements</div>
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#111', letterSpacing: '-1px' }}>37K</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Utilisateurs actifs</div>
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#111', letterSpacing: '-1px' }}>1.2M+</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Abonnés</div>
        </div>
      </section>

    </div>
  );
}