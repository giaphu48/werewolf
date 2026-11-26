import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ma Sói Online | Werewolf Real-time',
  description:
    'Nền tảng chơi game Ma Sói trực tuyến theo thời gian thực từ 6 đến 16 người chơi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
