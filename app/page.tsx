import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Arrow, Mark, GitHubIcon } from './components/icons';
import { RootMap, TransactionDiagram, PolicyDiagram } from './components/diagrams';
import { Explorer, FeeCalculator } from './components/explorer';
import { Contents, PrintButton } from './components/reader-tools';
import { TechnicalReview } from './components/review';
import { references } from '@/lib/review';
const REPO = 'https://github.com/sntslol/rooted-identity';
const chapters = [
  { id: 'abstract', short: 'Abstract' },
  { id: 'the-problem', short: 'The problem' },
  { id: 'the-model', short: 'The model' },
  { id: 'the-lifecycle', short: 'The lifecycle' },
  { id: 'transaction-record', short: 'Transaction record' },
  { id: 'taproot-policy', short: 'What Taproot contributes' },
  { id: 'verification', short: 'Verification' },
  { id: 'security', short: 'Compromise & trust' },
  { id: 'applications', short: 'Useful first' },
  { id: 'costs-limits', short: 'Costs & next steps' },
];
export default function Page() {
  const markdown = readFileSync(join(process.cwd(), 'docs/whitepaper.md'), 'utf8');
  const sections = markdown.split(/^## /m).slice(1).map((text, index) => {
    const split = text.indexOf('\n');
    return { ...chapters[index], title: text.slice(0, split), body: text.slice(split + 1) };
  });
  const words = markdown.trim().split(/\s+/).length;
  return <>
    <a className="skip-link" href="#paper">Skip to the whitepaper</a>
    <header className="site-header"><a className="wordmark" href="#" aria-label="Rooted home"><Mark /><span>rooted<span className="wordmark-period">.</span></span></a><nav aria-label="Main navigation"><a href="#paper">The paper</a><a href="#explore">Explore the idea</a><a href="#review">Technical review</a></nav><a className="github-link" href={REPO} target="_blank" rel="noreferrer"><GitHubIcon /><span>View source</span><Arrow diagonal /></a></header>
    <main>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><div className="hero-eyebrow"><span className="tiny-dot" /> A BITCOIN IDENTITY PROPOSAL <span className="draft-tag">RESEARCH DRAFT</span></div><h1 id="hero-title">Identity that<br />outlives its <span>keys.</span></h1><p className="hero-description">A permanent reference for a changing set of keys.<br className="desktop-break" /> Built on Bitcoin. Governed through Taproot.<br className="desktop-break" /> Designed for the applications people actually use.</p><div className="hero-actions"><a href="#paper" className="button button-primary">Read the whitepaper <Arrow /></a><a href="#explore" className="button button-quiet">Explore the lifecycle <Arrow diagonal /></a></div><div className="hero-credit"><span className="credit-line" /><div>From an idea by <strong>Michael Tidwell</strong><span>Developed from a conversation. Open for review.</span></div></div></div><RootMap /><div className="hero-bottom"><span>BITCOIN AS THE RECORD. TAPROOT AS THE CONTROL POLICY.</span><span>v0.1 <span className="meta-divider">/</span> OCTOBER 2026</span></div></section>
      <div className="thesis-strip"><span className="thesis-symbol">↳</span><p>A key can change.<br /><strong>The history doesn’t have to start over.</strong></p><div><span>THE CORE DISTINCTION</span><p>Bitcoin verifies the spend.<br />Applications interpret identity.</p></div></div>
      <Explorer />
      <section className="print-title"><div className="wordmark"><Mark /><span>rooted.</span></div><span className="eyebrow">A BITCOIN IDENTITY RESEARCH PROPOSAL</span><h1>Identity that<br />outlives its keys.</h1><p className="print-subtitle">A Bitcoin-anchored model for key continuity, recovery, and revocation.</p><div className="print-cover-diagram"><div>Stable genesis reference</div><span>↓</span><div>K₀ + U₀ <span>→</span> K₁ + U₁ <span>→</span> K₂ + U₂</div><p>The origin stays fixed. Keys and control outputs change.</p></div><p><strong>Original idea: Michael Tidwell</strong><br />Version 0.1 · Research draft · October 19, 2026</p><p className="print-provenance">Developed from a supplied brainstorming sketch. The protocol formulation and technical review are editorial proposals pending Michael’s review. This is a design study, not a production protocol or an independent security audit.</p><p className="print-site">rooted-identity.vercel.app · github.com/sntslol/rooted-identity</p></section>
      <div className="paper-divider" id="paper"><div><span className="eyebrow">THE WHITEPAPER</span><h2>A stable origin.<br />An explicit chain of control.</h2></div><div className="paper-meta"><span>VERSION 0.1 · OCT 19, 2026</span><span>{Math.ceil(words / 220)} MIN READ · 10 CHAPTERS</span><div><a href="/rooted-whitepaper.pdf" download className="text-button">Download PDF <Arrow /></a><a href="/whitepaper.md" download className="text-button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg>Download .md</a><PrintButton /></div></div></div>
      <div className="paper-layout"><aside className="paper-sidebar"><Contents sections={chapters} /></aside><article className="manuscript" aria-label="Rooted whitepaper"><div className="paper-notice"><span className="notice-mark">i</span><p><strong>A proposal, ready to question.</strong> This is a research draft, not a deployed identity protocol. The original idea is Michael Tidwell’s; the protocol details and technical review are editorial proposals, pending his review.</p></div>{sections.map((section, index) => <section className="paper-chapter" key={section.id} id={section.id}><div className="chapter-heading"><span className="chapter-number">{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2><a className="heading-anchor" href={`#${section.id}`} aria-label={`Link to ${section.title}`}>#</a></div><div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ table: ({ children }) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Transaction record fields"><table>{children}</table></div>, a: ({ href, children }) => <a href={href} target={href?.startsWith('https:') ? '_blank' : undefined} rel={href?.startsWith('https:') ? 'noreferrer' : undefined}>{children}</a> }}>{section.body}</ReactMarkdown></div>{section.id === 'the-model' ? <TransactionDiagram /> : null}{section.id === 'taproot-policy' ? <PolicyDiagram /> : null}{section.id === 'costs-limits' ? <FeeCalculator /> : null}</section>)}<div className="paper-end"><Mark /><span>End of paper · Begin the discussion.</span><a href={`${REPO}/issues`} target="_blank" rel="noreferrer">Open an issue <Arrow diagonal /></a></div></article></div>
      <TechnicalReview />
      <section className="references-section" id="references" aria-labelledby="references-title"><div className="section-intro"><div><span className="eyebrow">FOLLOW THE EVIDENCE</span><h2 id="references-title">Primary sources.</h2></div><p>The specifications behind the claims.<br />Read them. Challenge our interpretation.</p></div><div className="reference-grid">{references.map((source, index) => <a id={`ref-${source.id}`} href={source.url} key={source.id} target="_blank" rel="noreferrer"><span className="reference-index">[{String(index + 1).padStart(2, '0')}]</span><div><strong>{source.title}</strong><p>{source.subtitle}</p></div><Arrow diagonal /></a>)}</div></section>
      <section className="closing"><Mark /><div><span className="eyebrow">BUILD SOMETHING USEFUL FIRST</span><h2>The next step is a working experiment.</h2><p>A regtest wallet. A resolver. A game that survives a lost key.</p></div><a href={REPO} className="button button-primary" target="_blank" rel="noreferrer">Explore the repository <Arrow diagonal /></a></section>
    </main>
    <footer className="site-footer"><a className="wordmark" href="#"><Mark /><span>rooted.</span></a><p>Original idea by Michael Tidwell.<br />A research proposal for Bitcoin-anchored identity.</p><div><a href="/whitepaper.md" download>Whitepaper</a><a href="#review">Technical review</a><a href={REPO} target="_blank" rel="noreferrer">GitHub <Arrow diagonal /></a></div><span className="footer-note">WORKING TITLE · OPEN RESEARCH · 2026</span></footer>
  </>;
}
