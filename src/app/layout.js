import './globals.css';

export const metadata = {
  title: 'FeonixAI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
