# Validation record

Validated October 19, 2026, before publication.

- `npm test`: 12 passing educational codec and state-model tests. Includes little-endian encoding, x-only key coordinate validation, sequence overflow, duplicate or invalid records, input binding, missing data, explicit revocation, and terminal states.
- `npm run typecheck`: passes.
- `npm run build`: passes; whitepaper site prerenders as static HTML.
- `npx playwright test`: 3 passing browser checks at desktop (1440 px) and mobile (390 px), including keyboard lifecycle navigation, review filters, fee arithmetic, internal links, downloads, metadata, and absence of browser runtime errors and page-wide overflow.
- PDF: 14 A4 pages, text extracted and representative cover, body, diagram, and reference pages visually checked. The document contains the paper, two in-paper diagrams plus a cover schematic, the technical review, and primary sources.
- Local Next.js / React runtime: pinned in package-lock.json. Production is intended for Vercel Node 24.

The tests validate the educational model and the publishing surface. They do not establish validity of a Bitcoin transaction, verify a Taproot witness, test a wallet, authenticate a blockchain index, or constitute an independent security audit. Regtest implementation and independent protocol review remain future work.
