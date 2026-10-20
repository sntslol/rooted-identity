import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://rooted-identity.vercel.app'),
  title: 'Rooted — Identity that outlives its keys',
  description: 'An illustrated research proposal for Bitcoin-anchored identity, key rotation, guardian recovery, and revocation. From an idea by Michael Tidwell.',
  alternates: { canonical: '/' },
  openGraph: { title: 'Rooted — Identity that outlives its keys', description: 'One permanent reference. Changing keys. A Bitcoin identity research proposal from an idea by Michael Tidwell.', type: 'article', images: [{ url: '/social-card.png', width: 1200, height: 630, alt: 'Rooted: identity that outlives its keys. A Bitcoin identity research proposal.' }] },
  twitter: { card: 'summary_large_image', title: 'Rooted — Identity that outlives its keys', images: ['/social-card.png'] },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
