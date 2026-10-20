'use client';
import { useEffect, useState } from 'react';
export function PdfViewLink() {
  return <a className="text-button" href="/rooted-whitepaper.pdf" target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6z" /></svg>View PDF</a>;
}
export function Contents({ sections }: { sections: { id: string; short: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  useEffect(() => {
    const elements = sections.map(section => document.getElementById(section.id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-100px 0px -65% 0px', threshold: 0 });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);
  return <nav className="contents" aria-label="Whitepaper contents"><span className="eyebrow">IN THIS PAPER</span><ol>{sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{section.short}</a></li>)}</ol><div className="contents-foot"><span className="tiny-dot" /> VERSION 0.1<br /><span>Research draft · October 2026</span></div></nav>;
}
