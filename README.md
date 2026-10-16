# GameVault · Sistema de gestión de videojuegos (Angular)

Aplicación web frontend en **Angular 21** + **Angular Material** para explorar un catálogo de videojuegos conectado a **MockAPI** y consultar recomendaciones de compra en servicios externos. Incluye panel de administración y una sección de ofertas con **CheapShark**.

El catálogo y las ofertas se pueden consultar sin iniciar sesión. La aplicación recomienda juegos y dirige a catálogos u ofertas externas; no procesa compras ni pagos. El acceso de administrador permite mantener los videojuegos cargados en MockAPI.

El panel también permite elegir qué diapositivas aparecen en la portada y editar sus textos. Esa configuración se guarda en el navegador usado para administrarla; no crea recursos adicionales en MockAPI.

## Requisitos

- Node.js `^20.19`, `^22.12` o `^24` (requisito de Angular 21) y npm.
- Una cuenta gratuita en [MockAPI](https://mockapi.io).

## Primeros pasos

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

Si `npm install` marca una incompatibilidad de versiones, revisá la tabla de compatibilidad de Angular (https://angular.dev/reference/versions) y ajustá los números de `package.json`. Todos los paquetes `@angular/*` deben tener la misma versión mayor.

## Credenciales de demostración

| Usuario   | Contraseña   | Rol            | Puede                                     |
|-----------|--------------|----------------|-------------------------------------------|
| `admin`   | `admin123`   | Administrador  | Gestionar el catálogo y ver el panel admin |

El catálogo y las ofertas son públicos. Solo se requiere iniciar sesión para acceder al panel de administración. El rol administrador existe como cuenta de demostración.

> ⚠️ **Solo con fines académicos.** La autenticación sigue siendo simulada: la sesión vive en `localStorage` y cualquiera puede modificarla desde el navegador. Las contraseñas se guardan **hasheadas** (PBKDF2-SHA256 con sal aleatoria, nunca en texto plano), pero la verificación ocurre en el navegador y el hash queda visible en la API pública. Los guards de Angular solo controlan qué ve la interfaz; **no reemplazan la seguridad de un servidor**. Cualquiera que conozca la URL de MockAPI puede llamarla directamente.
>
> El hash usa `crypto.subtle`, que el navegador solo ofrece en **HTTPS o `localhost`**. En Netlify/Firebase/Vercel funciona; si servís la app por `http://` en otra dirección, el registro y el login de cuentas propias fallarán.

## Configurar la base de datos en MockAPI (obligatorio)

La "base de datos" del proyecto son **dos recursos de MockAPI** (cada recurso funciona como una tabla): `videojuegos` y `usuarios`. Sin configurarlos, la app abre pero muestra avisos como *"La API todavía no está configurada"* (a propósito: no simula guardados). La cuenta de demostración `admin` funciona igual sin base de datos.

1. Entrá a https://mockapi.io y creá una cuenta.
2. Creá un proyecto nuevo (por ejemplo `gamevault`).
3. Dentro del proyecto, agregá un recurso (*resource*) llamado **`videojuegos`**.
4. Definí estos campos (el `id` lo agrega MockAPI solo):

   | Campo              | Tipo   |
   |--------------------|--------|
   | `nombre`           | String |
   | `genero`           | String |
   | `plataforma`       | String |
   | `precio`           | **Number** |
   | `imagen`           | String |
   | `descripcion`      | String |
   | `fechaLanzamiento` | String (formato `AAAA-MM-DD`) |

   Si MockAPI genera registros de ejemplo con datos aleatorios, podés borrarlos o editarlos.
5. Agregá un **segundo recurso** llamado **`usuarios`** con estos campos (todos String; el `id` lo agrega MockAPI):

   | Campo             | Qué guarda |
   |-------------------|------------|
   | `nombreUsuario`   | Nombre de usuario en minúsculas |
   | `nombre`          | Nombre y apellido |
   | `sal`             | Sal aleatoria de la contraseña |
   | `claveHash`       | Hash de la contraseña |
   | `preguntaSecreta` | Pregunta elegida para recuperar la cuenta |
   | `salRespuesta`    | Sal aleatoria de la respuesta |
   | `respuestaHash`   | Hash de la respuesta (en minúsculas, sin espacios en los bordes) |

   Dejá el recurso **vacío** (borrá cualquier registro de ejemplo que genere MockAPI; no son cuentas válidas).
6. Copiá la URL de cada recurso. Tiene esta forma: `https://TU_ID.mockapi.io/api/v1/videojuegos`. Pegala en el navegador y comprobá que devuelve un JSON (puede ser `[]`).
7. Abrí `src/environments/environment.ts` y completá:

   ```ts
   export const environment = {
     apiUrl: 'https://TU_ID.mockapi.io/api/v1/videojuegos',
     usuariosApiUrl: 'https://TU_ID.mockapi.io/api/v1/usuarios',
     ofertasApiUrl: 'https://www.cheapshark.com/api/1.0',
   };
   ```
8. Reiniciá `npm start`.

La URL de MockAPI no es un secreto (es pública), por eso puede estar en el repositorio.

### Cargar datos de ejemplo (opcional)

`datos-demo/videojuegos.json` trae 8 videojuegos de ejemplo. **Son solo datos de demostración**: no se cargan solos ni forman parte de la app; quedan en la API únicamente si los cargás vos. Con Node 20.19 o superior:

```bash
node -e "const url='TU_URL_DE_MOCKAPI';const datos=require('./datos-demo/videojuegos.json');(async()=>{for(const d of datos){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});console.log(r.status,d.nombre)}})()"
```

Las imágenes apuntan a portadas públicas de Steam; no se comprobó que sigan disponibles. Si alguna falla, la tarjeta muestra un ícono de reemplazo.

### Probar cada operación CRUD

| Operación | Cómo probarla | Qué verificar |
|-----------|---------------|---------------|
| Listar | Entrá a `/videojuegos` sin iniciar sesión | Aparecen las tarjetas |
| Detalle | "Ver detalles" en una tarjeta | Se ven todos los campos |
| Crear | Con `admin`: "Agregar videojuego" | Mensaje de éxito y aparece en MockAPI (panel *Data*) |
| Editar | Con `admin`: ícono de lápiz | El formulario viene completo; al guardar se actualiza en MockAPI |
| Eliminar | Con `admin`: ícono de papelera y confirmar | Desaparece también del panel de MockAPI |
| Recomendaciones | Cuando MockAPI no tiene títulos, revisá la selección de ejemplo | Cada título permite buscar ofertas externas en CheapShark |
| Panel admin | Ingresá con `admin` y abrí `/admin` | Muestra visitas, edición del catálogo, barra lateral y botón para actualizar los datos |
| Portada | En el panel admin, editá el contenido del inicio | Elegí las diapositivas visibles, editá sus textos y guardá los cambios en este navegador |
| Registro | `/registro`: completá el formulario | Mensaje de éxito; aparece un registro en el panel *Data* de `usuarios` con `claveHash` (no la contraseña) |
| Nombre repetido | Registrate otra vez con el mismo usuario (o con `admin`) | Error "ya está en uso" / "no está disponible" |
| Login con cuenta nueva | Iniciá sesión con la cuenta creada | Entra con rol "Usuario"; `/videojuegos/nuevo` queda bloqueado |
| Recuperar contraseña | `/recuperar-clave`: usuario → respuesta correcta → contraseña nueva | Mensaje de éxito; la clave anterior deja de funcionar y la nueva sí |
| Respuesta incorrecta | Mismo flujo con una respuesta equivocada | Error "La respuesta no es correcta." y la clave no cambia |
| Catálogo público | Sin iniciar sesión, abrí `/` o `/videojuegos` | Se ven los juegos y se puede buscar, filtrar y consultar opciones externas |

## API externa: CheapShark

La pantalla **Ofertas** (`/ofertas`) consulta `https://www.cheapshark.com/api/1.0/deals`. La [documentación oficial de CheapShark](https://apidocs.cheapshark.com/) indica que su API no requiere clave, admite CORS y aplica límites de uso. Si falla la consulta, la pantalla muestra un mensaje y el catálogo sigue funcionando. Si en el futuro usás una API que **sí** pide clave, no la pongas en el frontend: hacé la llamada desde un backend propio o una función serverless.

## Build de producción

```bash
npm run build
```

El resultado queda en `dist/gestion-videojuegos/browser`.

## Publicar

La app usa rutas internas (`/videojuegos/3`). Al recargar el navegador, el hosting tiene que devolver siempre `index.html`; si no, aparece un 404.

- **Netlify (recomendado, ya configurado):** subí el proyecto a GitHub, en Netlify elegí *Add new site → Import from Git*. `netlify.toml` ya define el comando de build, la carpeta de salida y la redirección a `index.html`.
- **Firebase Hosting:** `firebase init hosting` → carpeta pública `dist/gestion-videojuegos/browser` → *single-page app: Yes*. Luego `npm run build && firebase deploy`.
- **Vercel:** agregá un `vercel.json` con `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`; carpeta de salida `dist/gestion-videojuegos/browser`.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Proyecto inicial: gestión de videojuegos con Angular"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Aunque `environment.ts` quede en el repositorio, no contiene secretos: las URLs de MockAPI son públicas. **No** subas contraseñas reales de nadie ni uses datos personales verdaderos en esta base de pruebas.

`.gitignore` ya excluye `node_modules`, `dist` y `.angular`.

## Estructura

```
src/app/
├── core/              Lo que usa toda la app: modelos, servicios, guards
├── shared/            Piezas reutilizables: barras de navegación, mensajes, diálogo, pipe
├── features/
│   ├── auth/          Login, registro y recuperación de contraseña
│   ├── videojuegos/   Listado, tarjeta, detalle, formulario (carga diferida)
│   ├── admin/         Panel de administración del catálogo
│   ├── api-externa/   Ofertas (CheapShark)
│   └── compra/        Prototipos conservados; no están registrados en las rutas activas
├── app.routes.ts      Rutas principales
└── app.config.ts      Configuración global (router, HttpClient)
```

Para estudiar y defender el trabajo leé **`DOCUMENTACION.md`**.

## Qué está verificado y qué no

- `npm run build` se ejecutó correctamente durante la revisión.
- Las rutas GET configuradas de `videojuegos` y `usuarios` en MockAPI respondieron HTTP 200. No se ejecutaron operaciones de escritura para no modificar datos.
- Una consulta GET de CheapShark respondió HTTP 200 al enviar un `User-Agent`; la app depende de ese servicio externo para mostrar ofertas.
- El código dirige la ruta inicial al catálogo público y cierra una sesión de administrador guardada al entrar por esa ruta.
- El botón **Actualizar** del panel vuelve a consultar el catálogo y muestra la hora de actualización.
- No se verificó un flujo completo en navegador ni se desplegó esta copia en un servicio de hosting.
