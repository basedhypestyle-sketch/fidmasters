# Fid Master - React + TypeScript (Vite)

This project contains a React+TypeScript mini app for Fid Master.

## Quickstart

1. Install dependencies:

```
npm install
```

2. Run dev server:

```
npm run dev
```

3. Build:

```
npm run build
```

Notes:
- Index.html includes WalletConnect v1 UMD script for compatibility. Consider migrating to WalletConnect v2 for production.
- Update public/.well-known/farcaster.json and <meta name="fc:frame"> to point to your deployed URL.
