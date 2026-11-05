# Bitácora Oficial de Prompt Engineering — EcoMarket
**Taller Práctico 2: Construcción de una plataforma web para comercio sostenible usando Inteligencia Artificial**  
**Programa:** Desarrollo Web con IA | **Campuslands**  
**Proyecto:** EcoMarket Colombia (MVP Frontend)

---

## 1. Introducción y Metodología de Trabajo

Durante el desarrollo de **EcoMarket**, la inteligencia artificial se utilizó como asistente técnico de co-creación siguiendo un flujo riguroso por etapas: diseño UX/UI $\rightarrow$ maquetación semántica $\rightarrow$ ingeniería de datos $\rightarrow$ validación programática $\rightarrow$ interactividad y persistencia.

Se aplicaron sistemáticamente las técnicas formales de Prompt Engineering:
* **Role Prompting / Priming:** Para orientar la perspectiva del modelo antes de solicitar artefactos.
* **Meta-Prompting:** Para que la IA auditara sus propios vacíos de información o detectara inconsistencias lógicas.
* **Chain of Thought (CoT):** Para desglosar razonamientos complejos de arquitectura visual sin generar código precipitado.
* **Zero-Shot Prompting:** Para la maquetación inicial con especificaciones técnicas detalladas y sin sesgos de ejemplos previos.
* **Few-Shot Prompting:** Para la generación precisa de 30 registros sintéticos congruentes con el esquema de 5 ejemplos manuales.

---

## 2. Registro Cronológico de Prompts por Fases

### FASE 1: Landing Page de EcoMarket

#### Paso 1: Priming Inicial
* **Técnica:** *Role Prompting (Priming)*.
* **Objetivo:** Establecer el contexto de negocio (comercio justo, alimentos orgánicos en Colombia) y definir el estándar de calidad senior frontend antes de generar código.

```text
Actúa como un desarrollador frontend senior especializado en comercio electrónico, marketplaces y diseño UX/UI. Vas a participar en el desarrollo de EcoMarket, una startup colombiana que conecta productores locales de alimentos orgánicos y productos sostenibles con consumidores.

Tu responsabilidad es ayudarme a diseñar y construir una landing page accesible, responsive y visualmente coherente.
Antes de comenzar, confirma que comprendes tu rol y el contexto. Luego pregúntame qué información adicional necesitas para realizar el trabajo de la mejor manera posible.

No generes código todavía.
```

* **Ajuste aplicado:** Se delimitó explícitamente el mercado geográfico (ciudades como Bucaramanga, Floridablanca, Girón, Tunja y Bogotá) y la política de cero frameworks (Vanilla HTML5 y CSS3).

---

#### Paso 2: Propuesta de Diseño UX/UI (Sin Código)
* **Técnica:** *Chain of Thought (Cadena de Pensamiento)*.
* **Objetivo:** Forzar una estructura analítica en 6 puntos sobre jerarquía, accesibilidad, tipografía y paleta cromática.

```text
Actúa como diseñador UX/UI. Analiza el contexto de EcoMarket y presenta una propuesta de diseño para su landing page.

Organiza tu respuesta en estos puntos:
1. ¿Qué secciones debe tener la página y cuál es el objetivo de cada una?
2. ¿Qué jerarquía visual y orden de lectura propones?
3. ¿Qué paleta de colores comunica sostenibilidad, confianza y comercio local?
4. ¿Qué tipografías y tamaños recomiendas?
5. ¿Qué componentes visuales se requieren?
6. ¿Qué recursos de accesibilidad y diseño responsive deben considerarse?

Explica brevemente las decisiones de diseño. No generes código.

Contexto del proyecto:
- Nombre: EcoMarket.
- Propósito: facilitar la compra de productos locales, orgánicos y sostenibles.
- Público objetivo: personas de 20 a 55 años interesadas en alimentación saludable, consumo responsable y apoyo a productores locales.
- Mercado inicial: Colombia.
- Estilo visual: natural, moderno, cercano, confiable y limpio; evitar saturación visual.
- Contenido: productos destacados, categorías, beneficios de comprar local, productores aliados, testimonios y formulario de suscripción.
```

* **Ajuste aplicado:** Se refinó la paleta cromática para asegurar un ratio de contraste superior a 7:1 en fondos de texto (`#19241b` sobre `#f7faf7`), cumpliendo las directrices WCAG AA/AAA.

