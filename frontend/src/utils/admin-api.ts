'use client';

import { createClient } from '@/utils/supabase/client';

type AdminParams = Record<string, unknown>;

async function getAccessToken() {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return session.access_token;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return body as T;
}

export async function postAdminJson<T = any>(action: string, params: AdminParams = {}): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...params }),
  });

  return parseResponse<T>(response);
}

export async function postAdminForm<T = any>(action: string, formData: FormData): Promise<T> {
  const token = await getAccessToken();
  formData.set('action', action);

  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse<T>(response);
}
