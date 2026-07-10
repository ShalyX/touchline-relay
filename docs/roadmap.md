# Touchline Relay roadmap

## Shipped in this MVP

- Local QVAC Bergamot translation (EN → ES / FR / DE / PT)
- PearRuntime + Hyperswarm structured announcement relay
- Leave room without restart
- Peer receipt ACKs (honest delivery signals from connected peers only)
- Desktop package path (Electron Forge package / make)

## Intentionally not in MVP

### WDK / wallets

Wallet or self-custodial payment flows were feasible in spikes but crowded on the competition board and not load-bearing for matchday alerts. Revisit only if a concrete organizer payment pain (e.g. referee cash-out) becomes the product, not a bolted track checkbox.

### V2 open marketplace

An open marketplace for idle-agent micro-work / funded ops jobs is a different product surface (escrow, discovery, reputation). It should not dilute the bilingual alert demo.

### Full multi-tenant production SaaS

Hosting this as a website would require either cloud translation or shipping the model to every browser and would invert the “no application server” claim. Distribution remains desktop package / source install.

## Next product increments (post-hackathon)

1. Signed room invites / organizer identity
2. Mobile receiver companion (still local translation on organizer)
3. Installer pipelines for Windows MSIX / macOS DMG on CI
4. Optional multi-hop store-and-forward for intermittently connected venues
5. Accessibility pass for high-glare outdoor screens
