const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('hfms_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getSummary: (financialYearId) =>
    request(
      `/dashboard/summary${financialYearId ? `?financialYearId=${financialYearId}` : ''}`,
    ),
  getSchemes: (financialYearId, search = '') => {
    const params = new URLSearchParams();
    if (financialYearId) params.set('financialYearId', financialYearId);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request(`/dashboard/schemes${qs ? `?${qs}` : ''}`);
  },
  getCharts: (financialYearId) =>
    request(
      `/dashboard/charts${financialYearId ? `?financialYearId=${financialYearId}` : ''}`,
    ),
  getAnalytics: (financialYearId) =>
    request(
      `/dashboard/analytics${financialYearId ? `?financialYearId=${financialYearId}` : ''}`,
    ),
  getScheme: (id, financialYearId) =>
    request(
      `/schemes/${id}${financialYearId ? `?financialYearId=${financialYearId}` : ''}`,
    ),
};
