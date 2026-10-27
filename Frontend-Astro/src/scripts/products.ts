import type { Product, Page } from '../lib/api';
import { search, peekSearchCache, money, safe } from '../lib/api';
import { byId, pages, empty, toast } from '../lib/ui';
let pending: AbortController | null = null;
let requestNumber = 0;
let current: Page<Product> | null = null;
let debounce: ReturnType<typeof setTimeout> | undefined;
const body = byId('product-list');
const count = byId('product-count');
const pagination = byId('product-pagination');
const term = byId<HTMLInputElement>('product-term');
const field = byId<HTMLSelectElement>('product-field');
function render(result: Page<Product>) {
 current = result;
 count.textContent = `${result.totalItems} productos`;
 body.innerHTML = result.items.length ? result.items.map(p => `<tr><td><span class="code-pill">#${p.id}</span></td><td><strong>${safe(p.name)}</strong></td><td class="end"><strong>${money(p.unitPrice)}</strong></td><td class="end">${p.unitsInStock}</td><td><span class="tag ${p.unitsInStock === 0 ? 'danger' : p.unitsInStock <= 5 ? 'warning' : 'success'}">${p.unitsInStock === 0 ? 'Agotado' : p.unitsInStock <= 5 ? 'Stock bajo' : 'Disponible'}</span></td></tr>`).join('') : `<tr><td colspan="5">${empty('No hay coincidencias', 'Prueba con otro código o nombre.')}</td></tr>`;
 pages(pagination, result.page, result.totalPages, (next) => { void load(next); });
}
async function load(page = 1) {
 pending?.abort();
 const controller = new AbortController(); pending = controller;
 const run = ++requestNumber;
 const query = term.value;
 const searchField = field.value;
 const cached = peekSearchCache<Product>('products', query, searchField, page, 10, true);
 if (cached) render(cached);
 else if (!current) {
  body.innerHTML = '<tr><td colspan="5"><div class="catalog-skeleton" aria-label="Cargando productos"><i></i><i></i><i></i><i></i></div></td></tr>';
  pagination.innerHTML = '';
 }
 count.classList.add('is-fetching');
 if (!cached) count.textContent = 'Consultando…';
 try {
  const result = await search<Product>('products', query, searchField, page, 10, true, { signal: controller.signal, bypassCache: true });
  if (run !== requestNumber) return;
  render(result);
 } catch (error) {
  if (controller.signal.aborted || run !== requestNumber) return;
  if (cached) {
   render(cached);
   toast('No se pudo actualizar: se muestran los últimos resultados disponibles.', 'error');
  } else {
   count.textContent = 'Sin conexión';
   body.innerHTML = `<tr><td colspan="5">${empty('No se pudo cargar el inventario', 'La API está tardando demasiado o no está disponible.')}<div class="retry-action"><button type="button" class="btn btn-primary" id="retry-products">Reintentar consulta</button></div></td></tr>`;
   byId('retry-products').addEventListener('click', () => void load(page));
   toast((error as Error).message, 'error');
  }
 } finally {
  if (run === requestNumber) count.classList.remove('is-fetching');
 }
}
const schedule = () => { clearTimeout(debounce); debounce = setTimeout(() => void load(1), 320); };
term.addEventListener('input', schedule);
field.addEventListener('change', () => { clearTimeout(debounce); void load(1); });
byId<HTMLFormElement>('product-form').addEventListener('submit', e => { e.preventDefault(); clearTimeout(debounce); void load(1); });
byId('product-clear').addEventListener('click', () => { clearTimeout(debounce); term.value = ''; field.value = 'all'; void load(1); });
void load();
