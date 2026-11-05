/**
 * ============================================================================
 * ECOMARKET - MÓDULO DE VALIDACIÓN PROGRAMÁTICA DE DATASETS
 * Taller Práctico 2 | Campuslands
 * ============================================================================
 * Implementa la función oficial validarProductos(lista) para auditar la
 * integridad técnica y el cumplimiento de las reglas de negocio del catálogo.
 */

// Listas maestras de dominios válidos según las especificaciones del negocio
const CATEGORIAS_VALIDAS = [
  "Frutas y verduras",
  "Despensa",
  "Cuidado personal",
  "Hogar sostenible"
];

const CIUDADES_VALIDAS = [
  "Bucaramanga",
  "Floridablanca",
  "Girón",
  "Bogotá",
  "Medellín",
  "Cali",
  "Tunja",
  "Cúcuta"
];

const FECHA_MINIMA = "2026-01-01";
const FECHA_MAXIMA = "2026-11-03";

/**
 * Valida un arreglo de productos frente a todas las restricciones del MVP.
 * @param {Array<Object>} lista - Colección de productos a verificar.
 * @returns {Array<Object>} Arreglo de anomalías detectadas con id, campo y detalle.
 */
function validarProductos(lista) {
  const errores = [];

  if (!Array.isArray(lista)) {
    errores.push({
      id: "N/A",
      campo: "dataset",
      mensaje: "El dataset no es un arreglo válido."
    });
    return errores;
  }

  const idsVistos = new Set();

  lista.forEach((producto, indice) => {
    const ident = producto && producto.id !== undefined ? producto.id : `Índice [${indice}]`;

    // 1. Verificación de objeto
    if (!producto || typeof producto !== "object") {
      errores.push({
        id: ident,
        campo: "registro",
        mensaje: "El elemento del catálogo no es un objeto válido."
      });
      return;
    }

    // 2. ID: Entero, mayor que cero y único
    if (typeof producto.id !== "number" || !Number.isInteger(producto.id) || producto.id <= 0) {
      errores.push({
        id: ident,
        campo: "id",
        mensaje: `El ID debe ser un número entero mayor que 0. Valor recibido: ${producto.id}`
      });
    } else if (idsVistos.has(producto.id)) {
      errores.push({
        id: producto.id,
        campo: "id",
        mensaje: `ID duplicado detectado: ${producto.id}`
      });
    } else {
      idsVistos.add(producto.id);
    }

    // 3. Nombre: Texto obligatorio de 3 a 80 caracteres
    if (typeof producto.nombre !== "string" || producto.nombre.trim().length < 3 || producto.nombre.trim().length > 80) {
      errores.push({
        id: ident,
        campo: "nombre",
        mensaje: `El nombre debe ser texto de 3 a 80 caracteres. Valor recibido: "${producto.nombre}"`
      });
    }

    // 4. Categoría: Perteneciente a la lista oficial
    if (!CATEGORIAS_VALIDAS.includes(producto.categoria)) {
      errores.push({
        id: ident,
        campo: "categoria",
        mensaje: `Categoría no válida: "${producto.categoria}". Debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`
      });
    }

    // 5. Precio: Numérico entero positivo en pesos colombianos (COP)
    if (typeof producto.precio !== "number" || !Number.isInteger(producto.precio) || producto.precio <= 0) {
      errores.push({
        id: ident,
        campo: "precio",
        mensaje: `El precio debe ser un número entero positivo. Valor recibido: ${producto.precio}`
      });
    }

    // 6. Stock: Entero mayor o igual a 0
    if (typeof producto.stock !== "number" || !Number.isInteger(producto.stock) || producto.stock < 0) {
      errores.push({
        id: ident,
        campo: "stock",
        mensaje: `El stock debe ser un número entero mayor o igual a 0. Valor recibido: ${producto.stock}`
      });
    }

    // 7. Stock Mínimo: Entero mayor o igual a 0
    if (typeof producto.stockMinimo !== "number" || !Number.isInteger(producto.stockMinimo) || producto.stockMinimo < 0) {
      errores.push({
        id: ident,
        campo: "stockMinimo",
        mensaje: `El stock mínimo debe ser un número entero mayor o igual a 0. Valor recibido: ${producto.stockMinimo}`
      });
    }

    // 8. Productor: Texto de 3 a 80 caracteres
    if (typeof producto.productor !== "string" || producto.productor.trim().length < 3 || producto.productor.trim().length > 80) {
      errores.push({
        id: ident,
        campo: "productor",
        mensaje: `El productor debe ser texto de 3 a 80 caracteres. Valor recibido: "${producto.productor}"`
      });
    }

    // 9. Ciudad: Perteneciente a la lista permitida
    if (!CIUDADES_VALIDAS.includes(producto.ciudad)) {
      errores.push({
        id: ident,
        campo: "ciudad",
        mensaje: `Ciudad no autorizada: "${producto.ciudad}". Debe ser una de: ${CIUDADES_VALIDAS.join(", ")}`
      });
    }

    // 10. Orgánico: Booleano real
    if (typeof producto.organico !== "boolean") {
      errores.push({
        id: ident,
        campo: "organico",
        mensaje: `El campo 'organico' debe ser booleano (true/false). Valor recibido: ${producto.organico}`
      });
    }

    // 11. Activo: Booleano real
    if (typeof producto.activo !== "boolean") {
      errores.push({
        id: ident,
        campo: "activo",
        mensaje: `El campo 'activo' debe ser booleano (true/false). Valor recibido: ${producto.activo}`
      });
    }

    // 12. Fecha de Registro: Formato YYYY-MM-DD y rango 2026-01-01 a 2026-11-03
    const formatoFechaValido = /^\d{4}-\d{2}-\d{2}$/.test(producto.fechaRegistro);
    if (!formatoFechaValido) {
      errores.push({
        id: ident,
        campo: "fechaRegistro",
        mensaje: `Formato de fecha inválido. Requiere YYYY-MM-DD. Valor recibido: "${producto.fechaRegistro}"`
      });
    } else {
      const fecha = new Date(producto.fechaRegistro + "T00:00:00Z");
      const fechaMin = new Date(FECHA_MINIMA + "T00:00:00Z");
      const fechaMax = new Date(FECHA_MAXIMA + "T00:00:00Z");

      if (isNaN(fecha.getTime()) || fecha < fechaMin || fecha > fechaMax) {
        errores.push({
          id: ident,
          campo: "fechaRegistro",
          mensaje: `Fecha fuera del rango permitido (${FECHA_MINIMA} al ${FECHA_MAXIMA}). Valor: "${producto.fechaRegistro}"`
        });
      }
    }

    // 13. Regla adicional: NO debe existir campo 'estado' precalculado
    if ("estado" in producto) {
      errores.push({
        id: ident,
        campo: "estado",
        mensaje: "El campo 'estado' no debe persistirse en el JSON; debe calcularse dinámicamente en la interfaz."
      });
    }
  });

  return errores;
}

