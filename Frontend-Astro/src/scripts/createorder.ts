import type { Customer, Product, Page } from '../lib/api';
import { money, safe, search, request, logout, currentUser } from '../lib/api';
import {byId,modal,toast,empty,pages} from '../lib/ui';
type Line={id:number;name:string;unitPrice:number;unitsInStock:number;quantity:number};
let customer:Customer|null=null,lines:Line[]=[],savedOrder:number|null=null,saving=false,discardConfirmed=false;
const root=byId<HTMLFormElement>('create-order-form');const list=byId('order-products');
root.noValidate = true;
const draftKey = 'northwind:order-draft:v1';
const round=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
const sub=()=>round(lines.reduce((sum,l)=>sum+l.unitPrice*l.quantity,0));
const tax=()=>round(sub()*.15);const total=()=>round(sub()+tax());
function dirty(){return !!customer||lines.length>0||['ship-address','ship-city','ship-country','ship-postal'].some(id=>byId<HTMLInputElement>(id).value.trim().length>0);}
function update(){
 byId<HTMLInputElement>('customer-id').value=customer?.id||'';byId<HTMLInputElement>('customer-name').value=customer?.name||'';
 byId('summary-customer').textContent=customer?.name||'Pendiente';byId('summary-count').textContent=String(lines.length);byId('summary-units').textContent=String(lines.reduce((s,l)=>s+l.quantity,0));
 byId('summary-subtotal').textContent=money(sub());byId('summary-tax').textContent=money(tax());byId('summary-total').textContent=money(total());
 for(const [id,ok] of [['progress-customer',!!customer],['progress-products',lines.length>0],['progress-finish',!!savedOrder]] as const)byId(id).classList.toggle('ready',ok);
 byId<HTMLButtonElement>('review-order').disabled=!!savedOrder||saving||!customer||!lines.length||lines.some(l=>l.quantity<1||l.quantity>l.unitsInStock);
 list.innerHTML = lines.length ? lines.map((l, i) => `
 <article class="order-product" data-line="${i}">
   <div class="order-product-heading">
     <div class="order-product-main">
       <span class="code-pill">#${l.id}</span>
       <div class="order-product-identity">
         <strong>${safe(l.name)}</strong>
         <span class="order-product-availability">${l.unitsInStock <= 5 ? '<span class="stock-dot is-low"></span>' : '<span class="stock-dot"></span>'}${l.unitsInStock} unidades disponibles${l.unitsInStock <= 5 ? ' · Stock bajo' : ''}</span>
       </div>
     </div>
     <div class="order-product-index">PRODUCTO ${String(i + 1).padStart(2, '0')}</div>
   </div>
   <div class="order-product-details">
     <div class="order-product-detail"><span class="order-detail-label">Precio unitario</span><strong>${money(l.unitPrice)}</strong></div>
     <div class="order-product-detail order-quantity"><label class="order-detail-label" for="qty-product-${i}">Cantidad</label><div class="quantity-box"><button type="button" data-qty="-1" data-index="${i}" ${savedOrder ? 'disabled' : ''} aria-label="Disminuir cantidad de ${safe(l.name)}">−</button><input id="qty-product-${i}" type="number" data-inputqty="${i}" min="1" max="${l.unitsInStock}" value="${l.quantity}" ${savedOrder ? 'disabled' : ''} aria-label="Cantidad ${safe(l.name)}"/><button type="button" data-qty="1" data-index="${i}" ${savedOrder ? 'disabled' : ''} aria-label="Aumentar cantidad de ${safe(l.name)}">+</button></div></div>
     <div class="order-product-detail"><span class="order-detail-label">Subtotal</span><strong class="order-product-subtotal">${money(l.unitPrice * l.quantity)}</strong></div>
     <div class="order-product-actions"><button type="button" class="btn btn-ghost btn-sm" data-swap="${i}" ${savedOrder ? 'disabled' : ''}>Cambiar</button><button type="button" class="btn btn-ghost btn-sm order-remove" data-remove="${i}" ${savedOrder ? 'disabled' : ''}>Quitar</button></div>
   </div>
 </article>`).join('') : `<div class="order-empty"><div class="order-empty-icon">▣</div><strong>No hay productos agregados</strong><p>Utiliza «Agregar producto» para comenzar tu orden.</p></div>`;
 persistDraft();
}
function openSearch(kind:'customers'|'products',replaceIndex:number|null=null){
 const forCustomer=kind==='customers';let result:Page<Customer|Product>|null=null;
 modal(`<div class="dialog-header"><div><div class="eyebrow">BÚSQUEDA INTELIGENTE</div><h2>${forCustomer?'Seleccionar cliente':'Seleccionar producto'}</h2><p>Busca por código o nombre. Los registros se consultan en NorthWindDB.</p></div><button type="button" class="close-icon" data-close aria-label="Cerrar ventana" title="Cerrar">×</button></div><div class="dialog-body"><form id="search-pick" class="form-row" style="grid-template-columns:185px 1fr auto;align-items:end;gap:9px"><div class="field"><label for="picker-field">Buscar por</label><select id="picker-field"><option value="all">Cualquier dato</option><option value="${forCustomer?'code':'id'}">Código</option><option value="name">Nombre</option></select></div><div class="field"><label for="picker-term">Consulta</label><input id="picker-term" placeholder="Escribe un nombre o código" /></div><button class="btn btn-primary">Buscar</button></form><div class="table-wrap" style="margin-top:22px"><table class="data-table"><thead><tr><th>Código</th><th>${forCustomer?'Cliente':'Producto'}</th><th>${forCustomer?'Saldo':'Precio / Stock'}</th><th class="end">Acción</th></tr></thead><tbody id="picker-list"><tr><td colspan="4"><div class="loading">Buscando...</div></td></tr></tbody></table></div><div class="pagination" id="picker-pagination"></div></div>`,(host,close)=>{
    host.querySelector('.dialog')?.classList.add('wide');
 const body=host.querySelector<HTMLElement>('#picker-list')!;const pagination=host.querySelector<HTMLElement>('#picker-pagination')!;let busy=false;
 async function load(p=1){if(busy)return;busy=true;body.innerHTML='<tr><td colspan="4"><div class="loading">Consultando datos...</div></td></tr>';try{result=await search<Customer|Product>(kind,host.querySelector<HTMLInputElement>('#picker-term')!.value,host.querySelector<HTMLSelectElement>('#picker-field')!.value,p,8);body.innerHTML=result.items.length?result.items.map((item,i)=>{
 if(forCustomer){const c=item as Customer;return `<tr><td><span class="code-pill">${safe(c.id)}</span></td><td><strong>${safe(c.name)}</strong></td><td>${c.currentBalance>0?`<span class="tag warning">Deuda: ${money(c.currentBalance)}</span>`:'<span class="tag success">Habilitado</span>'}</td><td class="end"><button type="button" class="btn btn-primary btn-sm" data-select="${i}" ${c.currentBalance>0?'disabled':''}>${c.currentBalance>0?'Bloqueado':'Seleccionar'}</button></td></tr>`;}
 const v=item as Product;const excluded=lines.some((l,index)=>l.id===v.id && index!==replaceIndex);const disabled=v.unitsInStock===0||excluded;return `<tr><td><span class="code-pill">#${v.id}</span></td><td><strong>${safe(v.name)}</strong></td><td><span class="table-stack"><strong>${money(v.unitPrice)}</strong><small>${v.unitsInStock} disponibles</small></span></td><td class="end"><button type="button" class="btn btn-primary btn-sm" data-select="${i}" ${disabled?'disabled':''}>${excluded?'Ya agregado':v.unitsInStock===0?'Sin stock':'Seleccionar'}</button></td></tr>`;
 }).join(''):`<tr><td colspan="4">${empty('Sin coincidencias','Prueba otro filtro o una búsqueda diferente.')}</td></tr>`;pages(pagination,result.page,result.totalPages,load);}catch(err){toast((err as Error).message,'error');body.innerHTML=`<tr><td colspan="4">${empty('No se pudieron cargar resultados','Comprueba tu conexión.')}</td></tr>`;}finally{busy=false;}}
 host.querySelector<HTMLFormElement>('#search-pick')?.addEventListener('submit',e=>{e.preventDefault();void load();});
 body.addEventListener('click',e=>{const btn=(e.target as HTMLElement).closest<HTMLElement>('[data-select]');if(!btn||!result)return;const item=result.items[Number(btn.dataset.select)];if(!item)return;
 if(forCustomer){const c=item as Customer;if(c.currentBalance>0)return;customer=c;toast(`Cliente ${c.name} seleccionado.`,'success');}
 else {const p=item as Product;if(p.unitsInStock<=0)return;const line:Line={id:p.id,name:p.name,unitPrice:p.unitPrice,unitsInStock:p.unitsInStock,quantity:1};if(replaceIndex!==null)lines[replaceIndex]=line;else if(!lines.some(l=>l.id===p.id))lines.push(line);else {toast('El producto ya está en la orden. Cambia su cantidad en el detalle.','info');return;}toast(`Producto ${p.name} agregado a la orden.`,'success');if(p.unitsInStock<=5)toast(`Atención: solo quedan ${p.unitsInStock} unidades de ${p.name}.`,'info');}
 close();update();});void load();
 });
}
byId('choose-customer').addEventListener('click',()=>openSearch('customers'));
byId('add-product').addEventListener('click',()=>openSearch('products'));
list.addEventListener('click',e=>{const t=e.target as HTMLElement;const qty=t.closest<HTMLElement>('[data-qty]');if(qty){const i=Number(qty.dataset.index),l=lines[i];if(!l)return;const next=l.quantity+Number(qty.dataset.qty);if(next<1||next>l.unitsInStock)return toast(`La cantidad debe ser de 1 a ${l.unitsInStock}.`,'error');l.quantity=next;update();return;}
 const remove=t.closest<HTMLElement>('[data-remove]');if(remove){const i=Number(remove.dataset.remove),l=lines[i];if(!l)return;modal(`<div class="dialog-body modal-center"><div class="modal-icon" style="background:#fff3df;color:#bf7822">!</div><h2>¿Eliminar este producto?</h2><p>Se quitará <strong>${safe(l.name)}</strong> de la orden.</p><div class="row-inline" style="justify-content:center;margin-top:25px"><button data-close class="btn btn-ghost">Conservar</button><button id="yes-remove" class="btn btn-danger">Sí, eliminar</button></div></div>`,(root,close)=>{root.querySelector('#yes-remove')?.addEventListener('click',()=>{lines.splice(i,1);close();toast('Producto retirado de la orden.','success');update();});});return;}
 const swap=t.closest<HTMLElement>('[data-swap]');if(swap){openSearch('products',Number(swap.dataset.swap));}
});
list.addEventListener('change',e=>{const el=(e.target as HTMLElement).closest<HTMLInputElement>('[data-inputqty]');if(!el)return;const i=Number(el.dataset.inputqty),l=lines[i];if(!l)return;const value=Number(el.value);if(!Number.isInteger(value)||value<1||value>l.unitsInStock){toast(`Cantidad inválida: máximo ${l.unitsInStock} unidades.`,'error');update();return;}l.quantity=value;update();});
function clearFieldError(field: HTMLInputElement) {
 field.classList.remove('is-invalid');
 field.removeAttribute('aria-invalid');
 field.closest('.field')?.querySelector('.field-error')?.remove();
}
function fieldError(id: string, message: string) {
 const input = byId<HTMLInputElement>(id);
 clearFieldError(input);
 input.classList.add('is-invalid');
 input.setAttribute('aria-invalid', 'true');
 const error = document.createElement('div');
 error.className = 'field-error';
 error.setAttribute('role', 'alert');
 error.textContent = message;
 input.closest('.field')?.append(error);
 input.scrollIntoView({ block: 'center', behavior: 'smooth' });
 input.focus({ preventScroll: true });
 toast(message, 'error');
 return false;
}
const deliveryIds = ['ship-address','ship-city','ship-country','ship-postal'] as const;
for (const id of deliveryIds) {
 byId<HTMLInputElement>(id).addEventListener('input', (event) => {
  clearFieldError(event.currentTarget as HTMLInputElement);
  persistDraft();
 });
}
function validate() {
 if (!customer) { toast('Selecciona el cliente antes de continuar.', 'error'); byId('choose-customer').focus(); return false; }
 if (customer.currentBalance > 0) { toast('El cliente tiene deuda pendiente y no puede comprar.', 'error'); return false; }
 if (!lines.length) { toast('Agrega al menos un producto para crear la orden.', 'error'); byId('add-product').focus(); return false; }
 if (lines.some(l => l.quantity < 1 || l.quantity > l.unitsInStock)) { toast('Revisa las cantidades; algunas superan las existencias disponibles.', 'error'); return false; }
 const address = byId<HTMLInputElement>('ship-address').value.trim();
 const city = byId<HTMLInputElement>('ship-city').value.trim();
 const country = byId<HTMLInputElement>('ship-country').value.trim();
 if (!address) return fieldError('ship-address', 'Ingresa la dirección de entrega para finalizar la orden.');
 if (address.length > 60) return fieldError('ship-address', 'La dirección debe tener como máximo 60 caracteres.');
 if (city.length < 3) return fieldError('ship-city', 'Ingresa una ciudad válida (mínimo 3 caracteres).');
 if (!/^[-.\p{L}\s]+$/u.test(city)) return fieldError('ship-city', 'La ciudad debe contener letras y separadores válidos.');
 if (country.length < 3) return fieldError('ship-country', 'Ingresa un país válido (mínimo 3 caracteres).');
 if (!/^[-.\p{L}\s]+$/u.test(country)) return fieldError('ship-country', 'El país debe contener letras y separadores válidos.');
 return true;
}
function persistDraft() {
 if (savedOrder) return;
 try {
  if (!dirty()) { sessionStorage.removeItem(draftKey); return; }
  const delivery: Record<string,string> = {};
  for (const id of deliveryIds) delivery[id] = byId<HTMLInputElement>(id).value;
  sessionStorage.setItem(draftKey, JSON.stringify({ account: currentUser(), customer, lines, delivery }));
 } catch { /* El navegador puede limitar sessionStorage; la venta continúa. */ }
}
function clearDraft() { try { sessionStorage.removeItem(draftKey); } catch { /* Ignorar. */ } }
function restoreDraft() {
 try {
  const raw = sessionStorage.getItem(draftKey);
  if (!raw) return;
  const draft = JSON.parse(raw) as {
   account?: string;
   customer?: Customer;
   lines?: Line[];
   delivery?: Record<string,string>;
  };
  if (draft.account !== currentUser()) { clearDraft(); return; }
  if (draft.customer?.id && typeof draft.customer.name === 'string') customer = draft.customer;
  if (Array.isArray(draft.lines)) lines = draft.lines.filter(l => Number.isFinite(l.id) && l.id > 0 && l.name && Number.isFinite(l.unitPrice) && Number.isFinite(l.unitsInStock) && l.unitsInStock >= 1 && Number.isInteger(l.quantity) && l.quantity >= 1 && l.quantity <= l.unitsInStock).slice(0, 30);
  for (const id of deliveryIds) {
   const value = draft.delivery?.[id];
   if (typeof value === 'string') byId<HTMLInputElement>(id).value = value;
  }
  if (dirty()) toast('Se ha restaurado el borrador de tu orden. Revisa los datos antes de guardarla.', 'info');
 } catch { clearDraft(); }
}
function navigateAfterConfirm(destination: string, action?: () => void) {
 if (!dirty() || savedOrder) { if (action) action(); else location.href = destination; return; }
 modal(`<div class="dialog-body modal-center leave-confirmation"><div class="leave-symbol" aria-hidden="true">!</div><div class="eyebrow" style="justify-content:center">CAMBIOS PENDIENTES</div><h2>¿Deseas salir de esta orden?</h2><p>Hay información de la compra sin guardar. Puedes continuar editando o salir y descartar este borrador.</p><div class="leave-summary"><span>Cliente</span><strong>${customer ? safe(customer.name) : 'Sin seleccionar'}</strong><span>Productos en la orden</span><strong>${lines.length}</strong></div><div class="leave-actions"><button type="button" class="btn btn-ghost" data-close>Continuar editando</button><button type="button" class="btn btn-danger" id="discard-draft">Salir sin guardar</button></div></div>`, (host) => {
  host.querySelector('#discard-draft')?.addEventListener('click', () => {
   discardConfirmed = true;
   clearDraft();
   if (action) action(); else location.href = destination;
  });
 });
}
// Enlaces internos: advertencia personalizada en lugar del aviso genérico del navegador.
document.addEventListener('click', (event: MouseEvent) => {
 if (savedOrder || discardConfirmed || !dirty() || event.defaultPrevented) return;
 if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
 const element = event.target as Element;
 if (!(element instanceof Element)) return;
 const link = element.closest<HTMLAnchorElement>('a[href]');
 if (link && !link.hasAttribute('download') && link.target !== '_blank') {
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || destination.href === location.href) return;
  event.preventDefault();
  event.stopPropagation();
  navigateAfterConfirm(destination.href);
  return;
 }
 const logoutButton = element.closest<HTMLElement>('#logout');
 if (logoutButton) {
  event.preventDefault();
  event.stopPropagation();
  navigateAfterConfirm('/login', logout);
 }
}, true);
root.addEventListener('submit',e=>{e.preventDefault();if(savedOrder||saving||!validate())return;modal(`<div class="dialog-body modal-center"><div class="modal-icon" style="background:#e8f0ff;color:#2765d6">✓</div><h2>Confirma tu orden de venta</h2><p>Antes de continuar, comprueba el resumen de la compra.</p><div class="modal-highlight"><div class="row-between"><span>Cliente</span><strong>${safe(customer!.name)} (${safe(customer!.id)})</strong></div><div class="row-between"><span>Productos</span><strong>${lines.length} productos · ${lines.reduce((n,l)=>n+l.quantity,0)} unidades</strong></div><div class="row-between"><span>Total</span><strong>${money(total())}</strong></div></div><div class="row-inline" style="justify-content:center;margin-top:25px"><button class="btn btn-ghost" data-close>Volver a revisar</button><button class="btn btn-primary" id="confirm-order">Confirmar y guardar</button></div></div>`,(dlg,close)=>{
 dlg.querySelector<HTMLButtonElement>('#confirm-order')?.addEventListener('click',async()=>{if(saving)return;const btn=dlg.querySelector<HTMLButtonElement>('#confirm-order')!;saving=true;btn.disabled=true;btn.textContent='Guardando orden...';try{
 const dto={customerId:customer!.id,shipAddress:byId<HTMLInputElement>('ship-address').value.trim(),shipCity:byId<HTMLInputElement>('ship-city').value.trim(),shipCountry:byId<HTMLInputElement>('ship-country').value.trim(),shipPostalCode:byId<HTMLInputElement>('ship-postal').value.trim()||null,orderDetails:lines.map(l=>({productId:l.id,unitPrice:l.unitPrice,quantity:l.quantity}))};
 const created=await request<number>('/CreateOrder',{method:'POST',body:JSON.stringify(dto)});
 const id=typeof created==='number'?created:Number(created);
 if(!Number.isSafeInteger(id)||id<=0)throw new Error('La API no devolvió un identificador de orden válido. Comprueba el historial antes de reintentar.');savedOrder=id;clearDraft();close();update();showSuccess(id);
 }catch(err){toast((err as Error).message,'error');}finally{saving=false;btn.disabled=false;btn.textContent='Confirmar y guardar';}});
 });});
