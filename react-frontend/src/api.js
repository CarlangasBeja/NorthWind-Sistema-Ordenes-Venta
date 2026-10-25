const tokenKey = "northwind.accessToken";
const legacyTokenKey = "northwind.tokens.v3";

export function getStoredToken() {
  let token = localStorage.getItem(tokenKey);
  if (!token) {
    const legacyTokens = localStorage.getItem(legacyTokenKey);
    if (legacyTokens) {
      try {
        const stored = JSON.parse(legacyTokens);
        token = stored.accessToken ?? stored.AccessToken ?? null;
        if (token) localStorage.setItem(tokenKey, token);
      } catch {
        localStorage.removeItem(legacyTokenKey);
      }
      localStorage.removeItem(legacyTokenKey);
    }
  }
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=")));
    if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem(tokenKey);
      return null;
    }
  } catch {
    localStorage.removeItem(tokenKey);
    return null;
  }

  return token;
}

export function saveToken(token) {
  localStorage.setItem(tokenKey, token);
  localStorage.removeItem(legacyTokenKey);
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(legacyTokenKey);
  localStorage.removeItem("tokens");
}

async function readError(response) {
  const body = await response.text();
  if (!body) return `La solicitud falló (${response.status}).`;

  try {
    const data = JSON.parse(body);
    const errors = data.errors ?? data.Errors;
    if (Array.isArray(errors)) {
      return errors
        .map((error) => error.message ?? error.Message ?? error)
        .join(" ");
    }
    if (errors && typeof errors === "object") {
      return Object.values(errors).flat().join(" ");
    }
    return data.message ?? data.title ?? data.detail ?? `La solicitud falló (${response.status}).`;
  } catch {
    return body;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.dispatchEvent(new Event("northwind:unauthorized"));
    }
    throw new Error(await readError(response));
  }
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export function searchUri(endpoint, search, field, page = 1, pageSize = 10, extra = {}) {
  const query = new URLSearchParams({
    search: search ?? "",
    field: field ?? "all",
    page: String(page),
    pageSize: String(pageSize),
    ...extra,
  });
  return `${endpoint}?${query}`;
}

export const salesApi = {
  customers: (search = "", field = "all", page = 1, pageSize = 10) =>
    apiRequest(searchUri("/api/customers/search", search, field, page, pageSize)),
  products: (search = "", field = "all", page = 1, pageSize = 10, includeOutOfStock = true) =>
    apiRequest(
      searchUri("/api/products/search", search, field, page, pageSize, {
        includeOutOfStock: String(includeOutOfStock),
      }),
    ),
  orders: (search = "", field = "all", page = 1, pageSize = 10) =>
    apiRequest(searchUri("/api/orders/search", search, field, page, pageSize)),
  createCustomer: (customer) =>
    apiRequest("/api/customers", { method: "POST", body: JSON.stringify(customer) }),
  updateBalance: (id, balance) =>
    apiRequest(`/api/customers/${encodeURIComponent(id)}/balance`, {
      method: "PUT",
      body: JSON.stringify({ currentBalance: Number(balance) }),
    }),
  createOrder: (order) =>
    apiRequest("/CreateOrder", { method: "POST", body: JSON.stringify(order) }),
  invoice: (id) => apiRequest(`/api/orders/${id}`),
  pdf: async (id, download = false) => {
    const headers = new Headers();
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`/api/orders/${id}/pdf?download=${download}`, { headers });
    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
        window.dispatchEvent(new Event("northwind:unauthorized"));
      }
      throw new Error(await readError(response));
    }
    return response.blob();
  },
};

export async function login(email, password) {
  return apiRequest("/user/Login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(user) {
  return apiRequest("/user/Register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}
