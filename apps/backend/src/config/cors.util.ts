export function parseCorsOrigins(raw: string | undefined): string[] {
  return String(raw || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedCorsOrigin(
  origin: string,
  allowlist: string[],
  options: {
    isProd: boolean;
    enableVercelPreviewCors: boolean;
  },
): boolean {
  if (allowlist.includes(origin)) return true;

  const localhostDevRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  if (!options.isProd && localhostDevRegex.test(origin)) return true;

  if (options.enableVercelPreviewCors) {
    const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i;
    if (vercelPreviewRegex.test(origin)) return true;
  }

  return false;
}

