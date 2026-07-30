# Continuity Ledger Protocol (CLP)

**Status:** partial (core) / declared (full protocol)  
**Runtime:** `ContinuityLedger` in `src/ledger.js`

## Ledger equation

For each event \(E_i\):

\[
L(E_i) = \{ A_i, D_i, V_i, T_i, \Delta_i \}
\]

In this reference impl, \(T_i\) is the deterministic **sequence** number (not wall-clock).

## Implemented

- Append-only in-memory events  
- Parent linkage (`parentId`)  
- `replay()` ordered history  
- `auditRecord(id)` RAC projection  

## Not implemented (declared / roadmap)

- Durable storage / cryptographic seals  
- Multi-process replication  
- Cross-host continuity
