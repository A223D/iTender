import { vi } from "vitest";

// ---------------------------------------------------------------------------
// Query chain builder
// Produces a chainable Supabase-style query object whose terminal calls
// (.single(), .insert(), .upsert()) resolve to the provided result.
// Non-terminal calls (.select(), .eq(), etc.) return `this` for chaining.
// ---------------------------------------------------------------------------
export function qChain(result: { data?: unknown; error?: unknown } = {}) {
  const resolved = { data: result.data ?? null, error: result.error ?? null };
  const c: Record<string, unknown> = {};
  const terminal = () => Promise.resolve(resolved);
  c.select = vi.fn().mockReturnValue(c);
  c.insert = vi.fn().mockImplementation(terminal);
  c.upsert = vi.fn().mockImplementation(terminal);
  c.update = vi.fn().mockReturnValue(c);
  c.delete = vi.fn().mockReturnValue(c);
  c.eq = vi.fn().mockReturnValue(c);
  c.neq = vi.fn().mockReturnValue(c);
  c.single = vi.fn().mockImplementation(terminal);
  c.order = vi.fn().mockReturnValue(c);
  c.limit = vi.fn().mockReturnValue(c);
  c.gte = vi.fn().mockReturnValue(c);
  c.ilike = vi.fn().mockReturnValue(c);
  return c;
}

// ---------------------------------------------------------------------------
// Mock Supabase client builder
// Pass a `fromFn` when you need different responses per table (or per call).
// ---------------------------------------------------------------------------
export type MockUser = { id: string; email: string } | null;

export interface MockClientOptions {
  user?: MockUser;
  fromFn?: (table: string) => ReturnType<typeof qChain>;
  rpcError?: unknown;
  adminDeleteUserError?: unknown;
  storageListData?: { name: string }[];
  storageRemoveError?: unknown;
}

export function mockClient(opts: MockClientOptions = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user ?? null }, error: null }),
      admin: {
        deleteUser: vi.fn().mockResolvedValue({
          data: {},
          error: opts.adminDeleteUserError ?? null,
        }),
      },
    },
    from: vi.fn((table: string) =>
      opts.fromFn ? opts.fromFn(table) : qChain(),
    ),
    rpc: vi.fn().mockResolvedValue({ data: null, error: opts.rpcError ?? null }),
    storage: {
      from: vi.fn(() => ({
        list: vi.fn().mockResolvedValue({
          data: opts.storageListData ?? [],
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({ error: opts.storageRemoveError ?? null }),
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Helper: build a minimal Request object
// ---------------------------------------------------------------------------
export function makeRequest(
  url: string,
  {
    method = "POST",
    body,
    headers = {},
  }: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Request {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
