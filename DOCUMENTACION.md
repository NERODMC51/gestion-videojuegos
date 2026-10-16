# Guía para estudiar y defender el proyecto

Todos los ejemplos salen del código real del proyecto. Las rutas son relativas a `src/app/`.

---

## 1. Qué hace cada carpeta

| Carpeta | Para qué sirve |
|---------|----------------|
| `core/models/` | Modelos (interfaces TypeScript): `videojuego.model.ts`, `usuario.model.ts` |
| `core/services/` | `VideojuegoService` (tabla videojuegos), `UsuarioService` (tabla usuarios), `AuthService` (sesión, registro y recuperación), `NotificacionService` (mensajes emergentes) |
| `core/guards/` | Protección de rutas: `autenticado.guard.ts`, `admin.guard.ts` |
| `core/utils/` | `errores-http.ts` (errores legibles), `peticion-api.ts` (envoltorio común de peticiones), `hash.ts` (hash de contraseñas) |
| `shared/components/` | Piezas reutilizables en varias pantallas: barra de navegación, mensaje de estado, diálogo de confirmación, página de mensaje (404 / sin permiso) |
| `shared/pipes/` | Pipe personalizado `resumen` |
| `shared/utils/` | `estado-carga.ts`: `conEstado()` para cargando / datos / error; `mensajes-validacion.ts`: mensajes de error de formularios |
| `shared/validators/` | `claves-iguales.validator.ts`: validador "las contraseñas coinciden" |
| `features/auth/` | Login, registro y recuperación de contraseña |
| `features/videojuegos/` | Todo lo del catálogo. `pages/` = pantallas completas (una por ruta); `components/` = piezas más chicas que usan las pantallas; `videojuegos.routes.ts` = rutas del módulo |
| `features/compra/` | Prototipos de carrito y checkout conservados, pero no registrados en las rutas activas; el flujo actual recomienda opciones de compra externas |
| `features/api-externa/` | Pantalla de ofertas y su servicio (CheapShark) |
| `environments/` (fuera de `app/`) | URL de las APIs en un único lugar |

**Regla para explicar:** *las pantallas coordinan, los componentes muestran, los servicios hablan con el exterior.*

## 2. Para qué sirve cada componente principal

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| `AppComponent` | `app.component.*` | Muestra la barra de navegación, el `<router-outlet>` y la barra lateral cuando hay una sesión de administrador |
| `LoginComponent` | `features/auth/pages/login/` | Formulario de login; llama a `AuthService.iniciarSesion()` |
| `RegistroComponent` | `features/auth/pages/registro/` | Formulario de alta de cuenta; llama a `AuthService.registrar()` |
| `RecuperarClaveComponent` | `features/auth/pages/recuperar-clave/` | Recuperación en 2 pasos (usuario → pregunta secreta y contraseña nueva) |
| `ListadoVideojuegosComponent` | `features/videojuegos/pages/listado-videojuegos/` | Pide la lista, aplica búsqueda y filtros, gestiona ver / editar / eliminar |
| `TarjetaVideojuegoComponent` | `features/videojuegos/components/tarjeta-videojuego/` | Dibuja un videojuego y **avisa** qué botón se tocó |
| `DetalleVideojuegoComponent` | `features/videojuegos/pages/detalle-videojuego/` | Muestra todos los datos de un videojuego |
| `PaginaFormularioVideojuegoComponent` | `features/videojuegos/pages/pagina-formulario-videojuego/` | Decide si es alta o edición y llama al servicio |
| `FormularioVideojuegoComponent` | `features/videojuegos/components/formulario-videojuego/` | Formulario reactivo con validaciones; **no** hace peticiones |
| `BarraNavegacionComponent` | `shared/components/barra-navegacion/` | Navegación, usuario/rol y cierre de sesión |
| `LateralAdminComponent` | `shared/components/lateral-admin/` | Acceso lateral del administrador, visible mientras la sesión admin siga activa |
| `MensajeEstadoComponent` | `shared/components/mensaje-estado/` | Spinner, error o "sin resultados" reutilizable |
| `ConfirmarDialogoComponent` | `shared/components/confirmar-dialogo/` | Diálogo "¿Seguro?" (MatDialog) |
| `OfertasComponent` | `features/api-externa/pages/ofertas/` | Busca y muestra ofertas externas |

