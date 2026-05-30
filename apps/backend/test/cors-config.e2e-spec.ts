import { isAllowedCorsOrigin, parseCorsOrigins } from '../src/config/cors.util';

describe('CORS parser/matcher', () => {
  it('parsea CORS_ORIGIN con coma + trim y elimina vacíos', () => {
    const parsed = parseCorsOrigins(' https://app.example.com,https://admin.example.com , ,');
    expect(parsed).toEqual(['https://app.example.com', 'https://admin.example.com']);
  });

  it('permite origen productivo fijo en allowlist', () => {
    const ok = isAllowedCorsOrigin('https://pos.example.com', ['https://pos.example.com'], {
      isProd: true,
      enableVercelPreviewCors: false,
    });
    expect(ok).toBe(true);
  });

  it('bloquea preview vercel si flag está en false', () => {
    const ok = isAllowedCorsOrigin('https://my-branch-myproj.vercel.app', ['https://pos.example.com'], {
      isProd: true,
      enableVercelPreviewCors: false,
    });
    expect(ok).toBe(false);
  });

  it('permite preview vercel seguro si flag está en true', () => {
    const ok = isAllowedCorsOrigin('https://my-branch-myproj.vercel.app', ['https://pos.example.com'], {
      isProd: true,
      enableVercelPreviewCors: true,
    });
    expect(ok).toBe(true);
  });

  it('bloquea dominios externos no permitidos', () => {
    const ok = isAllowedCorsOrigin('https://evil.example.net', ['https://pos.example.com'], {
      isProd: true,
      enableVercelPreviewCors: true,
    });
    expect(ok).toBe(false);
  });
});
