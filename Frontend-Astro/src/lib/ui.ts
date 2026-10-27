import {safe} from './api';

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
 const e = document.getElementById(id);
 if (!e) throw Error(`Falta el elemento ${id}`);
 return e as T;
}

type ToastKind = 'success' | 'error' | 'info';

const toastMeta: Record<ToastKind, { title: string; icon: string }> = {
 success: { title: 'Operación completada', icon: '✓' },
 error: { title: 'Se requiere atención', icon: '!' },
 info: { title: 'Notificación del sistema', icon: 'i' }
};

export function toast(message: string, kind: ToastKind = 'info') {
 const container = byId('toast-container');
 const { title, icon } = toastMeta[kind];
 const el = document.createElement('article');
 el.className = `toast ${kind}`;
 el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
 el.innerHTML = `
  <div class="toast-accent"></div>
  <div class="toast-icon" aria-hidden="true">${icon}</div>
  <div class="toast-copy">
    <div class="toast-head">
      <strong class="toast-title">${title}</strong>
      <button aria-label="Cerrar notificación" type="button" class="toast-close">×</button>
    </div>
    <p class="toast-message">${safe(message)}</p>
    <div class="toast-meta">NorthWind · ${kind === 'success' ? 'acción realizada correctamente' : kind === 'error' ? 'revisa el detalle indicado' : 'información actualizada'}</div>
    <div class="toast-progress" aria-hidden="true"></div>
  </div>`;

 const close = () => {
  el.classList.add('is-leaving');
  window.setTimeout(() => el.remove(), 230);
 };
 el.querySelector('.toast-close')?.addEventListener('click', close);
 container.prepend(el);
 window.setTimeout(close, 6200);
}

let previousFocus: HTMLElement | null = null;
export function modal(content: string, setup?: (root: HTMLElement, close: () => void) => void): () => void {
 const target = byId('modal-root');
 previousFocus = document.activeElement as HTMLElement;
 target.innerHTML = `<div class="modal-overlay"><section class="dialog" role="dialog" aria-modal="true" aria-label="Ventana de NorthWind">${content}</section></div>`;
 // Todas las ventanas se cierran mediante un control explícito. Nunca por tocar el fondo.
 const dialog = target.querySelector<HTMLElement>('.dialog')!;
 if (!dialog.querySelector('.close-icon[data-close]')) {
  dialog.insertAdjacentHTML('afterbegin', '<button type="button" class="close-icon modal-dismiss" data-close aria-label="Cerrar ventana" title="Cerrar">×</button>');
 }
 document.body.classList.add('modal-open');
 const close = () => {
  target.innerHTML = '';
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onKey);
  previousFocus?.focus();
 };
 const onKey = (e: KeyboardEvent) => {
  // Escape no descarta una ventana con cambios o acciones pendientes.
  if (e.key === 'Escape') { e.preventDefault(); return; }
  if (e.key === 'Tab') {
   const focus = Array.from(target.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])'));
   if (!focus.length) return;
   const first = focus[0]!;
   const last = focus[focus.length - 1]!;
   if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
   } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
   }
  }
 };
 document.addEventListener('keydown', onKey);
 // No añadir cierre mediante clic fuera de la ventana.
 target.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
 setup?.(target, close);
 (target.querySelector('input,button') as HTMLElement | null)?.focus();
 return close;
}

export function pages(el: HTMLElement, page: number, total: number, load: (next: number) => void) {
 el.innerHTML = `<span>Página <strong>${page}</strong> de <strong>${Math.max(1, total)}</strong></span><div class="pagination-buttons"><button class="btn btn-ghost btn-sm" id="prev-page" ${page <= 1 ? 'disabled' : ''}>← Anterior</button><button class="btn btn-ghost btn-sm" id="next-page" ${page >= total ? 'disabled' : ''}>Siguiente →</button></div>`;
 el.querySelector('#prev-page')?.addEventListener('click', () => load(page - 1));
 el.querySelector('#next-page')?.addEventListener('click', () => load(page + 1));
}

export const empty = (title: string, description: string) => `<div class="empty"><div class="empty-icon">◎</div><strong>${safe(title)}</strong><p>${safe(description)}</p></div>`;