## 3. Componente vs. servicio vs. modelo

- **Modelo** (`Videojuego`): describe la *forma* de los datos. No hace nada, solo define campos y tipos.
- **Servicio** (`VideojuegoService`): clase con lógica **sin pantalla**. Se crea una sola vez y se comparte. Acá viven las peticiones HTTP.
- **Componente** (`TarjetaVideojuegoComponent`): una parte de la pantalla. Tiene TypeScript (comportamiento), HTML (qué se ve) y CSS (cómo se ve).

Ejemplo: el modelo dice que un videojuego tiene `precio: number`; el servicio trae videojuegos de la API; el componente los muestra.

## 4. Inyección de dependencias

Un componente no crea sus servicios con `new`: se los **pide** a Angular con `inject()`, y Angular le entrega la instancia compartida.

```ts
private readonly servicio = inject(VideojuegoService);
protected readonly auth = inject(AuthService);
```

El servicio se registra con `@Injectable({ providedIn: 'root' })`, que significa "hay una sola instancia para toda la app". **Ventaja:** si cambia la forma de acceder a los datos, se modifica solo el servicio y ningún componente se entera.

## 5. Qué hace HttpClient

Es la clase de Angular para hacer peticiones HTTP (GET, POST, PUT, DELETE). Se habilita una vez en `app.config.ts` con `provideHttpClient()`. Cada método devuelve un **Observable** y **no hace nada hasta que alguien se suscribe**.

```ts
this.http.get<Videojuego[]>(this.url)
```

El `<Videojuego[]>` solo le dice a TypeScript qué forma tendrá la respuesta; no la valida en ejecución.

## 6. Cómo funciona cada operación CRUD

Todas están en `core/services/videojuego.service.ts`:

| Operación | Método | HTTP | URL |
|-----------|--------|------|-----|
| Listar | `obtenerVideojuegos()` | GET | `/videojuegos` |
| Detalle | `obtenerVideojuegoPorId(id)` | GET | `/videojuegos/5` |
| Crear | `crearVideojuego(datos)` | POST | `/videojuegos` (cuerpo = datos) |
| Modificar | `actualizarVideojuego(id, datos)` | PUT | `/videojuegos/5` |
| Eliminar | `eliminarVideojuego(id)` | DELETE | `/videojuegos/5` |

Todos pasan por el método privado `ejecutar()`, que (1) avisa si no hay URL configurada y (2) traduce errores. Así no se repite código.

## 7. Cómo viajan los datos: del formulario a la API

1. El usuario completa `FormularioVideojuegoComponent` (formulario reactivo).
2. Al enviar, `enviar()` verifica `formulario.invalid`. Si es válido, hace `this.guardar.emit({...})` (un `output`).
3. `PaginaFormularioVideojuegoComponent` recibe el evento en `(guardar)="guardar($event)"`.
4. Su método `guardar()` llama a `servicio.crearVideojuego(datos)` o `servicio.actualizarVideojuego(id, datos)` según exista `:id`.
5. El servicio usa `HttpClient` para enviar el POST/PUT a MockAPI.
6. Si sale bien: `NotificacionService` muestra el mensaje y se navega al detalle, que **vuelve a pedir** los datos a la API (así se ve lo guardado de verdad). Si falla: se muestra el mensaje de error.

```
Formulario ─emit→ Página ─llama→ Servicio ─HttpClient→ MockAPI
```

## 8. Observables (RxJS)

Un Observable es un "flujo de valores en el tiempo". Una petición HTTP emite **una** respuesta y termina. Operadores usados:

| Operador | Dónde | Para qué |
|----------|-------|----------|
| `map` | `conEstado`, `OfertasService` | Transformar el dato |
| `switchMap` | listado, detalle, ofertas | Cambiar a una nueva petición cancelando la anterior |
| `catchError` | `VideojuegoService.ejecutar`, `conEstado` | Capturar errores y convertirlos en mensajes |
| `finalize` | formulario | Apagar "Guardando..." tanto si sale bien como mal |
| `startWith` | `conEstado` | Emitir "cargando" al principio |
| `filter` | eliminar | Continuar solo si el usuario confirmó |

