# 🌱 EcoMarket — Plataforma Web de Comercio Sostenible

> **Taller Práctico 2 | Desarrollo Web con IA**  
> **Institución:** Campuslands  
> **Tecnologías:** HTML5 Semántico • CSS3 Puro (Mobile-First, Grid & Flexbox) • JavaScript Vanilla • Chart.js • localStorage • Prompt Engineering  
> **Estado del Proyecto:** 100% Completado y Validado

---

## 📌 1. Descripción del Proyecto

**EcoMarket** es una plataforma web desarrollada para una startup colombiana enfocada en conectar pequeños agricultores y productores locales de alimentos orgánicos y artículos sostenibles con consumidores que practican un consumo responsable y consciente.

El proyecto abarca:
1. **Landing Page:** Presentación comercial de la marca, propuesta de valor de comercio directo, categorías de productos, productos destacados, impacto campesino/ambiental, testimonios de productores aliados y formulario de boletín accesible.
2. **Dashboard Administrativo:** Panel de control para consultar el estado del catálogo en tiempo real con 3 tarjetas KPI, menú hamburguesa accesible con JavaScript vanilla, gráfico interactivo con **Chart.js** (bonus del 5%), búsqueda instantánea, filtros multicriterio combinados y operaciones CRUD completas persistidas en `localStorage`.
3. **Dataset y Validación Programática:** 35 productos (5 manuales + 30 asistidos por IA) validados al 100% mediante una función programática en `validacion.js` que audita reglas de negocio, tipos de datos, dominios permitidos y coherencia temporal.
4. **Documentación de Prompt Engineering:** Bitácora detallada con los prompts utilizados, técnicas aplicadas (Priming, Chain of Thought, Zero-Shot, Few-Shot, Meta-Prompting) y auditoría de datos.

---

## 📂 2. Estructura de Archivos del Repositorio

El directorio contiene estrictamente los archivos necesarios para la entrega y evaluación:

```text
ecomarket_2/
├── index.html              # Landing page comercial accesible y responsive
├── dashboard.html          # Panel administrativo (Sidebar, KPIs, Gráfico, Cards, Tabla y CRUD)
├── styles.css              # Hoja de estilos unificada en CSS3 puro (Mobile-first, sin frameworks)
├── app.js                  # Lógica del frontend (Carga, CRUD, Búsqueda, Filtros, KPIs, Chart.js)
├── validacion.js           # Módulo de validación programática del catálogo (Node.js y Navegador)
├── productos.json          # Dataset oficial de 35 productos con reglas de negocio validadas
├── prompt-engineering.md   # Registro formal de prompts, técnicas y reporte de auditoría
└── README.md               # Documentación general, preguntas de reflexión y tabla de cumplimiento
```

---

## 🚀 3. Instrucciones de Ejecución

Debido a que la carga de `productos.json` se realiza mediante la API estándar `fetch()`, el proyecto debe ejecutarse a través de un servidor web local (los navegadores bloquean peticiones fetch sobre el protocolo `file://` por políticas de CORS).

### Opción A: Extensión Live Server (Recomendado en VS Code)
1. Abrir la carpeta `ecomarket_2` en Visual Studio Code.
2. Hacer clic derecho sobre `index.html` o `dashboard.html`.
3. Seleccionar **"Open with Live Server"**.
4. La aplicación se abrirá en `http://127.0.0.1:5500`.