function showSuccess(orderId:number){modal(`<div class="dialog-body modal-center"><div class="modal-icon">✓</div><div class="eyebrow" style="justify-content:center">VENTA CONFIRMADA</div><h2>¡Orden de compra realizada correctamente!</h2><p>La orden se guardó en NorthWind. Ahora puedes consultar el detalle y obtener su comprobante.</p><div class="modal-highlight"><div class="row-between"><span>Número de orden</span><strong>#${orderId}</strong></div><div class="row-between"><span>Cliente</span><strong>${safe(customer!.name)}</strong></div><div class="row-between"><span>Productos distintos</span><strong>${lines.length}</strong></div><div class="row-between"><span>Total registrado</span><strong>${money(total())}</strong></div></div><div class="row-inline" style="justify-content:center;margin-top:24px"><a class="btn btn-primary" href="/invoices?orderId=${orderId}">Ver orden de venta →</a><button id="new-order" class="btn btn-ghost">Crear otra orden</button></div></div>`,(host,close)=>{
 host.querySelector('#new-order')?.addEventListener('click',()=>{clearDraft();savedOrder=null;customer=null;lines=[];root.reset();close();update();});
 });}
function cancel() { navigateAfterConfirm('/'); }
byId('cancel-order').addEventListener('click', cancel);
// Los navegadores no permiten diseñar el aviso nativo de cerrar pestaña/recargar.
// Preservamos el borrador local y usamos una confirmación visual para la navegación interna.
restoreDraft();
update();