**Evitar fugas de memoria:** el `async` pipe (`estado$ | async`) y `toSignal()` se desuscriben solos al destruir el componente. Las únicas suscripciones manuales (`.subscribe` al guardar o eliminar) son de peticiones HTTP, que **terminan solas**.

La función `conEstado()` (`shared/utils/estado-carga.ts`) emite `{cargando: true}` → luego `{datos}` o `{error}`. Por eso cada pantalla puede decidir con un `@if` si muestra spinner, contenido o error.

## 9. Reactive Forms y validaciones

Es un formulario definido **en TypeScript** (no en el HTML), lo que facilita validarlo y probarlo.

```ts
precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
```

| Requisito | Dónde se cumple |
|-----------|-----------------|
| Obligatorios | `Validators.required` en los 7 campos |
| Precio > 0 | `Validators.min(0.01)` |
| Longitudes | `maxLength(80)` nombre, `minLength(10)` y `maxLength(500)` descripción |
| URL de imagen | `Validators.pattern(/^https?:\/\/\S+$/i)` |
| Fecha válida | Validador propio `fechaValida` (existe y año 1970–2100) |
| No enviar inválido | `enviar()`: `if (formulario.invalid) { markAllAsTouched(); return; }` |
| Mensajes claros | `mensajeError(campo)` dentro de `<mat-error>` |

## 10. Rutas y Lazy Loading

`app.routes.ts` define las rutas principales. `/videojuegos` usa `loadChildren`, que **descarga ese código solo cuando el usuario entra ahí**:

```ts
{
  path: 'videojuegos',
  loadChildren: () => import('./features/videojuegos/videojuegos.routes').then(m => m.VIDEOJUEGOS_ROUTES)
}
```

Rutas finales: `/login`, `/registro`, `/recuperar-clave`, `/videojuegos`, `/videojuegos/nuevo`, `/videojuegos/editar/:id`, `/videojuegos/:id`, `/ofertas`, `/no-autorizado`, y `**` (no encontrada). En `videojuegos.routes.ts`, `nuevo` y `editar/:id` van **antes** de `:id`; si no, Angular tomaría la palabra "nuevo" como un id. `login`, `ofertas` y las páginas de mensaje usan `loadComponent` (lazy a nivel de componente).

## 11. Guards y roles

- `autenticadoGuard` (**autenticación**: ¿iniciaste sesión?): si no, redirige a `/login?returnUrl=...`; está definido, pero actualmente no está asignado a ninguna ruta.
- `adminGuard` (**autorización**: ¿sos administrador?): si no es admin, redirige a `/no-autorizado`.
- El catálogo y las ofertas son públicos; `adminGuard` protege `nuevo`, `editar/:id` y `/admin`.
- Además, la interfaz oculta botones con `@if (auth.esAdmin())`.
- Cerrar sesión: `AuthService.cerrarSesion()` borra `localStorage`, pone el usuario en `null` y navega a `/videojuegos`.

**Para aclarar al profesor:** un guard del frontend solo controla la interfaz. Si alguien llama a la API directamente, el guard no interviene. La seguridad real debe estar en el servidor.

## 12. Comunicación entre componentes

Patrón **padre → hijo (input)** y **hijo → padre (output)**:

```html
<app-tarjeta-videojuego [videojuego]="videojuego" [esAdmin]="auth.esAdmin()"
  (ver)="verDetalle($event)" (editar)="editar($event)" (eliminar)="eliminar($event)" />
```
```ts
videojuego = input.required<Videojuego>();
ver = output<Videojuego>();
```

La tarjeta no sabe navegar ni borrar: solo avisa. Lo mismo ocurre entre `PaginaFormularioVideojuegoComponent` (padre) y `FormularioVideojuegoComponent` (hijo).

## 13. Binding, directivas y pipes

