// Patch para resolver incompatibilidade de tipos entre NextAuth e Next.js 15

declare module "@auth/core/lib/utils/cookie.js" {
  export interface RequestInternal {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    query?: Record<string, unknown>;
    cookies?: Record<string, string>;
  }
}

declare module "@auth/core/types.js" {
  export interface RequestInternal {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    query?: Record<string, unknown>;
    cookies?: Record<string, string>;
  }

  export interface CookieOption {
    name: string;
    options: {
      domain?: string;
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      sameSite?: "strict" | "lax" | "none";
      secure?: boolean;
    };
  }

  export interface LoggerInstance {
    error: (message: unknown, ...args: unknown[]) => void;
    warn: (message: unknown, ...args: unknown[]) => void;
    debug: (message: unknown, ...args: unknown[]) => void;
  }
}
