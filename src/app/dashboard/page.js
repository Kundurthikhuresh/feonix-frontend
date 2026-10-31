"use client";

import { useEffect } from 'react';

export default function DashboardRedirect() {
  useEffect(() => {
    window.location.replace('/?view=dash');
  }, []);

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