| Concepto | Ejemplo | Archivo |
|----------|---------|---------|
| Interpolación | `{{ videojuego().nombre }}` | `tarjeta-videojuego.component.html` |
| Property binding | `[src]="videojuego().imagen"` | idem |
| Event binding | `(click)="ver.emit(videojuego())"` | idem |
| Two-way (separado) | `[ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)"` | `listado-videojuegos.component.html` |
| Control de flujo `@if` / `@else` | estados cargando/error/vacío | listado |
| Control de flujo `@for` | `@for (v of filtrados(); track v.id)` | listado |
| Control de flujo `@switch` | `mensaje-estado.component.html` | |
| Pipe `currency` | `{{ precio \| currency:'USD' }}` | tarjeta, detalle |
| Pipe `date` | `{{ fecha \| date:'dd/MM/yyyy' }}` | detalle |
| Pipe `async` | `@if (estado$ \| async; as estado)` | detalle, formulario, ofertas |
| Pipe `titlecase` | rol del usuario | barra de navegación |
| **Pipe personalizado** | `{{ descripcion \| resumen:90 }}` | `shared/pipes/resumen.pipe.ts` |

## 14. API externa (CheapShark)

`features/api-externa/services/ofertas.service.ts` hace `GET https://www.cheapshark.com/api/1.0/deals?title=...&pageSize=12`. La respuesta viene en inglés y con precios como texto, así que el servicio la convierte a `Oferta` (`models/oferta.model.ts`) con `map`. No necesita clave. Si falla, `catchError` genera un mensaje y la pantalla muestra el error sin afectar el catálogo. Desde el detalle de un videojuego, el botón "Buscar ofertas" llega con `?titulo=Nombre` y la pantalla lo lee con `queryParamMap`.

## 15. Cambiar un campo del videojuego (ejemplo: agregar `desarrolladora`)

1. `core/models/videojuego.model.ts`: agregar `desarrolladora: string` a `Videojuego`.
2. MockAPI: agregar el campo `desarrolladora` (String) al recurso.
3. `formulario-videojuego.component.ts`: sumarlo al `fb.group({...})`, a `patchValue` dentro del `effect`.
4. `formulario-videojuego.component.html`: agregar un `<mat-form-field>` con `formControlName="desarrolladora"`.
5. `detalle-videojuego.component.html` (y la tarjeta si querés): mostrarlo.
6. `datos-demo/videojuegos.json`: agregarlo si vas a recargar datos.

`DatosVideojuego` se deriva con `Omit<Videojuego, 'id'>`, así que se actualiza solo. `VideojuegoService` **no cambia**.

## 16. Cambiar la URL de la API

Solo `src/environments/environment.ts`: `apiUrl` (videojuegos) y `usuariosApiUrl` (usuarios). Nada más en el proyecto contiene esas URLs.

## 17. Ejecutar, compilar y publicar

Ver `README.md`: `npm install` → `npm start` → `npm run build` (salida en `dist/gestion-videojuegos/browser`) → Netlify (ya configurado con `netlify.toml`), Firebase o Vercel. La redirección a `index.html` es necesaria para que las rutas internas funcionen al recargar.

## 18. Limitaciones de la autenticación

- La cuenta de demostración (`admin`) está **escrita en el código**: cualquiera puede leerla desde el navegador.
- La sesión está en `localStorage`; se puede editar y convertirse en admin desde las herramientas del desarrollador. `AuthService` solo valida que el rol tenga una forma válida, pero eso **no es seguridad**.
- Las contraseñas de cuentas registradas se guardan hasheadas, pero **la comprobación la hace el navegador**: no hay un servidor que decida quién entra. El hash y la sal son visibles para cualquiera que abra la API pública.
- Los guards protegen la interfaz, no los datos: la API de MockAPI es pública y cualquiera puede leer o escribir en ella sin pasar por la app.
- No hay tokens, expiración de sesión, límite de intentos fallidos ni verificación de identidad real.
- En un sistema real: autenticación y roles en servidor (por ejemplo JWT o un proveedor como Firebase Auth), recuperación por correo y un interceptor HTTP que envíe el token.

## 19. La base de datos

El proyecto usa **MockAPI como base de datos**: un servicio que guarda datos y los expone por HTTP. Cada *recurso* equivale a una tabla.

| Tabla (recurso) | La usa | Qué guarda |
|-----------------|--------|------------|
| `videojuegos` | `VideojuegoService` | El catálogo |
| `usuarios` | `UsuarioService` | Las cuentas creadas desde la web |

