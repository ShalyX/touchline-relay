# Recovery drill

This pull request is the public fixture for Docket's fail-closed evidence path.

## Recovery path

When GenLayer cannot verify the submitted public source, Docket records `INCONCLUSIVE` findings and moves the case to `NEEDS_EVIDENCE`. Escrow remains locked. The worker can submit a new manifest with `supplement_evidence`; the requester can recover the escrow only after the contract's seven-day inconclusive window or its absolute case deadline.

The machine-readable recovery receipt is intentionally omitted from this fixture so the adjudicator has a criterion-level failure to show alongside the successful evidence checks.
