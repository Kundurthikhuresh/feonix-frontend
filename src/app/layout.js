import './globals.css';

export const metadata = {
  title: 'Feonix AI — Next-Generation 3D Real-Time Copilot & Technical Interview Assistant',
  description: 'An innovative dual-layer AI Copilot system engineered for real-time technical interviews and high-stakes meetings with low-latency voice streaming and interactive 3D telemetry.',
  keywords: 'AI Copilot, 3D AI, Technical Interview, Coding Assistant, Real-Time Audio, RAG Context, Teleprompter HUD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