Las URLs están en `src/environments/environment.ts` (`apiUrl` y `usuariosApiUrl`). Los dos servicios comparten `ejecutarPeticion()` (`core/utils/peticion-api.ts`), que avisa si falta configurar la URL y traduce los errores, así no se repite código.

`UsuarioService` solo hace operaciones de datos (`buscarPorNombreUsuario`, `crear`, `actualizar`). **Las reglas** (hashear, comparar, impedir nombres repetidos) están en `AuthService`. Es la misma separación que usamos con los videojuegos: *el servicio de datos accede, otro decide*.

Detalle útil: MockAPI filtra por coincidencia parcial y responde 404 cuando un filtro no encuentra nada. Por eso `buscarPorNombreUsuario()` convierte ese 404 en lista vacía y luego busca el nombre **exacto**.

## 20. Registro de usuarios

1. `RegistroComponent` muestra un formulario reactivo con: nombre, usuario (`pattern` de 3 a 20 letras, números o `_`), contraseña (mínimo 8), repetir contraseña, pregunta secreta (lista fija `PREGUNTAS_SECRETAS`) y respuesta.
2. Las dos contraseñas se comparan con el validador de grupo `clavesIguales` (`shared/validators/`). `ConfirmacionMatcher` pinta de rojo el segundo campo cuando no coinciden.
3. Al enviar, `AuthService.registrar()`:
   - rechaza `admin` (reservado para la cuenta de demostración);
   - consulta la base: si el nombre existe, falla con un mensaje;
   - genera una **sal** aleatoria y calcula `hashear(clave, sal)`; hace lo mismo con la respuesta secreta (en minúsculas);
   - guarda con `UsuarioService.crear()` (POST a `/usuarios`).
4. En la base queda, por ejemplo: `{ nombreUsuario: "ana", nombre: "Ana Pérez", sal: "9f2c…", claveHash: "a41b…", … }`. **La contraseña real nunca se guarda ni se envía.**
5. El **rol no se guarda**: toda cuenta registrada entra como `usuario`. Si el rol fuera un campo de la base, cualquiera podría crearse un admin llamando a la API.

**¿Qué es hashear y qué es la sal?** Un hash convierte un texto en una cadena fija que no se puede "des-hacer". Para verificar, se hashea lo que escribe la persona y se compara con el guardado. La sal es un texto aleatorio que se mezcla antes de hashear: dos personas con la misma contraseña terminan con hashes distintos. Se usa PBKDF2-SHA256 con 100.000 iteraciones (`core/utils/hash.ts`), que la hace lenta de adivinar por fuerza bruta.

## 21. Inicio de sesión y recuperación de contraseña

**Login (`AuthService.iniciarSesion`)** ahora devuelve un Observable, porque consulta la base:
1. Si el usuario es `admin` (cuenta demo), se compara la clave en memoria.
2. Si no, se busca en la tabla `usuarios`, se hashea la clave ingresada con la **sal guardada** y se compara con `claveHash`.
3. Si coincide, se guarda la sesión (rol `usuario`). El login muestra "Ingresando..." mientras espera.

**Recuperación (`/recuperar-clave`)** funciona **sin correo**, porque enviar emails requiere un servidor y este proyecto es solo frontend. Se hace con pregunta secreta:
1. *Paso 1*: la persona escribe su usuario. `obtenerPreguntaSecreta()` busca la cuenta y devuelve la pregunta.
2. *Paso 2*: responde y elige una contraseña nueva. `restablecerClave()` hashea la respuesta con su sal, la compara con `respuestaHash` y, si es correcta, guarda una **sal nueva** y el hash de la clave nueva con `UsuarioService.actualizar()` (PUT).
3. Las cuentas de demostración no se pueden recuperar.

**Limitaciones para decir en la defensa:**
- Quien conozca la respuesta secreta puede cambiar la contraseña (como en cualquier pregunta secreta, es un método débil).
- No hay límite de intentos: alguien podría probar respuestas sin freno.
- El paso 1 revela si un usuario existe.
- Una solución real usaría un enlace enviado por correo con un token que vence (por ejemplo, `sendPasswordResetEmail` de Firebase Auth).

