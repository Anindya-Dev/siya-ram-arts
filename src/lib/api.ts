// src/lib/api.ts
const API_BASE_URL = typeof window !== 'undefined'
  ? ((import.meta as any).env?.VITE_API_URL || '/api/v1')
  : ((import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api/v1');


export interface FetchApiOptions extends RequestInit {
  token?: string | null;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchApiOptions = {},
  token?: string | null
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('/api/v1')
    ? cleanEndpoint
    : `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authToken = token || options.token;
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const { token: _t, ...fetchOptions } = options;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...(fetchOptions.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      const errorText = await response.text().catch(() => '');
      if (errorText) errorDetail = errorText;
    }
    throw new Error(`API Error (${response.status}): ${errorDetail}`);
  }

  return response.json();
}
