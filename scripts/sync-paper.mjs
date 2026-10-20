import { copyFileSync } from 'node:fs';
copyFileSync('docs/whitepaper.md', 'public/whitepaper.md');
copyFileSync('docs/technical-review.md', 'public/technical-review.md');