// Ejecución autónoma en entorno Node.js para auditoría por consola
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validarProductos,
    CATEGORIAS_VALIDAS,
    CIUDADES_VALIDAS,
    FECHA_MINIMA,
    FECHA_MAXIMA
  };

  // Si se ejecuta directamente con `node validacion.js`
  if (require.main === module) {
    const fs = require("fs");
    const path = require("path");

    const jsonPath = path.join(__dirname, "productos.json");
    try {
      const dataRaw = fs.readFileSync(jsonPath, "utf-8");
      const dataset = JSON.parse(dataRaw);
      console.log("\n=======================================================");
      console.log("   AUDITORÍA DE CALIDAD DE DATOS - ECOMARKET MVP");
      console.log("=======================================================");
      console.log(`📦 Registros analizados: ${dataset.length}`);

      const reporte = validarProductos(dataset);

      if (reporte.length === 0) {
        console.log("✅ RESULTADO: El dataset cumple al 100% con todas las reglas de negocio.");
        console.log("   Cero errores detectados. Listo para producción.\n");
      } else {
        console.warn(`⚠️ SE DETECTARON ${reporte.length} ERROR(ES):`);
        console.table(reporte);
      }
    } catch (err) {
      console.error("❌ Error al procesar el archivo productos.json:", err.message);
    }
  }
}

// Exportación en navegador para testing y verificación desde la consola web
if (typeof window !== "undefined") {
  window.validarProductos = validarProductos;
  window.CATEGORIAS_VALIDAS = CATEGORIAS_VALIDAS;
  window.CIUDADES_VALIDAS = CIUDADES_VALIDAS;
}
