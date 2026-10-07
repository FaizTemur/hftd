import './globals.css';
import { Unbounded, Inter, JetBrains_Mono } from 'next/font/google';

const d = Unbounded({ subsets: ['latin'], weight: ['900'], variable: '--fd' });
const b = Inter({ subsets: ['latin'], variable: '--fb' });
const m = JetBrains_Mono({ subsets: ['latin'], variable: '--fm' });

export const metadata = {
  title: 'HACKATHON FOR THE DUMBEST — COMSATS Lahore',
  description: 'Build something stupid. COMSATS University Islamabad, Lahore Campus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${d.variable} ${b.variable} ${m.variable}`}>{children}</body>
    </html>
  );
}