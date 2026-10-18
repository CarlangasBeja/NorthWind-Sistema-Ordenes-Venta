# NorthWind.Sales.AngularClient

Cliente web en **Angular 21** del sistema NorthWind (reemplaza al cliente Blazor). Consume la Web API
`NorthWind.Sales.WebApi` mediante servicios REST y JWT.

La guía completa de instalación y configuración está en **[`README_ANGULAR.md`](../../../README_ANGULAR.md)**
(raíz del repositorio).

## Comandos

```powershell
npm install   # primera vez
npm start     # http://localhost:4200
npm run build # compilación de producción en dist/
```

La dirección de la API se configura en `public/appsettings.json` (`WebApiAddress`).
