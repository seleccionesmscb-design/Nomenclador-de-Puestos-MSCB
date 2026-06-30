# CONTEXTO DEL PROYECTO — Nomenclador MSCB

## ¿Qué es?
Sistema web en Google Apps Script para la Dirección de RRHH de la Municipalidad de San Carlos de Bariloche. Muestra el nomenclador de puestos municipales: permite consultar cargos, ver descripciones y solicitar modificaciones.

## Modelo de datos (concepto clave)
- **Cargo** = el nombre específico del puesto donde trabaja la persona (ej: "División Mesa de Entradas", "Analista de RRHH"). Hay ~800 en total.
- **Puesto** = categoría genérica de los 25 tipos estandarizados (ej: "División Administrativa", "Técnico/a"). Cuando alguien abre un cargo, ve primero la descripción genérica del puesto y después la específica del cargo.

## Los 25 puestos genéricos
**Direcciones (9 ejes):**
Dir. Conservación y Desarrollo Urbano · Dir. Gestión Contable/Legal · Dir. Mantenimiento y Servicios Generales · Dir. Gestión de Procesos · Dir. Desarrollo Cultural y Deportivo · Dir. Desarrollo Económico/Productivo · Dir. Desarrollo Social · Dir. Educación/Seguridad Vial · Dir. Emergencia y Seguridad Pública

**Jerárquicos (12):**
Departamento Técnico/Administrativo/Operativo/Inspección · División Técnica/Administrativa/Operativa/Inspección · Sección Técnica/Administrativa/Operativa/Inspección

**No jerárquicos (4):**
Administrativo/a · Técnico/a · Operativo/a · Profesional

## Estructura del Google Sheet
ID: `16r3ZmX5rI5e6tnYyOz8e5NW6ewe7bn_vFEdyjU9Nx6Q`

| Hoja | Contenido | Filas |
|------|-----------|-------|
| `BD_Nomenclador` | 412 unidades jerárquicas (Dirección, Dpto, Div, Secc) con tipoPuesto asignado | fila 1=título, fila 2=headers, fila 3+=datos |
| `25 Puestos` | Descripciones genéricas de los 25 tipos | misma estructura |
| `BD_Puestos_NoJerarquicos` | 392 cargos activos no jerárquicos | misma estructura |

## Columnas BD_Nomenclador (índices)
0=Código Área · 1=Nivel · 2=Nombre del Cargo · 3=Tipo Puesto (25) · 4=Código Puesto · 5=Orientación · 6=Secretaría · 7=Misión Genérica · 8=Misión Específica · 9=Requisitos Específicos · 10=Titulación · 11=Req.Título · 12=Req.Matrícula · 13=Normativa

## Columnas BD_Puestos_NoJerarquicos (índices)
0=Código · 1=Nombre del Cargo · 2=Tipo Puesto (25) · 3=Titulación Excluyente · 4=Categoría · 5=Contexto · 6=Adicional 1 · 7=Adicional 2 · 8=Dependencia Directa · 9=Descripción/Misión

## Columnas 25 Puestos (índices)
0=N° · 1=Código · 2=Puesto (Genérico) · 3=Nivel · 4=Misión · 5=Funciones · 6=Requisitos

## Archivos del proyecto
- `Codigo.gs` → lógica servidor: `getDatosCombinados()`, `getDetallePuesto(codigo, tipoRegistro)`, `getLogo()`
- `Nomenclador.html` → toda la interfaz (sidebar, lista, filtros, panel de detalle con tabs)

## Funciones clave en Codigo.gs
- `getDatosCombinados()` → lee las 2 hojas y devuelve lista unificada. Cada item tiene `tipoRegistro: 'jerarquico' | 'nojerarquico'`
- `getDetallePuesto(codigo, tipoRegistro)` → busca el cargo en la hoja correspondiente + lookup en "25 Puestos" → devuelve `{ datos: { ...cargo, puestoGenerico: {...} } }`

## Niveles excluidos de la lista (política/no planta)
`['Secretaría', 'Juzgado', 'Concejo', 'Tribunal', 'Defensoría', 'Instituto', 'Junta', 'Otro']`
**Subsecretaría** NO se excluye en `Codigo.gs`: llega al frontend para servir de nivel intermedio en el organigrama (Secretaría → Subsecretaría → Dirección). El frontend la oculta del listado de puestos en `datosFiltrados()`.

## Jerarquía por código (BD_Nomenclador)
Los códigos de área son posicionales: Secretaría `103` → Subsecretaría `10301` (103+01) → Dirección bajo subsec `1030100001` → Departamento `1030100001001`. Una Dirección directa de la Secretaría usa subsec `00` (ej. `1030000001`). El organigrama anida por prefijo de código (`codigoHijo.startsWith(codigoPadre)`).

## URLs del sistema
- Web app nomenclador: `https://script.google.com/macros/s/AKfycbxWnjdPzTp2DReiIySsqe6YCOkNRA1FC2baZSC5fyOShV6JDuKyvLnmALbZi0kgj7jw/exec?page=registro`
- Formulario registro: `https://script.google.com/macros/s/AKfycbxz8LGTVnhcqLKNNGhH598OLnNtEJAe4oSyOBSTv4yoM_UQkXVNqWzK9RZt_tBVdv8c/exec`

## Estado actual
- [x] Lista unificada de ~800 cargos (jerárquicos + no jerárquicos)
- [x] Panel de detalle con misión genérica del puesto + descripción específica del cargo
- [x] Filtros por nivel, orientación y secretaría
- [x] Buscador global
- [x] Exportar CSV

## Pendiente
- [ ] Logo en el sidebar (función `getLogo()` busca en `Index.html` un base64 que no existe)
- [x] Organigrama con subsecretarías como nivel intermedio (Secretaría → Subsecretaría → Dirección)