### Opción B: Servidor local con Python
Abrir una terminal en la carpeta `ecomarket_2` y ejecutar:
```bash
python -m http.server 5500
```
Luego abrir en el navegador: [http://localhost:5500](http://localhost:5500).

### Opción C: Auditoría de Datos por Consola (Node.js)
Para verificar la integridad del dataset en cualquier momento:
```bash
node validacion.js
```

---

## 💡 4. Respuestas a las Preguntas de Reflexión

### 1. ¿Qué diferencias encontraste entre utilizar zero-shot, one-shot y few-shot prompting?
* **Zero-shot:** Resulta ideal para tareas donde las reglas técnicas son universales o de alta especificidad semántica (por ejemplo, maquetar un HTML5 estándar o generar reglas CSS puras). Sin embargo, cuando se trata de generar datos con estructuras relacionales o dominios restringidos, tiende a inventar formatos o variar nombres de propiedades.
* **One-shot:** Ayuda a fijar la sintaxis básica, pero aún deja margen de ambigüedad respecto a la variedad semántica y la distribución de valores.
* **Few-shot:** Fue la técnica determinante para la Fase 3 del dataset. Al proporcionarle a la IA cinco objetos completos con ejemplos de precios en COP, nombres colombianos y ciudades permitidas, el modelo asimiló los tipos de datos primitivos (booleanos reales vs strings, números sin signos de puntuación) y respetó la convención de no agregar el campo `estado`.

### 2. ¿Por qué es importante definir la estructura y las reglas del dataset antes de generarlo con IA?
Porque los Modelos de Lenguaje Grande (LLMs) son generadores probabilísticos de texto, no motores deterministas de bases de datos. Si no se delimita previamente un contrato de datos estricto (tipos primitivos, rango de fechas, lista cerrada de ciudades y categorías), la IA tiende a "completar creativamente" atributos inexistentes, introducir formatos de fecha inconsistentes o usar valores de moneda heterogéneos que luego rompen la lógica de cálculo en JavaScript.

### 3. ¿Qué errores detectó la validación programática que no habías identificado manualmente?
La función `validarProductos()` permitió capturar de inmediato tres inconsistencias sutiles que visualmente pasaban desapercibidas en un archivo de más de 300 líneas de JSON:
* Un booleano tipado como cadena de texto (`"true"` en vez de `true`), lo que en JavaScript evalúa como verdadero incluso para `"false"`.
* Una fecha límite posterior al 3 de noviembre de 2026.
* La presencia redundante del campo calculado `"estado"`, el cual contravenía el requerimiento de que el estado debe computarse en tiempo de ejecución a partir de `stock` y `stockMinimo`.

### 4. ¿Qué ventajas ofrece separar los datos, la lógica JavaScript y la presentación HTML/CSS?
* **Mantenibilidad:** Modificar los colores o la disposición de las tarjetas no altera la integridad de los datos ni la lógica de los filtros.
* **Escalabilidad:** Si el día de mañana se reemplaza `localStorage` por una API REST o Supabase, solo cambia la capa de transporte en `app.js`; la vista (`dashboard.html`) y las hojas de estilo (`styles.css`) permanecen intactas.
* **Testabilidad:** Permite ejecutar pruebas unitarias y de validación (como `validacion.js`) de forma aislada en entornos de consola o CI/CD sin depender de la renderización del DOM.

### 5. ¿Qué limitaciones tiene localStorage frente a una base de datos real?
* **Capacidad limitada:** `localStorage` cuenta típicamente con un límite de ~5 MB por dominio, lo que impide almacenar imágenes o catálogos masivos.
* **Naturaleza síncrona y monousuario:** Se ejecuta en el hilo principal del navegador y solo vive en el equipo local del cliente, impidiendo la sincronización multiusuario o la persistencia entre diferentes dispositivos.
* **Falta de transaccionalidad e indexación:** No soporta consultas estructuradas (SQL), transacciones ACID, integridad referencial con claves foráneas ni control de concurrencia.

### 6. ¿Qué cambios realizarías para convertir el prototipo en una aplicación lista para producción?
1. **Backend y Persistencia:** Migrar `localStorage` a una base de datos relacional (PostgreSQL en Supabase o Node/Express) con autenticación basada en JWT para el rol administrador.
2. **Optimización Multimedia:** Servir imágenes mediante CDN con formatos de última generación (`.webp` / `.avif`) y compresión responsive (`srcset`).
3. **Módulo de Carrito y Pasarela de Pagos:** Implementar integración con pasarelas colombianas como Wompi o PayU para transacciones con Nequi, Daviplata y PSE.
4. **Pruebas Automatizadas:** Incorporar tests de integración frontend con Playwright/Cypress y linters de accesibilidad automatizados (Axe Core).

---

## 📊 5. Tabla de Confirmación y Cumplimiento de Requerimientos (100%)

A continuación se detalla la verificación punto por punto contra la rúbrica oficial del taller:

| Fase / Criterio | Requerimiento Oficial del Taller | Archivo de Evidencia | Estado | Detalle de Implementación |
| :--- | :--- | :---: | :---: | :--- |
| **Fase 1: Landing Page** | HTML5 semántico (`header`, `nav`, `main`, `section`, `footer`) y `lang="es"` | `index.html` | ✅ 100% | 8 secciones completas, IDs descriptivos, sin CSS/JS en línea. |
| **Fase 1: Estilos CSS** | Variables en `:root`, Flexbox / CSS Grid, Mobile-First, sin frameworks | `styles.css` | ✅ 100% | Breakpoints en 640px, 768px, 992px y 1200px. Cero floats. Contraste WCAG AA/AAA. |
| **Fase 1: Formulario** | Labels asociados, validación accesible y términos de privacidad | `index.html` | ✅ 100% | Campos con `aria-required`, inputs vinculados con `for` e `id`. |
| **Fase 2: Sidebar** | Menú con $\ge 4$ opciones y diseño responsive | `dashboard.html` | ✅ 100% | 4 secciones clave, versión desktop fija y móvil deslizable. |
| **Fase 2: Menú Hamburguesa** | Control JS, transición 0.3s, alternar ☰ y ×, cierre por clic externo o enlace | `app.js`, `styles.css` | ✅ 100% | Implementado en JavaScript vanilla con `aria-expanded` y `aria-controls`. |
| **Fase 2: Tarjetas KPI** | 3 KPIs: Productos registrados, Inventario bajo y Valor en COP | `dashboard.html`, `app.js` | ✅ 100% | Calculados en tiempo real con datos dinámicos. Formato COP oficial. |
| **Fase 2: Tabla de Productos** | 7 columnas, 5 filas mínimas, badges (verde, amarillo, rojo), filas alternadas | `dashboard.html`, `app.js` | ✅ 100% | Código, Producto, Categoría, Precio, Stock, Productor, Estado, Acciones. |
| **Fase 3: Dataset JSON** | Exactamente 35 registros (5 manuales + 30 IA), esquema estricto | `productos.json` | ✅ 100% | 4 categorías oficiales, 8 ciudades colombianas, fechas 2026, sin campo `estado`. |
| **Fase 4: Validación** | Archivo `validacion.js` con función `validarProductos()` y reporte | `validacion.js` | ✅ 100% | Compatible con Node.js y navegador. Devuelve arreglo de anomalías. 0 errores finales. |
| **Fase 4: Auditoría de Datos** | Tabla de errores detectados y correcciones aplicadas | `prompt-engineering.md` | ✅ 100% | Evidencia de borrador previo y dataset saneado. |
| **Fase 5: Renderizado Cards** | Grid responsive de tarjetas con cálculo dinámico de estado | `dashboard.html`, `app.js` | ✅ 100% | Muestra nombre, productor, precio COP, stock y badges reactivos. |
| **Fase 5: Búsqueda y Filtros** | Búsqueda en vivo + 3 selects combinables + botón limpiar filtros | `dashboard.html`, `app.js` | ✅ 100% | Filtra simultáneamente por texto, categoría, ciudad y estado sin perder registros. |
| **Fase 5: Operaciones CRUD** | Modal para Crear, Editar y Confirmación para Eliminar | `dashboard.html`, `app.js` | ✅ 100% | Formulario validado con modales accesibles y feedback toast. |
| **Fase 5: localStorage** | Carga inicial, persistencia en cada operación y soporte de recarga | `app.js` | ✅ 100% | Sincronización automática de todas las mutaciones. |
| **Bonus: Gráfico Chart.js** | Gráfico de barras por categoría sincronizado en tiempo real | `dashboard.html`, `app.js` | ✅ 100% | Chart.js 4.4 integrado, se actualiza automáticamente con cada CRUD. |
| **Entrega: Bitácora IA** | Registro de prompts, técnicas (Priming, CoT, Few-shot) y reflexiones | `prompt-engineering.md` | ✅ 100% | Bitácora técnica estructurada según la rúbrica oficial. |