---

#### Paso 3: Generación de HTML5 y CSS3 Semántico
* **Técnica:** *Zero-Shot Prompting* con especificaciones exhaustivas.
* **Objetivo:** Obtener archivos totalmente desacoplados (`index.html` y `styles.css`) con cero estilos en línea y arquitectura mobile-first.

```text
Genera el archivo index.html completo para la landing page de EcoMarket, siguiendo exactamente la propuesta de diseño aprobada.

Requisitos técnicos:
- HTML5 semántico: header, nav, main, section y footer.
- Idioma español y atributo lang="es".
- Enlaces de navegación a las secciones de la página.
- IDs descriptivos y clases en kebab-case.
- Imágenes de ejemplo con URLs de placeholder que puedan reemplazarse.
- Formulario de suscripción con nombre y correo.
- Botones y enlaces con textos descriptivos.
- Atributos alt en imágenes y etiquetas asociadas a los campos.
- No incluyas CSS ni JavaScript dentro del HTML.
Devuelve únicamente el contenido del archivo index.html.
```

```text
Ahora genera el archivo styles.css para el HTML anterior.

Requisitos:
- Define variables de color, tipografía, espaciados y radios en :root.
- Usa Flexbox y/o CSS Grid; no uses floats.
- Implementa diseño mobile-first y media queries.
- Incluye estados hover y focus visibles.
- Mantén contraste adecuado y tamaños legibles.
- Usa transiciones moderadas, sin efectos excesivos.
- No utilices Bootstrap, Tailwind ni otros frameworks.
Devuelve únicamente el contenido del archivo styles.css.
```

---

### FASE 2: Dashboard Administrativo

#### Paso 1 y 2: Role Prompting para Dashboard, KPIs y Menú Hamburguesa
* **Técnica:** *Role Prompting* + *Functional Specification*.
* **Objetivo:** Definir la estructura del panel de administración con sidebar colapsable, menú hamburguesa accesible en vanilla JS y las 3 métricas de inventario requeridas.

```text
Eres un diseñador UX/UI y desarrollador frontend con experiencia en dashboards administrativos de comercio electrónico. Diseña la estructura visual y funcional de un panel de administración para EcoMarket.

El dashboard debe incluir:
- Sidebar a la izquierda con logotipo, navegación y responsive con menú hamburguesa (alternancia ☰ y ×, cierre por clic externo o selección de enlace, aria-expanded).
- Área principal con KPIs:
  1. Productos registrados (total de productos activos).
  2. Inventario bajo (stock <= stockMinimo).
  3. Valor del inventario (precio * stock en COP).
- Tabla de productos responsive de 7 columnas con badges de estado y botones de acción Editar y Eliminar.
- Todo con JavaScript vanilla y CSS puro coherente con EcoMarket.
```

---

### FASE 3: Dataset de Productos (Few-Shot Prompting)

#### Paso 3: Generación del Dataset Sintético
* **Técnica:** *Few-Shot Prompting*.
* **Objetivo:** Extrapolar 30 registros (IDs 6 al 35) a partir de 5 registros manuales de referencia, respetando el dominio estricto de categorías, ciudades colombianas y rangos de fechas de 2026.

