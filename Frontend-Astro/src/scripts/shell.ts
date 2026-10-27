import {authorized,currentUser,logout} from '../lib/api';
import {toast} from '../lib/ui';
const theme=localStorage.getItem('nw_theme')||'light';document.documentElement.dataset.theme=theme;
const toggle=document.getElementById('theme-toggle');
function syncTheme(){const t=document.documentElement.dataset.theme;const icon=document.getElementById('theme-icon');if(icon)icon.textContent=t==='dark'?'☀':'☾';}
toggle?.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';localStorage.setItem('nw_theme',document.documentElement.dataset.theme);syncTheme();});syncTheme();
const authRequired=document.body.dataset.auth==='required';
if(authRequired&&!authorized())location.replace('/login');
if(!authRequired&&authorized()&&['/login','/register'].includes(location.pathname))location.replace('/');
const user=currentUser();
const userName=document.getElementById('user-name');if(userName)userName.textContent=user;
const userAvatar=document.getElementById('user-avatar');if(userAvatar)userAvatar.textContent=user.slice(0,1).toUpperCase();
document.getElementById('logout')?.addEventListener('click',logout);
const now=new Date();const today=document.getElementById('today-label');if(today)today.textContent=new Intl.DateTimeFormat('es-EC',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebar-overlay');
const close=()=>{sidebar?.classList.remove('mobile-open');overlay?.classList.remove('active')};
document.getElementById('menu-toggle')?.addEventListener('click',()=>{sidebar?.classList.toggle('mobile-open');overlay?.classList.toggle('active')});overlay?.addEventListener('click',close);

// Reflejar conexiones reales en lugar de mostrar "Sistema conectado" antes de consultar la API.
const apiStatus = document.getElementById('api-status');
const apiLabel = document.getElementById('api-status-label');
window.addEventListener('northwind:api-status', (event: Event) => {
 const status = (event as CustomEvent<'connected' | 'offline'>).detail;
 if (apiStatus) apiStatus.dataset.status = status;
 if (apiLabel) apiLabel.textContent = status === 'connected' ? 'API conectada' : 'Sin conexión a API';
});

// Validación accesible y consistente para los demás formularios: evita globos
// nativos del navegador y muestra la advertencia junto al campo afectado.
let lastValidationNotice = 0;
document.addEventListener('invalid', (event: Event) => {
 const field = event.target;
 if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
 event.preventDefault();
 const container = field.closest<HTMLElement>('.field');
 if (!container) return;
 const label = container.querySelector<HTMLLabelElement>('label')?.textContent?.replace('*', '').trim() || 'Este campo';
 let message = `${label}: ingresa un valor válido para continuar.`;
 if (field.validity.valueMissing) message = `${label}: este dato es necesario para continuar.`;
 else if (field.validity.typeMismatch) message = `${label}: revisa el formato de la información ingresada.`;
 else if (field.validity.tooShort) message = `${label}: debe contener más caracteres.`;
 else if (field.validity.patternMismatch) message = `${label}: revisa el formato requerido.`;
 else if (field.validity.rangeUnderflow || field.validity.rangeOverflow || field.validity.stepMismatch) message = `${label}: el valor está fuera del rango permitido.`;
 container.querySelector('.field-error')?.remove();
 const error = document.createElement('div');
 error.className = 'field-error';
 error.setAttribute('role', 'alert');
 error.textContent = message;
 container.append(error);
 field.classList.add('is-invalid');
 field.setAttribute('aria-invalid', 'true');
 const now = Date.now();
 if (now - lastValidationNotice > 800) { toast(message, 'error'); lastValidationNotice = now; }
}, true);
document.addEventListener('input', (event: Event) => {
 const field = event.target;
 if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
 field.classList.remove('is-invalid');
 field.removeAttribute('aria-invalid');
 field.closest('.field')?.querySelector('.field-error')?.remove();
}, true);
