import './globals.css';
import type { Metadata } from 'next';
import { assertPublicSupabaseEnvAtStartup } from '@/lib/mevo/env';

export const metadata: Metadata = {
  title: 'MEVO — Waitlist',
  description: 'MEVO waitlist'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  assertPublicSupabaseEnvAtStartup();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
