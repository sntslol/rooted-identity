# Rooted diagrams

The site's accessible diagrams are rendered in `app/components/diagrams.tsx` and `app/components/explorer.tsx`. These Mermaid versions provide portable source for reviewers. All transaction IDs, keys, and indices in the illustrations are conceptual placeholders.

## Identity lifecycle

```mermaid
flowchart LR
  G["Stable identity reference: network + genesis txid + vout"]
  U0["U₀ · key K₀"] -->|"Owner-authorized rotation"| U1["U₁ · key K₁"]
  U1 -->|"Guardian-authorized rotation"| U2["U₂ · key K₂"]
  U2 -->|"Explicit revocation"| R["Revoked · no successor"]
  G -.-> U0
  G -.-> U1
  G -.-> U2
  U1 -->|"Spend without a valid v1 continuation"| T["Terminated"]
```

All transitions shown require confirmed Bitcoin-valid spends in the chosen chain view. Missing verification data produces an unresolved result. A reorg can undo a transition.

## Creation transaction

```mermaid
flowchart LR
  F["Funding input(s)"] --> TX["Creation transaction"]
  TX --> U["Output 0: funded P2TR control U₀"]
  TX --> D["Output 1: OP_RETURN, key K₀, successor index 0"]
  TX --> C["Optional wallet change"]
  D -.-> U
```

## Taproot authorization policy

```mermaid
flowchart TD
  Q["P2TR output key: NUMS internal point + tree commitment"]
  Q --> O["Owner script: dedicated control-key signature"]
  Q --> G["Guardian script: 2-of-3 CHECKSIGADD policy"]
  O --> S["Bitcoin-valid spend"]
  G --> S
  S --> V["Client validates record, sequence, input binding, and successor"]
  V --> A["Rotate / revoke / terminate"]
```

The branches are alternatives. The key path is assumed computationally unavailable only when the NUMS construction is sound. Neither branch forces a successor or guarantees recovery-policy inheritance.
