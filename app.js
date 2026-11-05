/**
 * ============================================================================
 * ECOMARKET - APLICACIÓN PRINCIPAL (PANEL ADMINISTRATIVO & CRUD)
 * Taller Práctico 2 | Campuslands
 * ============================================================================
 * Responsabilidades:
 * - Carga inicial de datos desde localStorage o fallback a productos.json.
 * - Renderizado dinámico de tarjetas y tabla responsive con cálculo de estado.
 * - Búsqueda en tiempo real y filtros simultáneos combinados.
 * - Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar con confirmación).
 * - Persistencia reactiva en localStorage.
 * - Recálculo automático de los 3 KPIs oficiales.
 * - Gráfico estadístico de barras con Chart.js (Bonus 5%).
 * - Menú hamburguesa accesible con JavaScript vanilla.
 */

(function () {
  "use strict";

  // Clave de almacenamiento local
  const STORAGE_KEY = "ecomarket_productos_v2";

  // Estado global de la aplicación
  let productos = [];
  let productoEnEdicionId = null;
  let productoAEliminarId = null;
  let instanciaGraficoCategorias = null;
  let vistaActual = "cards"; // 'cards' o 'tabla'

  // ==========================================================================
  // 1. SELECTORES DEL DOM
  // ==========================================================================
  const DOM = {
    // Menú hamburguesa y Sidebar
    btnMenuHamburguesa: document.getElementById("btn-menu-hamburguesa"),
    iconoHamburguesa: document.getElementById("icono-hamburguesa"),
    sidebar: document.getElementById("sidebar-dashboard"),
    sidebarBackdrop: document.getElementById("sidebar-backdrop"),
    btnCerrarSidebar: document.getElementById("btn-cerrar-sidebar"),
    sidebarLinks: document.querySelectorAll(".sidebar-link"),

    // KPIs
    kpiTotal: document.getElementById("kpi-productos-total"),
    kpiBajo: document.getElementById("kpi-inventario-bajo"),
    kpiValor: document.getElementById("kpi-valor-inventario"),

    // Contenedores de visualización
    gridCards: document.getElementById("grid-productos-dinamico"),
    tbodyTabla: document.getElementById("tbody-productos"),
    contenedorCards: document.getElementById("contenedor-cards-productos"),
    contenedorTabla: document.getElementById("contenedor-tabla-productos"),
    estadoVacio: document.getElementById("estado-vacio"),
    contadorResultados: document.getElementById("contador-resultados"),
    listaProductoresPills: document.getElementById("lista-productores-pills"),

    // Botones de cambio de vista
    btnVistaCards: document.getElementById("btn-vista-cards"),
    btnVistaTabla: document.getElementById("btn-vista-tabla"),

    // Filtros y Búsqueda
    filtroBusqueda: document.getElementById("filtro-busqueda"),
    filtroCategoria: document.getElementById("filtro-categoria"),
    filtroCiudad: document.getElementById("filtro-ciudad"),
    filtroEstado: document.getElementById("filtro-estado"),
    btnLimpiarFiltros: document.getElementById("btn-limpiar-filtros"),
    btnResetVacio: document.getElementById("btn-reset-vacio"),

    // Modal Crear / Editar
    modalProducto: document.getElementById("modal-producto"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalTitulo: document.getElementById("modal-titulo"),
    formProducto: document.getElementById("form-producto"),
    btnAbrirCrear: document.getElementById("btn-abrir-crear"),
    btnCerrarModal: document.getElementById("btn-cerrar-modal"),
    btnCancelarModal: document.getElementById("btn-cancelar-modal"),
    modalErrorAlert: document.getElementById("modal-error-alert"),
    modalErrorText: document.getElementById("modal-error-text"),

    // Campos del formulario modal
    inputId: document.getElementById("producto-id"),
    inputNombre: document.getElementById("producto-nombre"),
    inputCategoria: document.getElementById("producto-categoria"),
    inputCiudad: document.getElementById("producto-ciudad"),
    inputPrecio: document.getElementById("producto-precio"),
    inputStock: document.getElementById("producto-stock"),
    inputStockMinimo: document.getElementById("producto-stock-minimo"),
    inputProductor: document.getElementById("producto-productor"),
    inputFecha: document.getElementById("producto-fecha"),
    inputOrganico: document.getElementById("producto-organico"),
    inputActivo: document.getElementById("producto-activo"),

    // Modal Confirmación Eliminar
    modalEliminar: document.getElementById("modal-confirmar-eliminar"),
    btnCerrarConfirmar: document.getElementById("btn-cerrar-confirmar"),
    btnCancelarEliminar: document.getElementById("btn-cancelar-eliminar"),
    btnConfirmarEliminar: document.getElementById("btn-confirmar-eliminar-accion"),
    previewEliminarNombre: document.getElementById("preview-eliminar-nombre"),

    // Toast
    toast: document.getElementById("toast-notificacion"),
    toastIcon: document.getElementById("toast-icon"),
    toastMessage: document.getElementById("toast-message")
  };

  // ==========================================================================
  // 2. UTILIDADES Y FORMATO
  // ==========================================================================

  /**
   * Da formato de pesos colombianos (COP) a una cifra numérica.
   * @param {number} valor 
   * @returns {string} Ej: "$28.000 COP"
   */
  function formatearMonedaCOP(valor) {
    if (typeof valor !== "number" || isNaN(valor)) return "$0 COP";
    const formateado = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(valor);
    return `${formateado} COP`;
  }

  /**
   * Genera el código estandarizado con prefijo ECO (ej. ECO001, ECO034).
   * @param {number} id 
   * @returns {string}
   */
  function formatearCodigo(id) {
    return `ECO${String(id).padStart(3, "0")}`;
  }

  /**
   * Calcula el estado de stock dinámico según las reglas de negocio oficiales:
   * - Agotado: si stock es igual a 0.
   * - Stock bajo: si stock es mayor que 0 y menor o igual a stockMinimo.
   * - Disponible: si stock es mayor que stockMinimo.
   * @param {Object} prod 
   * @returns {"Disponible" | "Stock bajo" | "Agotado"}
   */
  function calcularEstado(prod) {
    const stock = Number(prod.stock) || 0;
    const stockMin = Number(prod.stockMinimo) || 0;

    if (stock === 0) {
      return "Agotado";
    }
    if (stock <= stockMin) {
      return "Stock bajo";
    }
    return "Disponible";
  }

  /**
   * Devuelve la clase CSS del badge correspondiente al estado.
   * @param {string} estado 
   * @returns {string}
   */
  function obtenerClaseBadge(estado) {
    switch (estado) {
      case "Disponible":
        return "badge-disponible";
      case "Stock bajo":
        return "badge-stock-bajo";
      case "Agotado":
        return "badge-agotado";
      default:
        return "badge-neutral";
    }
  }

  /**
   * Muestra un toast flotante de retroalimentación accesible.
   * @param {string} mensaje 
   * @param {"exito" | "error" | "info"} tipo 
   */
  function mostrarToast(mensaje, tipo = "exito") {
    if (!DOM.toast) return;

    DOM.toastMessage.textContent = mensaje;
    DOM.toastIcon.textContent = tipo === "exito" ? "✅" : (tipo === "error" ? "❌" : "ℹ️");

    DOM.toast.classList.remove("hidden", "toast-exito", "toast-error");
    DOM.toast.classList.add(tipo === "error" ? "toast-error" : "toast-exito");

    // Ocultar automáticamente a los 3.5 segundos
    setTimeout(() => {
      DOM.toast.classList.add("hidden");
    }, 3500);
  }

  // ==========================================================================
  // 3. PERSISTENCIA EN LOCALSTORAGE Y CARGA INICIAL
  // ==========================================================================

  /**
   * Guarda la colección actual en localStorage.
   */
  function guardarProductos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
    } catch (error) {
      console.error("Error al persistir en localStorage:", error);
      mostrarToast("No se pudo guardar la información en el navegador.", "error");
    }
  }

  /**
   * Carga inicial: consulta localStorage; si no existe, carga productos.json.
   */
  async function cargarProductos() {
    try {
      const guardados = localStorage.getItem(STORAGE_KEY);

      if (guardados) {
        productos = JSON.parse(guardados);
        console.log(`📦 Datos cargados desde localStorage: ${productos.length} productos.`);
      } else {
        const respuesta = await fetch("productos.json");
        if (!respuesta.ok) {
          throw new Error(`HTTP error ${respuesta.status} al cargar productos.json`);
        }
        productos = await respuesta.json();
        guardarProductos(); // Almacenar en localStorage para futuras sesiones
        console.log(`📥 Dataset inicial cargado desde productos.json: ${productos.length} productos.`);
      }

      // Sincronizar todos los componentes de la interfaz
      actualizarKPIs();
      actualizarGrafico();
      renderizarProductoresPills();
      filtrarProductos();

    } catch (error) {
      console.error("Fallo en cargarProductos():", error);
      mostrarToast("Error al cargar el catálogo de productos.", "error");
      if (DOM.contadorResultados) {
        DOM.contadorResultados.textContent = "Error de conexión o lectura del archivo JSON.";
      }
    }
  }

  // ==========================================================================
  // 4. RENDERIZADO DINÁMICO (CARDS Y TABLA RESPONSIVE)
  // ==========================================================================

  /**
   * Renderiza la lista de productos tanto en el grid de tarjetas como en la tabla.
   * @param {Array<Object>} lista 
   */
  function renderizarProductos(lista) {
    if (!DOM.gridCards || !DOM.tbodyTabla) return;

    // Actualizar contador
    const total = productos.length;
    DOM.contadorResultados.textContent = `Mostrando ${lista.length} de ${total} productos en catálogo`;

    // Manejo de estado vacío
    if (lista.length === 0) {
      DOM.gridCards.innerHTML = "";
      DOM.tbodyTabla.innerHTML = "";
      DOM.contenedorCards.classList.add("hidden");
      DOM.contenedorTabla.classList.add("hidden");
      DOM.estadoVacio.classList.remove("hidden");
      return;
    }

    DOM.estadoVacio.classList.add("hidden");
    if (vistaActual === "cards") {
      DOM.contenedorCards.classList.remove("hidden");
      DOM.contenedorTabla.classList.add("hidden");
    } else {
      DOM.contenedorCards.classList.add("hidden");
      DOM.contenedorTabla.classList.remove("hidden");
    }

    // 1. Renderizado de Cards (Grid)
    DOM.gridCards.innerHTML = lista.map((prod) => {
      const estado = calcularEstado(prod);
      const claseBadge = obtenerClaseBadge(estado);
      const codigo = formatearCodigo(prod.id);
      const precioFmt = formatearMonedaCOP(prod.precio);

      return `
        <article class="dashboard-product-card" data-id="${prod.id}">
          <header class="card-product-header">
            <div class="card-meta-top">
              <span class="card-code font-mono">${codigo}</span>
              <span class="badge ${claseBadge}">${estado}</span>
            </div>
            <h3 class="card-product-name">${escapeHTML(prod.nombre)}</h3>
            <p class="card-product-category">${escapeHTML(prod.categoria)} • 📍 ${escapeHTML(prod.ciudad)}</p>
          </header>

          <div class="card-product-body">
            <div class="card-info-row">
              <span class="info-label">Productor:</span>
              <strong class="info-value text-producer">${escapeHTML(prod.productor)}</strong>
            </div>

            <div class="card-info-row">
              <span class="info-label">Existencia:</span>
              <span class="info-value">
                <strong>${prod.stock}</strong> unid. 
                <small class="stock-min-hint">(Mín: ${prod.stockMinimo})</small>
              </span>
            </div>

            <div class="card-tags-row">
              ${prod.organico ? '<span class="tag-pill tag-organic">🌱 100% Orgánico</span>' : '<span class="tag-pill tag-convencional">Artesanal</span>'}
              ${prod.activo ? '<span class="tag-pill tag-active">Activo</span>' : '<span class="tag-pill tag-inactive">Inactivo</span>'}
            </div>
          </div>

          <footer class="card-product-footer">
            <div class="card-price-box">
              <span class="price-label">Precio:</span>
              <span class="card-price-value">${precioFmt}</span>
            </div>
            <div class="card-actions-group">
              <button type="button" 
                      class="btn btn-action-edit btn-sm" 
                      data-action="editar" 
                      data-id="${prod.id}"
                      aria-label="Editar ${escapeHTML(prod.nombre)}">
                ✏️ Editar
              </button>
              <button type="button" 
                      class="btn btn-action-delete btn-sm" 
                      data-action="eliminar" 
                      data-id="${prod.id}"
                      aria-label="Eliminar ${escapeHTML(prod.nombre)}">
                🗑️ Borrar
              </button>
            </div>
          </footer>
        </article>
      `;
    }).join("");

    // 2. Renderizado de Tabla Responsive de 7 Columnas
    DOM.tbodyTabla.innerHTML = lista.map((prod) => {
      const estado = calcularEstado(prod);
      const claseBadge = obtenerClaseBadge(estado);
      const codigo = formatearCodigo(prod.id);
      const precioFmt = formatearMonedaCOP(prod.precio);

      return `
        <tr data-id="${prod.id}">
          <td class="font-mono font-bold text-code">${codigo}</td>
          <td>
            <div class="table-product-title">
              <strong>${escapeHTML(prod.nombre)}</strong>
              ${prod.organico ? '<span class="mini-tag-organic" title="100% Orgánico">🌱</span>' : ''}
            </div>
          </td>
          <td><span class="table-category">${escapeHTML(prod.categoria)}</span></td>
          <td class="font-bold text-price">${precioFmt}</td>
          <td>
            <span class="stock-value font-bold">${prod.stock}</span>
            <span class="stock-min text-muted">/ mín ${prod.stockMinimo}</span>
          </td>
          <td>
            <div class="table-producer-info">
              <span>${escapeHTML(prod.productor)}</span>
              <small class="text-muted">📍 ${escapeHTML(prod.ciudad)}</small>
            </div>
          </td>
          <td>
            <span class="badge ${claseBadge}">${estado}</span>
          </td>
          <td class="text-center table-actions-cell">
            <div class="table-actions-inline">
              <button type="button" 
                      class="btn btn-action-edit btn-xs" 
                      data-action="editar" 
                      data-id="${prod.id}"
                      title="Editar producto">
                ✏️
              </button>
              <button type="button" 
                      class="btn btn-action-delete btn-xs" 
                      data-action="eliminar" 
                      data-id="${prod.id}"
                      title="Eliminar producto">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  /**
   * Sanitiza strings para evitar inserción de HTML malicioso en el DOM.
   */
  function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Rellena las píldoras de productores en la sección inferior.
   */
  function renderizarProductoresPills() {
    if (!DOM.listaProductoresPills) return;

    const productoresMap = new Map();
    productos.forEach(p => {
      if (!productoresMap.has(p.productor)) {
        productoresMap.set(p.productor, { ciudad: p.ciudad, count: 0 });
      }
      productoresMap.get(p.productor).count += 1;
    });

    const pillsHTML = Array.from(productoresMap.entries())
      .slice(0, 10) // Mostrar los primeros 10 representativos
      .map(([productor, info]) => `
        <span class="producer-pill">
          <strong>${escapeHTML(productor)}</strong>
          <small>(${escapeHTML(info.ciudad)} • ${info.count} prod.)</small>
        </span>
      `).join("");

    DOM.listaProductoresPills.innerHTML = pillsHTML;
  }

  // ==========================================================================
  // 5. BÚSQUEDA Y FILTROS COMBINADOS (TIEMPO REAL)
  // ==========================================================================

  /**
   * Aplica los filtros combinados simultáneamente sobre el arreglo original de productos.
   */
  function filtrarProductos() {
    const texto = (DOM.filtroBusqueda ? DOM.filtroBusqueda.value : "").trim().toLowerCase();
    const categoria = DOM.filtroCategoria ? DOM.filtroCategoria.value : "";
    const ciudad = DOM.filtroCiudad ? DOM.filtroCiudad.value : "";
    const estado = DOM.filtroEstado ? DOM.filtroEstado.value : "";

    const resultados = productos.filter((prod) => {
      // 1. Filtro de búsqueda en tiempo real por nombre o productor
      if (texto) {
        const coincideNombre = prod.nombre.toLowerCase().includes(texto);
        const coincideProductor = prod.productor.toLowerCase().includes(texto);
        if (!coincideNombre && !coincideProductor) {
          return false;
        }
      }

      // 2. Filtro por categoría
      if (categoria && prod.categoria !== categoria) {
        return false;
      }

      // 3. Filtro por ciudad
      if (ciudad && prod.ciudad !== ciudad) {
        return false;
      }

      // 4. Filtro por estado calculado
      if (estado) {
        const estadoCalculado = calcularEstado(prod);
        if (estadoCalculado !== estado) {
          return false;
        }
      }

      return true;
    });

    renderizarProductos(resultados);
  }

  /**
   * Limpia y resetea todos los controles de filtro.
   */
  function limpiarFiltros() {
    if (DOM.filtroBusqueda) DOM.filtroBusqueda.value = "";
    if (DOM.filtroCategoria) DOM.filtroCategoria.value = "";
    if (DOM.filtroCiudad) DOM.filtroCiudad.value = "";
    if (DOM.filtroEstado) DOM.filtroEstado.value = "";
    filtrarProductos();
  }

  // ==========================================================================
  // 6. RECÁLCULO DE KPIS OFICIALES (FASE 2 / FASE 5)
  // ==========================================================================

  /**
   * Recalcula los 3 KPIs a partir de los datos reales:
   * 1. Productos registrados: cantidad total de productos activos.
   * 2. Inventario bajo: cantidad de productos cuya existencia sea <= stockMinimo.
   * 3. Valor del inventario: suma de (precio * stock) en COP.
   */
  function actualizarKPIs() {
    const totalActivos = productos.filter((p) => p.activo !== false).length;
    const totalBajoStock = productos.filter((p) => Number(p.stock) <= Number(p.stockMinimo)).length;

    const valorTotal = productos.reduce((acumulado, prod) => {
      const precio = Number(prod.precio) || 0;
      const stock = Number(prod.stock) || 0;
      return acumulado + (precio * stock);
    }, 0);

    if (DOM.kpiTotal) DOM.kpiTotal.textContent = totalActivos;
    if (DOM.kpiBajo) DOM.kpiBajo.textContent = totalBajoStock;
    if (DOM.kpiValor) DOM.kpiValor.textContent = formatearMonedaCOP(valorTotal);
  }

  // ==========================================================================
  // 7. GRÁFICO ESTADÍSTICO REACTIVO CON CHART.JS (BONUS 5%)
  // ==========================================================================

  /**
   * Recalcula el conteo por categoría y actualiza o instancia el gráfico de Chart.js.
   */
  function actualizarGrafico() {
    const canvas = document.getElementById("grafico-categorias");
    if (!canvas || typeof Chart === "undefined") return;

    const categoriasOficiales = [
      "Frutas y verduras",
      "Despensa",
      "Cuidado personal",
      "Hogar sostenible"
    ];

    const conteos = categoriasOficiales.map((cat) => {
      return productos.filter((p) => p.categoria === cat).length;
    });

    const coloresFondo = [
      "rgba(45, 106, 79, 0.85)",   // Verde bosque
      "rgba(217, 119, 6, 0.85)",   // Terracota
      "rgba(14, 165, 233, 0.85)",  // Azul botánico
      "rgba(101, 163, 13, 0.85)"   // Verde lima
    ];

    const coloresBorde = [
      "#2d6a4f",
      "#d97706",
      "#0284c7",
      "#4d7c0f"
    ];

    if (instanciaGraficoCategorias) {
      // Actualización reactiva sin destruir el canvas
      instanciaGraficoCategorias.data.datasets[0].data = conteos;
      instanciaGraficoCategorias.update();
    } else {
      const ctx = canvas.getContext("2d");
      instanciaGraficoCategorias = new Chart(ctx, {
        type: "bar",
        data: {
          labels: categoriasOficiales,
          datasets: [
            {
              label: "Productos registrados",
              data: conteos,
              backgroundColor: coloresFondo,
              borderColor: coloresBorde,
              borderWidth: 1.5,
              borderRadius: 6,
              maxBarThickness: 50
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return ` ${context.raw} productos activos`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 2,
                precision: 0
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)"
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  // ==========================================================================
  // 8. OPERACIONES CRUD (CREAR, ACTUALIZAR, ELIMINAR) Y MODALES
  // ==========================================================================

  /**
   * Abre el modal para Crear (sin id) o Editar (con id).
   * @param {number|null} id 
   */
  function abrirModal(id = null) {
    if (!DOM.modalProducto || !DOM.modalBackdrop) return;

    productoEnEdicionId = id;
    ocultarErrorModal();

    if (id !== null) {
      // Modo Edición
      const producto = productos.find((p) => p.id === id);
      if (!producto) {
        mostrarToast("Producto no encontrado", "error");
        return;
      }

      DOM.modalTitulo.textContent = `Editar Producto (${formatearCodigo(producto.id)})`;
      DOM.inputId.value = producto.id;
      DOM.inputNombre.value = producto.nombre;
      DOM.inputCategoria.value = producto.categoria;
      DOM.inputCiudad.value = producto.ciudad;
      DOM.inputPrecio.value = producto.precio;
      DOM.inputStock.value = producto.stock;
      DOM.inputStockMinimo.value = producto.stockMinimo;
      DOM.inputProductor.value = producto.productor;
      DOM.inputFecha.value = producto.fechaRegistro;
      DOM.inputOrganico.checked = Boolean(producto.organico);
      DOM.inputActivo.checked = Boolean(producto.activo);

    } else {
      // Modo Creación
      DOM.modalTitulo.textContent = "Agregar Nuevo Producto al Catálogo";
      DOM.formProducto.reset();
      DOM.inputId.value = "";
      DOM.inputOrganico.checked = true;
      DOM.inputActivo.checked = true;
      // Fecha predeterminada de hoy o fecha válida del taller
      DOM.inputFecha.value = "2026-11-03";
    }

    DOM.modalBackdrop.classList.remove("hidden");
    DOM.modalProducto.classList.remove("hidden");
    DOM.inputNombre.focus();
  }

  /**
   * Cierra el modal de formulario.
   */
  function cerrarModal() {
    if (!DOM.modalProducto || !DOM.modalBackdrop) return;
    DOM.modalBackdrop.classList.add("hidden");
    DOM.modalProducto.classList.add("hidden");
    productoEnEdicionId = null;
    ocultarErrorModal();
  }

  function mostrarErrorModal(mensaje) {
    if (!DOM.modalErrorAlert) return;
    DOM.modalErrorText.textContent = mensaje;
    DOM.modalErrorAlert.classList.remove("hidden");
  }

  function ocultarErrorModal() {
    if (!DOM.modalErrorAlert) return;
    DOM.modalErrorAlert.classList.add("hidden");
  }

  /**
   * Procesa y valida el envío del formulario de producto.
   */
  function procesarFormularioProducto(e) {
    e.preventDefault();

    const nombre = DOM.inputNombre.value.trim();
    const categoria = DOM.inputCategoria.value;
    const ciudad = DOM.inputCiudad.value;
    const precio = parseInt(DOM.inputPrecio.value, 10);
    const stock = parseInt(DOM.inputStock.value, 10);
    const stockMinimo = parseInt(DOM.inputStockMinimo.value, 10);
    const productor = DOM.inputProductor.value.trim();
    const fechaRegistro = DOM.inputFecha.value;
    const organico = DOM.inputOrganico.checked;
    const activo = DOM.inputActivo.checked;

    // Validaciones estrictas de reglas de negocio
    if (nombre.length < 3 || nombre.length > 80) {
      mostrarErrorModal("El nombre debe tener entre 3 y 80 caracteres.");
      DOM.inputNombre.focus();
      return;
    }

    if (!categoria) {
      mostrarErrorModal("Debe seleccionar una categoría válida.");
      DOM.inputCategoria.focus();
      return;
    }

    if (!ciudad) {
      mostrarErrorModal("Debe seleccionar una ciudad permitida.");
      DOM.inputCiudad.focus();
      return;
    }

    if (isNaN(precio) || precio <= 0) {
      mostrarErrorModal("El precio debe ser un número entero positivo mayor a 0.");
      DOM.inputPrecio.focus();
      return;
    }

    if (isNaN(stock) || stock < 0) {
      mostrarErrorModal("El stock debe ser un número entero mayor o igual a 0.");
      DOM.inputStock.focus();
      return;
    }

    if (isNaN(stockMinimo) || stockMinimo < 0) {
      mostrarErrorModal("El stock mínimo debe ser un número entero mayor o igual a 0.");
      DOM.inputStockMinimo.focus();
      return;
    }

    if (productor.length < 3 || productor.length > 80) {
      mostrarErrorModal("El nombre del productor debe tener entre 3 y 80 caracteres.");
      DOM.inputProductor.focus();
      return;
    }

    if (!fechaRegistro) {
      mostrarErrorModal("La fecha de registro es obligatoria.");
      DOM.inputFecha.focus();
      return;
    }

    // Comprobación con función oficial validarProductos si está disponible
    const productoObj = {
      id: productoEnEdicionId !== null ? productoEnEdicionId : 9999,
      nombre,
      categoria,
      precio,
      stock,
      stockMinimo,
      productor,
      ciudad,
      organico,
      fechaRegistro,
      activo
    };

    if (typeof window.validarProductos === "function") {
      const reporte = window.validarProductos([productoObj]);
      // Ignoramos error de ID provisional si estamos creando
      const erroresReales = reporte.filter(err => !(productoEnEdicionId === null && err.campo === "id"));
      if (erroresReales.length > 0) {
        mostrarErrorModal(`Validación fallida: ${erroresReales[0].mensaje}`);
        return;
      }
    }

    if (productoEnEdicionId !== null) {
      // Actualizar registro existente
      const indice = productos.findIndex((p) => p.id === productoEnEdicionId);
      if (indice !== -1) {
        productos[indice] = {
          ...productos[indice],
          nombre,
          categoria,
          ciudad,
          precio,
          stock,
          stockMinimo,
          productor,
          fechaRegistro,
          organico,
          activo
        };
        mostrarToast(`Producto ${formatearCodigo(productoEnEdicionId)} actualizado con éxito.`);
      }
    } else {
      // Crear nuevo registro con ID consecutivo mayor
      const maxId = productos.reduce((max, p) => (p.id > max ? p.id : max), 0);
      const nuevoId = maxId + 1;

      const nuevoProducto = {
        id: nuevoId,
        nombre,
        categoria,
        precio,
        stock,
        stockMinimo,
        productor,
        ciudad,
        organico,
        fechaRegistro,
        activo
      };

      productos.unshift(nuevoProducto);
      mostrarToast(`Nuevo producto creado con código ${formatearCodigo(nuevoId)}.`);
    }

    // Persistir y refrescar la interfaz sin recargar página
    guardarProductos();
    actualizarKPIs();
    actualizarGrafico();
    renderizarProductoresPills();
    filtrarProductos();
    cerrarModal();
  }

  /**
   * Abre el modal de confirmación antes de eliminar.
   * @param {number} id 
   */
  function abrirModalEliminar(id) {
    const prod = productos.find((p) => p.id === id);
    if (!prod || !DOM.modalEliminar || !DOM.modalBackdrop) return;

    productoAEliminarId = id;
    DOM.previewEliminarNombre.innerHTML = `
      <strong>${formatearCodigo(prod.id)} — ${escapeHTML(prod.nombre)}</strong>
      <p class="text-muted">${escapeHTML(prod.categoria)} • ${escapeHTML(prod.productor)}</p>
    `;

    DOM.modalBackdrop.classList.remove("hidden");
    DOM.modalEliminar.classList.remove("hidden");
    DOM.btnConfirmarEliminar.focus();
  }

  /**
   * Cierra el modal de confirmación de eliminación.
   */
  function cerrarModalEliminar() {
    if (!DOM.modalEliminar || !DOM.modalBackdrop) return;
    DOM.modalBackdrop.classList.add("hidden");
    DOM.modalEliminar.classList.add("hidden");
    productoAEliminarId = null;
  }

  /**
   * Confirma y ejecuta la eliminación definitiva del producto seleccionado.
   */
  function ejecutarEliminarProducto() {
    if (productoAEliminarId === null) return;

    const codigo = formatearCodigo(productoAEliminarId);
    productos = productos.filter((p) => p.id !== productoAEliminarId);

    guardarProductos();
    actualizarKPIs();
    actualizarGrafico();
    renderizarProductoresPills();
    filtrarProductos();
    cerrarModalEliminar();

    mostrarToast(`El producto ${codigo} fue eliminado del inventario.`);
  }

  // ==========================================================================
  // 9. MENÚ HAMBURGUESA JAVASCRIPT VANILLA (FASE 2 PASO 4)
  // ==========================================================================

  function alternarSidebar() {
    if (!DOM.sidebar) return;
    const estaAbierto = DOM.sidebar.classList.toggle("sidebar-open");

    if (DOM.btnMenuHamburguesa) {
      DOM.btnMenuHamburguesa.setAttribute("aria-expanded", String(estaAbierto));
    }

    if (DOM.iconoHamburguesa) {
      DOM.iconoHamburguesa.textContent = estaAbierto ? "×" : "☰";
    }

    if (DOM.sidebarBackdrop) {
      if (estaAbierto) {
        DOM.sidebarBackdrop.classList.remove("hidden");
        DOM.sidebarBackdrop.classList.add("visible");
      } else {
        DOM.sidebarBackdrop.classList.remove("visible");
        DOM.sidebarBackdrop.classList.add("hidden");
      }
    }
  }

  function cerrarSidebar() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.remove("sidebar-open");

    if (DOM.btnMenuHamburguesa) {
      DOM.btnMenuHamburguesa.setAttribute("aria-expanded", "false");
    }

    if (DOM.iconoHamburguesa) {
      DOM.iconoHamburguesa.textContent = "☰";
    }

    if (DOM.sidebarBackdrop) {
      DOM.sidebarBackdrop.classList.remove("visible");
      DOM.sidebarBackdrop.classList.add("hidden");
    }
  }

  // ==========================================================================
  // 10. INICIALIZACIÓN Y EVENT LISTENERS
  // ==========================================================================

  function inicializarEventos() {
    // 1. Menú Hamburguesa
    if (DOM.btnMenuHamburguesa) {
      DOM.btnMenuHamburguesa.addEventListener("click", alternarSidebar);
    }
    if (DOM.btnCerrarSidebar) {
      DOM.btnCerrarSidebar.addEventListener("click", cerrarSidebar);
    }
    if (DOM.sidebarBackdrop) {
      DOM.sidebarBackdrop.addEventListener("click", () => {
        cerrarSidebar();
        cerrarModal();
        cerrarModalEliminar();
      });
    }

    // Cerrar sidebar al hacer clic en cualquier opción del menú en pantallas pequeñas
    DOM.sidebarLinks.forEach((link) => {
      link.addEventListener("click", () => {
        DOM.sidebarLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        if (window.innerWidth < 992) {
          cerrarSidebar();
        }
      });
    });

    // 2. Filtros y Búsqueda en tiempo real
    if (DOM.filtroBusqueda) {
      DOM.filtroBusqueda.addEventListener("input", filtrarProductos);
    }
    if (DOM.filtroCategoria) {
      DOM.filtroCategoria.addEventListener("change", filtrarProductos);
    }
    if (DOM.filtroCiudad) {
      DOM.filtroCiudad.addEventListener("change", filtrarProductos);
    }
    if (DOM.filtroEstado) {
      DOM.filtroEstado.addEventListener("change", filtrarProductos);
    }
    if (DOM.btnLimpiarFiltros) {
      DOM.btnLimpiarFiltros.addEventListener("click", limpiarFiltros);
    }
    if (DOM.btnResetVacio) {
      DOM.btnResetVacio.addEventListener("click", limpiarFiltros);
    }

    // 3. Switcher de Vistas (Tarjetas vs Tabla)
    if (DOM.btnVistaCards && DOM.btnVistaTabla) {
      DOM.btnVistaCards.addEventListener("click", () => {
        vistaActual = "cards";
        DOM.btnVistaCards.classList.add("active");
        DOM.btnVistaTabla.classList.remove("active");
        filtrarProductos();
      });

      DOM.btnVistaTabla.addEventListener("click", () => {
        vistaActual = "tabla";
        DOM.btnVistaTabla.classList.add("active");
        DOM.btnVistaCards.classList.remove("active");
        filtrarProductos();
      });
    }

    // 4. Modal Crear / Editar
    if (DOM.btnAbrirCrear) {
      DOM.btnAbrirCrear.addEventListener("click", () => abrirModal(null));
    }
    if (DOM.btnCerrarModal) {
      DOM.btnCerrarModal.addEventListener("click", cerrarModal);
    }
    if (DOM.btnCancelarModal) {
      DOM.btnCancelarModal.addEventListener("click", cerrarModal);
    }
    if (DOM.formProducto) {
      DOM.formProducto.addEventListener("submit", procesarFormularioProducto);
    }

    // 5. Delegación de eventos para botones Editar y Eliminar en Cards y Tabla
    document.addEventListener("click", (e) => {
      const target = e.target.closest("button[data-action]");
      if (!target) return;

      const accion = target.getAttribute("data-action");
      const id = parseInt(target.getAttribute("data-id"), 10);

      if (accion === "editar" && !isNaN(id)) {
        abrirModal(id);
      } else if (accion === "eliminar" && !isNaN(id)) {
        abrirModalEliminar(id);
      }
    });

    // 6. Modal Eliminar
    if (DOM.btnCerrarConfirmar) {
      DOM.btnCerrarConfirmar.addEventListener("click", cerrarModalEliminar);
    }
    if (DOM.btnCancelarEliminar) {
      DOM.btnCancelarEliminar.addEventListener("click", cerrarModalEliminar);
    }
    if (DOM.btnConfirmarEliminar) {
      DOM.btnConfirmarEliminar.addEventListener("click", ejecutarEliminarProducto);
    }

    // 7. Accesibilidad: Cerrar modales con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        cerrarModal();
        cerrarModalEliminar();
        cerrarSidebar();
      }
    });
  }

  // Ejecución al cargar el DOM
  document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos();
    cargarProductos();
  });

})();
