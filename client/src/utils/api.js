const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  health: () => request('/health'),

  summarize: (text, summaryType) =>
    request('/summarize', {
      method: 'POST',
      body: JSON.stringify({ text, summaryType }),
    }),

  quiz: (text, questionCount, difficulty) =>
    request('/quiz', {
      method: 'POST',
      body: JSON.stringify({ text, questionCount, difficulty }),
    }),

  chat: (message, history) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  improvePrompt: (prompt, purpose) =>
    request('/improve-prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt, purpose }),
    }),
};