---

## Tabla de requisitos de la consigna

| Requisito | Dónde se cumple |
|-----------|-----------------|
| Angular + API REST | Proyecto completo; `core/services/videojuego.service.ts` |
| Componentes standalone | Todos (por defecto en Angular 21, sin `NgModule`) |
| Lazy Loading | `app.routes.ts` (`loadChildren` y `loadComponent`) |
| Archivos de componentes | HTML y TypeScript están separados; los estilos se encuentran en CSS por componente o en estilos globales, según corresponda |
| Sin HTTP en componentes | Todo en `VideojuegoService` y `OfertasService` |
| Modelo `Videojuego` con interfaz | `core/models/videojuego.model.ts` (id `string \| number`) |
| Login con roles | `features/auth/pages/login/`, `core/services/auth.service.ts` |
| Crear usuario (registro) | `features/auth/pages/registro/`, `AuthService.registrar()`, sección 20 |
| Recuperación de contraseña | `features/auth/pages/recuperar-clave/`, `AuthService.restablecerClave()`, sección 21 |
| Base de datos | Recursos `videojuegos` y `usuarios` de MockAPI; `UsuarioService`, `VideojuegoService`, sección 19 |
| Contraseñas no guardadas en texto plano | `core/utils/hash.ts` (PBKDF2 + sal) |
| Validación "contraseñas coinciden" | `shared/validators/claves-iguales.validator.ts` |
| AuthService: login, logout, usuario | `iniciarSesion()`, `cerrarSesion()`, `usuario` |
| Aviso sobre autenticación académica | Pantalla de login, README y sección 18 |
| Listado en MatCard | `tarjeta-videojuego.component.html` |
| Botón agregar solo admin | `listado-videojuegos.component.html` (`@if (auth.esAdmin())`) |
| Editar / eliminar solo admin | Tarjeta (`esAdmin`) + `adminGuard` |
| Buscador y filtros (género / plataforma) | `listado-videojuegos.component.ts` (`filtrados`) |
| Mensajes de carga, vacío y error | `mensaje-estado.component.*` |
| Detalle completo | `detalle-videojuego.component.*` |
| Formulario reactivo con validaciones | `formulario-videojuego.component.ts` |
| Mismo formulario para crear y editar | `pagina-formulario-videojuego.component.ts` (según `:id`) |
| Confirmación al guardar | `NotificacionService` (snackbar) + navegación al detalle actualizado |
| Confirmación al eliminar | `confirmar-dialogo.component.*` |
| Barra de navegación | `barra-navegacion.component.*` |
| `VideojuegoService` con 5 métodos | `core/services/videojuego.service.ts` |
| URLs de la API en un solo lugar | `src/environments/environment.ts` (`apiUrl`, `usuariosApiUrl`) |
| Mensaje si la API / BD no está configurada | `MENSAJE_API_SIN_CONFIGURAR` y `MENSAJE_BD_SIN_CONFIGURAR` |
| Datos de demo diferenciados | `datos-demo/videojuegos.json` (fuera de `src/`, no se carga solo) |
| Guards + redirección | `core/guards/`, rutas `/login` y `/no-autorizado` |
| Ruta 404 | `app.routes.ts` (`**`) |
| `@Input` / `@Output` | `input()` / `output()` en tarjeta y formulario |
| Interpolación, bindings, control de flujo | Sección 13 |
| Pipes integrados + personalizado | Sección 13; `resumen.pipe.ts` |
| Inyección de dependencias | `inject()` en todos los componentes y servicios |
| RxJS y estados de carga/éxito/error | `conEstado()`, `switchMap`, `catchError`, `finalize` |
| Sin fugas de memoria | `async` pipe, `toSignal`, HTTP que completa |
| Angular Material | Toolbar, Card, Button, Icon, FormField, Input, Select, Dialog, SnackBar, ProgressSpinner |
| API externa | `features/api-externa/` (CheapShark) |
| Diseño oscuro y responsive | `src/styles.scss` y CSS de cada componente (`@media`, `grid auto-fill`) |
| `.gitignore`, README, build, deploy | Raíz del proyecto, `netlify.toml` |
| Documento de defensa | Este archivo |
