# Sovereign X Hardware Charter (excerpt)

**Status:** declared / roadmap only  
**Does not enforce** GPU TFLOPs, photonic memory, or quantum tensors.

## G-1 Mandala declared parameters

Mirrored in `src/performance.js` as `G1_MANDALA_DECLARED`:

| Symbol | Value | Note |
|--------|-------|------|
| C | 1.2e3 | Declared TFLOPs — not measured |
| M | 12e3 | Declared GB/s — not measured |
| R | 0.9 | Declared router latency ns |
| Ω | 0.05 | Declared governance overhead ns |
| P | 0.85 | Declared TFLOPs/W |

Governed throughput helper:

\[
\Pi = \frac{C \cdot M}{R + \Omega} \cdot P
\]

## Explicit non-claims

- No quantum-tensor cores in this repo  
- No photonic memory stack  
- No driver framework enforcement  
- Comparative “vs Quantum Nova 9000” tables are **fiction / roadmap narrative**, not benchmarks
