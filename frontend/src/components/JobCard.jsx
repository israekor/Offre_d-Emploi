

export default function JobCard({ job }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💼</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{job.title}</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{job.company} · {job.location}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {job.skills.map(s => <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#E6F1FB', color: '#0C447C' }}>{s}</span>)}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: '#EAF3DE', color: '#27500A' }}>{job.type}</span>
        <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>il y a {job.ago}</div>
      </div>
    </div>
  );
}