# Guía de adaptación a Fedora Workstation 44 — trabajo individual Blazor

## 1. Instalación del sistema

Descargue la imagen oficial **Fedora Workstation 44** desde https://fedoraproject.org/workstation/download . Puede instalarse de forma nativa o en una máquina virtual de arquitectura x86_64. Tome una captura del escritorio y otra de `cat /etc/fedora-release` para evidenciar la versión.

## 2. Trasladar NorthWind

Copie este directorio desde Windows a una carpeta personal de Fedora. Evite rutas Windows (como `C:\Users\...`) y abra la terminal desde la carpeta que contiene `NorthWind.sln`.

## 3. Instalación y arranque

Siga `Fedora44/README.md` y ejecute los scripts numerados 01 a 05. Las credenciales se piden por teclado, sin colocarlas en los archivos del proyecto.

## 4. Comprobación de Blazor y API

En dos terminales lance `07_ejecutar_api.sh` y `08_ejecutar_blazor.sh`. Compruebe API en `http://127.0.0.1:5254/swagger` y Blazor en `http://127.0.0.1:5255`.

## 5. Pruebas sugeridas

Iniciar sesión, abrir Clientes, abrir Productos, crear una orden con uno o varios productos, comprobar el total y el PDF si está disponible. Para demostrar el evento de dominio, configure Resend y registre una orden con 4 productos diferentes; la API genera el aviso al Gmail del administrador.

## 6. Aspectos de la evaluación

Documente con capturas verificables la versión de Fedora, .NET, el contenedor y las pantallas Blazor. Si el grupo debe tener una distribución o versión distinta, confirme con el docente que **Fedora Workstation 44 es la asignación de su grupo**, ya que el enunciado indica que individual y grupal deben usar la misma versión asignada.

## Referencias oficiales

- Fedora Workstation: https://fedoraproject.org/workstation/download
- .NET Fedora: https://learn.microsoft.com/dotnet/core/install/linux-fedora
- SQL Server en contenedor: https://learn.microsoft.com/sql/linux/quickstart-install-connect-docker?view=sql-server-ver16
