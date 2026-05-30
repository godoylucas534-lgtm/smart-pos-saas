# Frontend Build Notes (Windows / OneDrive)

If `npm run build` fails locally on Windows + OneDrive with errors like:
- `Access is denied`
- `Could not resolve vite.config.ts`

use the Windows-safe scripts below.

## Standard (CI/Vercel-compatible)

```bash
npm run build
```

## Windows-safe local build

```bash
cmd /c npm run build:win
```

This avoids PowerShell `npm.ps1` policy issues and runs tool binaries directly via `node`.

## Fallback when cache/locks cause failures

```bash
cmd /c npm run rebuild:win
```

This will:
1. clean Vite/esbuild local cache folders
2. run the Windows-safe build

## Optional explicit cache cleanup only

```bash
cmd /c npm run clean:cache
```

