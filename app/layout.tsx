import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Strong Password Tester - Test Your Password Security',
  description: 'Test your password strength with our advanced security analyzer. Get real-time feedback on password security, check for dictionary words, and generate strong passwords.',
  keywords: 'password tester, password strength, security, password generator, cybersecurity',
  authors: [{ name: 'Built with Bolt.new' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}