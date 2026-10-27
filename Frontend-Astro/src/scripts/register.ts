import {byId,toast,modal} from '../lib/ui';import {request} from '../lib/api';
const p=byId<HTMLInputElement>('password'),confirmation=byId<HTMLInputElement>('confirm');
function rules(){const pass=p.value;const checks={len:pass.length>=6,upper:/[A-ZÁÉÍÓÚÑ]/.test(pass),lower:/[a-záéíóúñ]/.test(pass),digit:/\d/.test(pass),special:/[^\w]/.test(pass),match:pass.length>0&&pass===confirmation.value};for(const [key,valid] of Object.entries(checks)){const el=document.querySelector(`[data-rule=${key}]`)!;el.classList.toggle('ok',valid);el.textContent=`${valid?'✓':'○'} ${({len:'Mínimo 6 caracteres',upper:'Una mayúscula',lower:'Una minúscula',digit:'Un número',special:'Un carácter especial',match:'Contraseñas iguales'} as Record<string,string>)[key]}`;}return Object.values(checks).every(Boolean);}
document.querySelectorAll<HTMLButtonElement>('[data-toggle-password]').forEach(button => {
 button.addEventListener('click', () => {
  const id = button.dataset.togglePassword;
  const input = id ? document.getElementById(id) as HTMLInputElement | null : null;
  if (!input) return;
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(visible));
  button.setAttribute('aria-label', `${visible ? 'Ocultar' : 'Mostrar'} ${id === 'confirm' ? 'confirmación de contraseña' : 'contraseña'}`);
  const label = button.querySelector('span'); if (label) label.textContent = visible ? 'Ocultar' : 'Ver';
 });
});
p.addEventListener('input',rules);confirmation.addEventListener('input',rules);
byId<HTMLFormElement>('register-form').addEventListener('submit',async(e)=>{e.preventDefault();if(!rules())return toast('Completa los requisitos de contraseña antes de continuar.','error');const btn=byId<HTMLButtonElement>('register-submit');btn.disabled=true;try{await request('/user/Register',{method:'POST',body:JSON.stringify({firstName:byId<HTMLInputElement>('first').value.trim(),lastName:byId<HTMLInputElement>('last').value.trim(),email:byId<HTMLInputElement>('email').value.trim(),password:p.value})});modal(`<div class="dialog-body modal-center"><div class="modal-icon">✓</div><h2>¡Cuenta creada correctamente!</h2><p>Ya puedes ingresar con tu correo y contraseña.</p><a href="/login" class="btn btn-primary" style="margin-top:20px">Ir a iniciar sesión →</a></div>`);}catch(err){toast((err as Error).message,'error');}finally{btn.disabled=false;}});
