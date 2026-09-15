// src/lib/api.ts
const API_BASE_URL = typeof window !== 'undefined'
  ? ((import.meta as any).env?.VITE_API_URL || '/api/v1')
  : ((import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api/v1');


export interface FetchApiOptions extends RequestInit {
  token?: string | null;
}

export interface ImageUploadResult {
  url: string;
  fileId: string;
  name: string;
  size: number;
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

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

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

export async function uploadImage(
  file: File,
  token?: string | null
): Promise<ImageUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  return fetchApi<ImageUploadResult>(
    '/images/upload',
    {
      method: 'POST',
      body: formData,
    },
    token
  );
}
