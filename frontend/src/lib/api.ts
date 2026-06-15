const BASE = import.meta.env.BASE_URL || "/";

export function api(path: string): string {
  return `${BASE}api/${path.replace(/^\/+/, "")}`;
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(api(path), {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
