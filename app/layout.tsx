import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://rooted-identity.vercel.app'),
  title: 'Rooted — Identity that outlives its keys',
  description: 'Michael Tidwell’s proposal for Bitcoin-anchored identity, key rotation, guardian recovery, and revocation. Explore his idea through the whitepaper and interactive diagrams.',
  creator: 'Michael Tidwell',
  alternates: { canonical: '/' },
  openGraph: { title: 'Rooted — Identity that outlives its keys', description: 'One permanent reference. Changing keys. Rooted is an original Bitcoin identity concept by Michael Tidwell.', type: 'article', images: [{ url: '/social-card.png', width: 1200, height: 630, alt: 'Rooted: identity that outlives its keys. Idea and concept by Michael Tidwell.' }] },
  twitter: { card: 'summary_large_image', title: 'Rooted — Identity that outlives its keys', images: ['/social-card.png'] },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
