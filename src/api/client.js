const BASE_URL = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status });
  }
  return res.json();
}

export const api = {
  products: {
    list: (sort = '-created_date', limit = 100) =>
      request('GET', `/products?sort=${sort}&limit=${limit}`),
    filter: (filters = {}, sort = '-created_date', limit = 50) => {
      const params = new URLSearchParams({ sort, limit });
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null) params.set(k, String(v));
      }
      return request('GET', `/products?${params}`);
    },
    get: (id) => request('GET', `/products/${id}`),
    create: (data) => request('POST', '/products', data),
    update: (id, data) => request('PUT', `/products/${id}`, data),
    delete: (id) => request('DELETE', `/products/${id}`),
  },
  orders: {
    list: (sort = '-created_date', limit = 100) =>
      request('GET', `/orders?sort=${sort}&limit=${limit}`),
    create: (data) => request('POST', '/orders', data),
    update: (id, data) => request('PUT', `/orders/${id}`, data),
  },
};
