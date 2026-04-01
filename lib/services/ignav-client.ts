const BASE_URL = "https://ignav.com/api";

export function isConfigured(): boolean {
  return !!process.env.IGNAV_API_KEY;
}

export async function post<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) throw new IgnavError("IGNAV_KEY_MISSING", 503);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "X-Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new IgnavError(`${res.status}: ${text}`, res.status);
  }

  return res.json() as Promise<T>;
}

export class IgnavError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "IgnavError";
  }
}
