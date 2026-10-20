# Rooted

**Identity that outlives its keys.** An illustrated whitepaper site and educational model for Bitcoin-anchored key succession, recovery, and revocation.

Idea and concept: **Michael Tidwell**. Rooted is entirely his idea. This site and whitepaper are prepared for Michael to explain his Bitcoin-anchored identity proposal, illustrate the design, and examine its technical foundations. “Rooted” is a working title; no novelty claim is made.

- [Read the site](https://rooted-identity.vercel.app)
- [Whitepaper](docs/whitepaper.md) · [PDF edition](public/rooted-whitepaper.pdf)
- [Source-based technical review](docs/technical-review.md)
- [Diagram source](docs/diagrams.md)

## What is here

A Next.js 16 site with an illustrated paper, keyboard-accessible lifecycle explorer, filterable technical review, primary references, print styles, and an illustrative fee calculator. Content is rendered from `docs/whitepaper.md`; downloads are synchronized during the build.

`lib/protocol.ts` contains an educational 78-byte record codec and a state-transition model. The model takes externally established Bitcoin validity, confirmation, and witness-path facts as inputs. It does not verify those facts. It is not a wallet, signer, script interpreter, transaction parser, or node-backed resolver. The site performs no Bitcoin transactions and has no wallet connection.

## Run locally

Node.js 22.13 or newer (Vercel uses Node 24).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3016.

```sh
npm test
npm run typecheck
npm run build
npm start
```

Browser smoke checks are in `tests/site.spec.ts` and use Playwright. They cover desktop/mobile layout, lifecycle controls and keyboard interaction, review filters, document downloads, and console errors.

```sh
npx playwright install chromium
npx playwright test
```

## PDF edition

The checked-in PDF contains the paper, diagrams, technical review, and references. To regenerate after editorial or print-style changes, build and start the site, then run `npm run export:paper` in another terminal. Review the resulting PDF before committing `public/rooted-whitepaper.pdf`.

## Design boundary

Bitcoin authorizes spends. Rooted clients interpret identity changes. The illustrated scripts do not covenant the successor output or preserve a recovery policy. Control-key compromise can permanently transfer control under the selected chain history. Revocation does not erase old messages. Headers and ordinary txid inclusion proofs alone cannot establish complete, current identity state or authenticate a script-path witness.

A production prototype needs reviewed wallet policies, actual regtest transaction vectors, node-backed discovery and resolution, reorg handling, backup tooling, and independent security review. See the paper for the explicit threat model and roadmap.

## Deployment

The production Vercel project is `rooted-identity`, under `nirgalsofts-projects`, connected to this GitHub repository. Use the project's Git integration or deploy this directory with the Vercel CLI after verifying the project and scope. No runtime environment variables or external services are required. Keep `.vercel` and any environment files out of Git.

## Typography

Self-hosted Space Grotesk, DM Sans, and IBM Plex Mono. Font license files are retained in `public/fonts/`.
