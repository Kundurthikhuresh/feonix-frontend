"use client";

import { useEffect } from 'react';

export default function DashboardRedirect({ params }) {
  useEffect(() => {
    Promise.resolve(params).then((p) => {
      const pane = p?.pane?.[0] || 'sessions';
      window.location.replace(`/?view=dash&pane=${pane}`);
    });
  }, [params]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0d14',
      color: '#00f5ff',
      fontFamily: 'sans-serif'
    }}>
      <span>Opening Dashboard...</span>
    </div>
  );
}

