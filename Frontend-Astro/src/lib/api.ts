const apiBase = (import.meta.env.PUBLIC_API_URL ?? 'https://localhost:7154').replace(/\/$/, '');
export const API_ORIGIN = apiBase;

export interface Customer { id: string; name: string; currentBalance: number }
export interface Product { id: number; name: string; unitPrice: number; unitsInStock: number }
export interface OrderHeader {orderId: number; invoiceNumber: string; customerId: string; customerName: string; orderDate: string; subtotal: number; tax: number; total: number}
export interface OrderDetail {productId: number; productName: string; unitPrice: number; quantity: number; subtotal: number}
export interface Invoice extends OrderHeader {shipAddress: string; shipCity: string; shipCountry: string; shipPostalCode?: string; details: OrderDetail[]}
export interface Page<T> { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number }
export type SearchKind = 'customers'|'products'|'orders';

const CACHE_PREFIX = 'nw_astro_query_v2:';
const CACHE_TTL_MS = 45_000;
const FETCH_TIMEOUT_MS = 17_000;
const memoryCache = new Map<string, { expires: number; value: unknown }>();

function notifyConnection(status: 'connected' | 'offline') {
 if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('northwind:api-status', { detail: status }));
}
function cacheKey(kind: SearchKind, text: string, field: string, page: number, pageSize: number, stock: boolean) {
 return `${CACHE_PREFIX}${kind}:${encodeURIComponent(text.trim().toLowerCase())}:${field}:${page}:${pageSize}:${stock ? 1 : 0}`;
}
function readCached<T>(key: string): T | null {
 const entry = memoryCache.get(key);
 if (entry) return entry.expires > Date.now() ? entry.value as T : null;
 try {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { expires: number; value: T };
  if (parsed.expires <= Date.now()) { sessionStorage.removeItem(key); return null; }
  memoryCache.set(key, parsed); return parsed.value;
 } catch { return null; }
}
function writeCached<T>(key: string, value: T) {
 const entry = { expires: Date.now() + CACHE_TTL_MS, value };
 memoryCache.set(key, entry);
 try { sessionStorage.setItem(key, JSON.stringify(entry)); } catch { /* Sin espacio para caché: la búsqueda sigue funcionando. */ }
}
export function invalidateSearchCache(kind?: SearchKind) {
 const prefix = `${CACHE_PREFIX}${kind ? kind + ':' : ''}`;
 for (const key of memoryCache.keys()) if (key.startsWith(prefix)) memoryCache.delete(key);
 try { for (let i = sessionStorage.length - 1; i >= 0; i--) {
   const key = sessionStorage.key(i); if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
 } } catch { /* La caché no es indispensable. */ }
}
export function peekSearchCache<T>(kind: SearchKind, text: string, field: string, page: number, pageSize = 10, includeOutOfStock = false): Page<T> | null {
 return readCached<Page<T>>(cacheKey(kind, text, field, page, pageSize, includeOutOfStock));
}
const TOKEN = 'northwind_astro_token';
const ACCOUNT = 'northwind_astro_user';
export function getToken() { return sessionStorage.getItem(TOKEN); }
export function setSession(token: string, name: string) { invalidateSearchCache(); sessionStorage.setItem(TOKEN,token); sessionStorage.setItem(ACCOUNT,name); }
export function currentUser() { return sessionStorage.getItem(ACCOUNT) || 'Usuario'; }
export function logout() { invalidateSearchCache(); sessionStorage.removeItem(TOKEN); sessionStorage.removeItem(ACCOUNT); location.href='/login'; }
export function authorized() { return !!getToken(); }
export const money = (n: number) => new Intl.NumberFormat('es-EC',{style:'currency',currency:'USD'}).format(Number(n)||0);
export const dateLabel = (s: string) => s ? new Intl.DateTimeFormat('es-EC',{dateStyle:'medium'}).format(new Date(s)) : '—';
export function safe(s: unknown): string { return String(s??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }

function errorMessage(data: any, status: number): string {
 if (typeof data==='string') return data.slice(0,250);
 if (data?.errors) {const all = Object.values(data.errors).flat(); if(all.length) return all.map(String).join(' · ');}
 return data?.message || data?.detail || data?.title || (status===401?'Tu sesión expiró. Inicia sesión nuevamente.':'Error de comunicación con el servidor.');
}
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
 const token = getToken();
 const headers = new Headers(init.headers);
 if (token) headers.set('Authorization', `Bearer ${token}`);
 if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
 // No dejar al usuario frente a un spinner infinito si SQL LocalDB/API no responde.
 const controller = new AbortController();
 const abortFromCaller = () => controller.abort();
 if (init.signal?.aborted) controller.abort();
 else init.signal?.addEventListener('abort', abortFromCaller, { once: true });
 let timedOut = false;
 const timer = setTimeout(() => { timedOut = true; controller.abort(); }, FETCH_TIMEOUT_MS);
 let response: Response;
 try {
  response = await fetch(`${apiBase}${path}`, { ...init, headers, signal: controller.signal });
  notifyConnection('connected');
 } catch (error) {
  if (init.signal?.aborted && !timedOut) throw new DOMException('Búsqueda cancelada', 'AbortError');
  notifyConnection('offline');
  if (timedOut) throw new Error('La API tardó más de 17 segundos. Comprueba SQL Server LocalDB y vuelve a intentar.');
  throw new Error(`No fue posible conectar con la API (${apiBase}). Verifica el backend y su certificado HTTPS.`);
 } finally {
  clearTimeout(timer);
  init.signal?.removeEventListener('abort', abortFromCaller);
 }
 if (response.status === 401 && !['/user/Login', '/user/Register'].includes(path)) {
  logout(); throw new Error('Sesión expirada');
 }
 if (!response.ok) {
  let data: any = {};
  try { data = await response.json(); } catch { data = await response.text(); }
  throw new Error(errorMessage(data, response.status));
 }
 let value: T;
 if (response.status === 204) value = undefined as T;
 else {
  const contentType = response.headers.get('content-type') ?? '';
  value = (contentType.includes('json') ? await response.json() : await response.text()) as T;
 }
 if (init.method && !['GET', 'HEAD'].includes(init.method.toUpperCase())) {
  if (path.startsWith('/api/customers')) invalidateSearchCache('customers');
  if (path.startsWith('/CreateOrder')) {
   invalidateSearchCache('orders'); invalidateSearchCache('products'); invalidateSearchCache('customers');
  }
 }
 return value;
}
export async function search<T>(kind: SearchKind, text: string, field: string, page: number, pageSize = 10, includeOutOfStock = false, options: { signal?: AbortSignal; bypassCache?: boolean } = {}): Promise<Page<T>> {
 const path = { customers: '/api/customers/search', products: '/api/products/search', orders: '/api/orders/search' }[kind];
 const q = new URLSearchParams({ search: text.trim(), field, page: String(page), pageSize: String(pageSize) });
 if (kind === 'products' && includeOutOfStock) q.set('includeOutOfStock', 'true');
 const key = cacheKey(kind, text, field, page, pageSize, includeOutOfStock);
 if (!options.bypassCache) {
  const cached = readCached<Page<T>>(key);
  if (cached) return cached;
 }
 const result = await request<Page<T>>(`${path}?${q}`, { signal: options.signal });
 writeCached(key, result);
 return result;
}
export async function pdf(orderId:number,download=false){
 const token=getToken();
 let r:Response;
 try{ r=await fetch(`${apiBase}/api/orders/${orderId}/pdf?download=${download}`,{headers:{Authorization:`Bearer ${token}`}}); }
 catch{throw new Error('No fue posible conectar con la API para generar el PDF.');}
 if(r.status===401){logout();throw new Error('Sesión expirada');}
 if(!r.ok)throw new Error(`No se pudo generar el PDF (HTTP ${r.status}).`);
 const blob=await r.blob(); const url=URL.createObjectURL(blob);
 if(download){const a=document.createElement('a');a.href=url;a.download=`INV-${String(orderId).padStart(6,'0')}.pdf`;document.body.append(a);a.click();a.remove();}
 else window.open(url,'_blank','noopener,noreferrer');
 setTimeout(()=>URL.revokeObjectURL(url),120000);
}
