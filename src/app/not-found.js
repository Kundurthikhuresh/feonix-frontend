import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0c0d0e',
      color: '#F3F4F4',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: '#A1A7B3', marginBottom: '20px' }}>Could not find requested resource</p>
      <Link
        href="/?view=dash"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '999px',
          color: '#FFFFFF',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '600'
        }}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
