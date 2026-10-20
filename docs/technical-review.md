# Rooted — source-based technical review

Version 0.1 · October 19, 2026

Scope: review of a supplied brainstorming sketch against primary specifications. This is not an independent security audit. No mainnet transaction or node-backed resolver has been implemented or tested. Verdicts distinguish supported building blocks, qualified claims, corrected assumptions, and open implementation work.

## 1. Anchor a key to a Bitcoin output

**Supported.** A transaction can bind a key and an output index in OP_RETURN. The proposed identity meaning is enforced by clients.

[BIP 341](https://bips.dev/341/) · [Bitcoin Core 30.0](https://bitcoincore.org/en/releases/30.0/)

## 2. Taproot enforces rotation and revocation

**Corrected.** Taproot validates spending conditions. The proposed record and resolver define the action and successor. A Bitcoin-valid spend can end continuity.

[BIP 341](https://bips.dev/341/) · [BIP 342](https://bips.dev/342/)

## 3. A NUMS key forces a script reveal

**Qualified.** A verifiably derived point with unknown discrete logarithm makes key-path use computationally unavailable. An address alone does not prove its construction.

[BIP 341](https://bips.dev/341/)

## 4. Timelocks enable automatic rotation

**Corrected.** Timelocks constrain eligibility. Someone must still construct, sign, fund, and broadcast a transaction.

[BIPs 65 / 68 / 112](https://bips.dev/112/)

## 5. A delayed recovery branch provides a veto period

**Corrected.** A simple relative lock runs from output confirmation, not from a later recovery request. Challenge-and-cancel recovery needs additional stages.

[BIPs 65 / 68 / 112](https://bips.dev/112/)

## 6. Guardian recovery is a web of trust

**Corrected.** Guardian keys have control authority. Social endorsement and reputation require separate signed assertions and application rules.

[BIP 342](https://bips.dev/342/) · [DID Core](https://www.w3.org/TR/did/)

## 7. Recovery does not reveal which guardian signed

**Qualified.** A revealed CHECKSIGADD leaf exposes its keys and signing slots. Hiding participants requires a separately analyzed aggregate or threshold construction.

[BIP 342](https://bips.dev/342/) · [BIP 327](https://bips.dev/327/) · [RFC 9591](https://www.rfc-editor.org/rfc/rfc9591.html)

## 8. Shamir shares are threshold signing

**Corrected.** Secret sharing alone reconstructs a secret. It does not supply distributed signature generation or its nonce-safety guarantees.

[RFC 9591](https://www.rfc-editor.org/rfc/rfc9591.html)

## 9. An on-chain anchor is NIP-05

**Corrected.** NIP-05 is a domain-to-key mapping. An anchor can complement discovery; existing Nostr clients do not inherit succession support.

[NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) · [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)

## 10. Headers are enough; no indexing is needed

**Corrected.** Resolvers need spends, records, and relevant witnesses. Inclusion does not prove latest state; witness authentication needs more than a txid Merkle branch.

[BIP 141](https://bips.dev/141/)

## 11. Any public/private key can control the output

**Qualified.** Taproot signature checks use BIP 340 secp256k1 keys. Version 1 application keys use the same format; other key types need an extension.

[BIP 340](https://bips.dev/340/) · [BIP 342](https://bips.dev/342/)

## 12. A bounty proves a key was compromised

**Corrected.** A spend proves the spending conditions were satisfied, not that theft occurred. An attacker may keep a stolen key secret or use a valid rotation.

[BIP 341](https://bips.dev/341/)

## 13. Recovery survives any malicious rotation

**Corrected.** The successor policy can omit the old guardians. The baseline scripts do not enforce policy inheritance across outputs.

[BIP 341](https://bips.dev/341/) · [BIP 342](https://bips.dev/342/)

## 14. 80 bytes is an OP_RETURN consensus limit

**Corrected.** That number described historical relay policy. Core 30.0 changed its defaults; deployment still depends on actual relay and mining policies.

[Bitcoin Core 30.0](https://bitcoincore.org/en/releases/30.0/)

## 15. Continuity proves the same person

**Corrected.** It proves authorized succession under a policy. Keys and control can be transferred; multiple identities can belong to one operator.

[DID Core](https://www.w3.org/TR/did/)

## 16. The design is ready for mainnet

**Open.** A candidate record and educational model are provided. Regtest transactions, reviewed scripts, a real resolver, interoperability vectors, and independent review remain.

See the regtest roadmap in the whitepaper.

## Editorial provenance

Original concept: Michael Tidwell, as attributed in the supplied notes. The stable genesis, OP_RETURN mapping, Taproot control output, NUMS internal key, guardian policies, and use-case-first approach come from those notes. The working name Rooted, fixed-width record, fail-closed resolver profile, illustrative fee model, and implementation roadmap are editorial formulations. Michael has not been represented as approving this text.

Reviewed sources are linked inline. Specifications and draft identity methods can evolve; the date above identifies this review, not a promise that upstream documents will remain unchanged.
