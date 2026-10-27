import type { Customer, Page } from '../lib/api';
import { money, search, peekSearchCache, request, safe } from '../lib/api';
import { byId, modal, pages, toast, empty } from '../lib/ui';
let page = 1;
let current: Page<Customer> | null = null;
let pending: AbortController | null = null;
let requestNumber = 0;
let debounce: ReturnType<typeof setTimeout> | undefined;
const tbody = byId('customer-list');
const count = byId('customer-count');
const pagination = byId('customer-pagination');
const field = byId<HTMLSelectElement>('customer-field');
const term = byId<HTMLInputElement>('customer-term');
function render(result: Page<Customer>) {
 current = result;
 page = result.page;
 count.textContent = `${result.totalItems} clientes`;
 tbody.innerHTML = result.items.length ? result.items.map(c => `<tr><td><span class="code-pill">${safe(c.id)}</span></td><td><strong>${safe(c.name)}</strong></td><td class="end"><strong>${money(c.currentBalance)}</strong></td><td>${c.currentBalance > 0 ? '<span class="tag warning">Con deuda · Bloqueado</span>' : '<span class="tag success">Sin deuda · Habilitado</span>'}</td><td class="end"><button class="btn btn-ghost btn-sm" data-edit="${safe(c.id)}">Modificar saldo</button></td></tr>`).join('') : `<tr><td colspan="5">${empty('Sin resultados', 'No encontramos clientes con ese criterio.')}</td></tr>`;
 pages(pagination, result.page, result.totalPages, (next) => { void load(next); });
}
async function load(next = 1) {
 pending?.abort();
 const controller = new AbortController();
 pending = controller;
 const run = ++requestNumber;
 const query = term.value;
 const searchField = field.value;
 const cached = peekSearchCache<Customer>('customers', query, searchField, next);
 if (cached) render(cached);
 else if (!current) {
  tbody.innerHTML = '<tr><td colspan="5"><div class="catalog-skeleton" aria-label="Cargando clientes"><i></i><i></i><i></i><i></i></div></td></tr>';
  pagination.innerHTML = '';
 }
 count.classList.add('is-fetching');
 if (!cached) count.textContent = 'Consultando…';
 try {
  // Mostrar de inmediato la caché local y actualizar con datos recientes de SQL Server.
  const result = await search<Customer>('customers', query, searchField, next, 10, false, { signal: controller.signal, bypassCache: true });
  if (run !== requestNumber) return;
  render(result);
 } catch (error) {
  if (controller.signal.aborted || run !== requestNumber) return;
  if (cached) {
   render(cached);
   toast('Se muestran los últimos datos consultados; no se pudo actualizar la lista.', 'error');
  } else {
   count.textContent = 'Sin conexión';
   tbody.innerHTML = `<tr><td colspan="5">${empty('No se pudieron cargar los clientes', 'La consulta tardó demasiado o no hay conexión con la API.')}<div class="retry-action"><button type="button" class="btn btn-primary" id="retry-customers">Reintentar consulta</button></div></td></tr>`;
   byId('retry-customers').addEventListener('click', () => void load(next));
   toast((error as Error).message, 'error');
  }
 } finally {
  if (run === requestNumber) count.classList.remove('is-fetching');
 }
}
const schedule = () => { clearTimeout(debounce); debounce = setTimeout(() => void load(1), 320); };
term.addEventListener('input', schedule);
field.addEventListener('change', () => { clearTimeout(debounce); void load(1); });
byId<HTMLFormElement>('customer-search-form').addEventListener('submit', e => { e.preventDefault(); clearTimeout(debounce); void load(1); });
byId('customer-clear').addEventListener('click', () => { clearTimeout(debounce); term.value = ''; field.value = 'all'; void load(1); });
byId('add-customer').addEventListener('click',()=>{
 modal(`<div class="dialog-header"><div><div class="eyebrow">NUEVO CONTACTO</div><h2>Registrar cliente</h2><p>Agrega un cliente al sistema con su saldo inicial.</p></div><button type="button" class="close-icon" data-close aria-label="Cerrar ventana" title="Cerrar">×</button></div><form id="customer-create-form"><div class="dialog-body stack"><div class="field"><label for="new-id">Código del cliente <span>*</span></label><input id="new-id" required minlength="5" maxlength="5" pattern="[A-Za-z0-9]{5}" placeholder="Ej.: EC011" autocomplete="off" /><small>5 letras o números, código único.</small></div><div class="field"><label for="new-name">Nombre completo <span>*</span></label><input id="new-name" minlength="3" maxlength="60" required placeholder="Ej.: María Fernanda López" /></div><div class="field"><label for="new-balance">Saldo pendiente (USD)</label><input id="new-balance" type="number" min="0" max="999999.99" step="0.01" value="0" required /><small>Deja en cero si el cliente no tiene deuda.</small></div><div class="hint-box" id="balance-preview">El cliente podrá comprar con saldo $0,00.</div></div><div class="dialog-foot"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="btn btn-primary" id="save-customer">Guardar cliente</button></div></form>`,(root,close)=>{
 const balance=root.querySelector<HTMLInputElement>('#new-balance')!;
 balance.addEventListener('input',()=>{root.querySelector('#balance-preview')!.textContent=Number(balance.value)>0?'El cliente tendrá la compra bloqueada hasta pagar.':'El cliente podrá comprar con saldo $0,00.';});
 root.querySelector<HTMLFormElement>('#customer-create-form')!.addEventListener('submit',async e=>{e.preventDefault();const id=root.querySelector<HTMLInputElement>('#new-id')!.value.trim().toUpperCase();const name=root.querySelector<HTMLInputElement>('#new-name')!.value.trim();const currentBalance=Number(balance.value);if(!/^[A-Z0-9]{5}$/.test(id)||name.length<3||currentBalance<0||currentBalance>999999.99)return toast('Revisa código, nombre y saldo.','error');const btn=root.querySelector<HTMLButtonElement>('#save-customer')!;btn.disabled=true;try{const result=await request<{success:boolean;message:string}>('/api/customers',{method:'POST',body:JSON.stringify({id,name,currentBalance})});if(!result.success)throw new Error(result.message);close();toast(result.message||'Cliente registrado correctamente.','success');await load(1);}catch(err){toast((err as Error).message,'error');}finally{btn.disabled=false;}});
 });
});
tbody.addEventListener('click',(ev)=>{const button=(ev.target as HTMLElement).closest<HTMLElement>('[data-edit]');if(!button)return;const customer=current?.items.find(c=>c.id===button.dataset.edit);if(customer)edit(customer);});
function edit(c:Customer){modal(`<div class="dialog-header"><div><div class="eyebrow">ACTUALIZACIÓN DE DEUDA</div><h2>Modificar saldo pendiente</h2><p>El cambio se guardará en SQL Server.</p></div><button type="button" class="close-icon" data-close aria-label="Cerrar ventana" title="Cerrar">×</button></div><form id="balance-form"><div class="dialog-body stack"><div class="selection"><div><strong>${safe(c.name)}</strong><small>Cliente seleccionado</small></div><span class="code-pill">${safe(c.id)}</span></div><div class="field"><label for="edit-balance">Saldo pendiente (USD)</label><input id="edit-balance" type="number" required min="0" max="999999.99" step="0.01" value="${c.currentBalance}" /></div><div class="hint-box" id="edit-preview">${c.currentBalance>0?'Con deuda · Compra bloqueada':'Sin deuda · Puede comprar'}</div><p class="helper">Ingrese 0,00 cuando el cliente haya pagado toda su deuda.</p></div><div class="dialog-foot"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="btn btn-primary" id="save-balance">Guardar saldo</button></div></form>`,(root,close)=>{
 const input=root.querySelector<HTMLInputElement>('#edit-balance')!;input.addEventListener('input',()=>{root.querySelector('#edit-preview')!.textContent=Number(input.value)>0?'Con deuda · Compra bloqueada':'Sin deuda · Puede comprar';});
 root.querySelector<HTMLFormElement>('#balance-form')!.addEventListener('submit',async e=>{e.preventDefault();const currentBalance=Number(input.value);if(!Number.isFinite(currentBalance)||currentBalance<0||currentBalance>999999.99)return toast('El saldo debe estar entre 0 y 999999,99.','error');const btn=root.querySelector<HTMLButtonElement>('#save-balance')!;btn.disabled=true;try{const result=await request<{success:boolean;message:string}>(`/api/customers/${encodeURIComponent(c.id)}/balance`,{method:'PUT',body:JSON.stringify({currentBalance})});if(!result.success)throw new Error(result.message);close();toast(result.message,'success');await load(page);}catch(err){toast((err as Error).message,'error');}finally{btn.disabled=false;}});
 });}
void load();