```text
Actúa como especialista en generación de datos de prueba. Genera 30 objetos adicionales para el catálogo de EcoMarket, respetando exactamente la estructura de los cinco ejemplos que te proporcionaré.

Reglas:
1. Los IDs deben ser únicos y consecutivos del 6 al 35.
2. Los nombres deben ser variados y corresponder a productos comercializables.
3. La categoría debe pertenecer exclusivamente a la lista válida: Frutas y verduras, Despensa, Cuidado personal, Hogar sostenible.
4. El precio debe ser un número entero positivo en pesos colombianos.
5. El stock y stockMinimo deben ser enteros mayores o iguales a cero.
6. Las ciudades deben pertenecer a la lista permitida: Bucaramanga, Floridablanca, Girón, Bogotá, Medellín, Cali, Tunja y Cúcuta.
7. Los campos organico y activo deben ser booleanos reales, no textos.
8. Las fechas deben estar entre 2026-01-01 y 2026-11-03.
9. Distribuye los productos entre las categorías y ciudades de forma realista.
10. Si stock es cero, el producto puede estar agotado; no inventes un campo estado, pues se calculará en la aplicación.

Devuelve únicamente un arreglo JSON válido, sin explicaciones ni bloques Markdown.

Ejemplos de estructura (los 5 registros manuales):
[
  { "id": 1, "nombre": "Miel de abejas 500 g", "categoria": "Despensa", "precio": 28000, "stock": 18, "stockMinimo": 5, "productor": "Apiario La Montaña", "ciudad": "Bucaramanga", "organico": true, "fechaRegistro": "2026-10-15", "activo": true },
  { "id": 2, "nombre": "Café orgánico especial 340 g", "categoria": "Despensa", "precio": 32000, "stock": 5, "stockMinimo": 8, "productor": "Café El Roble", "ciudad": "Floridablanca", "organico": true, "fechaRegistro": "2026-09-20", "activo": true },
  { "id": 3, "nombre": "Jabón artesanal de caléndula", "categoria": "Cuidado personal", "precio": 14000, "stock": 24, "stockMinimo": 6, "productor": "Manos de Tierra", "ciudad": "Girón", "organico": true, "fechaRegistro": "2026-08-11", "activo": true },
  { "id": 4, "nombre": "Canasta campesina agroecológica", "categoria": "Frutas y verduras", "precio": 45000, "stock": 0, "stockMinimo": 4, "productor": "Huerta Viva", "ciudad": "Tunja", "organico": true, "fechaRegistro": "2026-10-02", "activo": true },
  { "id": 5, "nombre": "Bolsa reutilizable de algodón crudo", "categoria": "Hogar sostenible", "precio": 12000, "stock": 40, "stockMinimo": 10, "productor": "EcoTextil Santander", "ciudad": "Bogotá", "organico": false, "fechaRegistro": "2026-07-19", "activo": true }
]
```

---

## 3. FASE 4: Auditoría y Meta-Validación de Datos

Para cumplir el requisito de auditoría y evidencia del taller, se ejecutó una meta-validación con IA combinada con la función programática `validarProductos()` de `validacion.js`.

### Tabla de Auditoría y Correcciones Documentadas

| Error Detectado en Borrador Inicial | Registro(s) Afectado(s) | Causa Probable | Corrección Aplicada |
| :--- | :---: | :--- | :--- |
| **Inclusión del campo `"estado"`** | Registros 6, 10, 20 | La IA intentó inferir la columna calculada del frontend y persistirla como string `"Agotado"`. | Se eliminó la propiedad `"estado"` del JSON. El estado ahora se evalúa dinámicamente en tiempo de ejecución (`app.js`) según `stock` vs `stockMinimo`. |
| **Formato de booleano como texto** | Registro 11 (`organico: "true"`) | Alucinación sintáctica menor al tipar cadenas en lugar de literales primitivos. | Se convirtió a tipo primitivo `true` (booleano real). |
| **Fecha fuera del rango de 2026** | Registro 25 (`"2026-11-20"`) | Desfase temporal en el muestreo de fechas respecto a la fecha máxima de corte del proyecto (2026-11-03). | Se normalizó la fecha a `"2026-08-25"` dentro de la ventana de tiempo válida. |
| **Ciudad no autorizada** | Registro 31 (`"Santa Marta"`) | La IA eligió una ciudad costera fuera de la lista cerrada de 8 ciudades oficiales de EcoMarket. | Se reasignó a `"Cúcuta"` manteniendo la coherencia territorial con el productor. |

### Evidencia de Validación Final
Al ejecutar `node validacion.js`, el resultado final arrojó **0 errores**:
```text
=======================================================
   AUDITORÍA DE CALIDAD DE DATOS - ECOMARKET MVP
=======================================================
📦 Registros analizados: 35
✅ RESULTADO: El dataset cumple al 100% con todas las reglas de negocio.
   Cero errores detectados. Listo para producción.
```

---

## 4. Conclusión del Proceso
El uso estructurado de Prompt Engineering permitió acelerar la maquetación y la generación de datos sin sacrificar la rigurosidad técnica ni la consistencia semántica. La clave radicó en no solicitar "toda la aplicación de una sola vez", sino desacoplar responsabilidades y auditar con validaciones programáticas deterministas en JavaScript.
