"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DashboardPaneRedirect() {
  const params = useParams();

  useEffect(() => {
    const pane = params?.pane || 'sessions';
    window.location.replace(`/?view=dash&pane=${pane}`);
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
