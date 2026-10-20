import type { CSSProperties } from 'react';
export function Arrow({ diagonal = false, className = '' }: { diagonal?: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>;
}
export function Mark({ style }: { style?: CSSProperties }) {
  return <svg style={style} viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M16 3v13m0 0L5 26m11-10 11 10M16 16v13" stroke="currentColor" strokeWidth="2" /><circle cx="16" cy="6" r="4" fill="currentColor" /><circle cx="5" cy="26" r="2.5" fill="currentColor" /><circle cx="27" cy="26" r="2.5" fill="currentColor" /><circle cx="16" cy="29" r="2.5" fill="currentColor" /></svg>;
}
export function GitHubIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.7.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.23-5.07-5.49 0-1.21.43-2.2 1.15-2.98-.12-.28-.5-1.41.11-2.94 0 0 .94-.3 3.05 1.14a10.63 10.63 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.94.72.78 1.15 1.77 1.15 2.98 0 4.27-2.6 5.2-5.08 5.48.4.35.75 1.02.75 2.06V22c0 .3.2.64.77.53A11.1 11.1 0 0 0 12 .9Z" /></svg>;
}
