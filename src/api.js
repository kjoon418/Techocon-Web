export const BASE_URL = 'http://localhost:8000';

async function request(path, params = {}) {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const raw = body?.detail;
    const message = Array.isArray(raw)
      ? raw.map((e) => e.msg).join(', ')
      : (raw ?? `HTTP ${res.status}`);
    throw new Error(message);
  }
  return res.json();
}

export const searchReviews = ({ query, track, mission, limit = 50, summarize = true }) =>
  request('/api/search', { query, track, mission, limit, summarize });

export const getConversation = (conversationId) =>
  request(`/api/conversations/${conversationId}`);

export const getTracks = () => request('/api/tracks');

export const getMissions = (track) =>
  request('/api/missions', track ? { track } : {});
