// ============================================================
// CONFIGURACIÓN
// ============================================================

var SPREADSHEET_ID_NOMENCLADOR = '16r3ZmX5rI5e6tnYyOz8e5NW6ewe7bn_vFEdyjU9Nx6Q';

var HOJA_BD_NOM     = 'BD_Nomenclador';
var HOJA_25_PUESTOS = '25 Puestos';
var HOJA_NO_JER     = 'BD_Puestos_NoJerarquicos';

// Fila 1 = título, fila 2 = headers, fila 3 = primera fila de datos
var FILA_DATA_INICIO = 3;

// Niveles que NO son de planta (política/estructura) → se excluyen de la lista
var NIVELES_EXCLUIR = ['Secretaría', 'Subsecretaría', 'Juzgado', 'Concejo',
                       'Tribunal', 'Defensoría', 'Instituto', 'Junta', 'Otro'];


// ============================================================
// doGet
// ============================================================

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Nomenclador');
  try {
    var datos = getDatosCombinados();
    template.datosInyectados = JSON.stringify(datos.ok ? datos.datos : []);
  } catch (err) {
    template.datosInyectados = '[]';
  }
  template.appUrl = ScriptApp.getService().getUrl();
  try {
    template.mapaDependenciasInyectado = JSON.stringify(getMapaDependencias());
  } catch (err) {
    template.mapaDependenciasInyectado = '{}';
  }
  var cargoInicial = (e && e.parameter && e.parameter.cargo) ? String(e.parameter.cargo) : '';
  var tipoInicial  = (e && e.parameter && e.parameter.tipo)  ? String(e.parameter.tipo)  : '';
  template.cargoInicial = JSON.stringify(cargoInicial);
  template.tipoInicial  = JSON.stringify(tipoInicial);
  return template.evaluate()
    .setTitle('Nomenclador Municipal — MSCB')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// ============================================================
// getDatosCombinados
// Devuelve la lista unificada de TODOS los cargos:
//   - jerárquicos (BD_Nomenclador): Dirección, Departamento, División, Sección, etc.
//   - no jerárquicos (BD_Puestos_NoJerarquicos): Técnico/a, Operativo/a, etc.
// Cada item tiene tipoRegistro: 'jerarquico' | 'nojerarquico'
// ============================================================

function getDatosCombinados() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);

    // ── 1. Jerárquicos ──
    var hojaJer = ss.getSheetByName(HOJA_BD_NOM);
    if (!hojaJer) return { ok: false, datos: [], mensaje: 'Hoja BD_Nomenclador no encontrada' };

    var valJer = hojaJer.getDataRange().getValues();
    var datosJer = valJer.slice(FILA_DATA_INICIO - 1)
      .filter(function(f) {
        var codigo = String(f[0] || '').trim();
        var nivel  = String(f[1] || '').trim();
        return codigo !== '' && NIVELES_EXCLUIR.indexOf(nivel) === -1;
      })
      .map(function(f) {
        return {
          tipoRegistro:      'jerarquico',
          codigo:            String(f[0]  || '').trim(),
          nivel:             String(f[1]  || '').trim(),
          nombreCargo:       String(f[2]  || '').trim(),
          tipoPuesto:        String(f[3]  || '').trim(),
          codigoPuesto:      String(f[4]  || '').trim(),
          orientacion:       String(f[5]  || '').trim(),
          secretaria:        String(f[6]  || '').trim(),
          misionGenerica:    String(f[7]  || '').trim(),
          misionEspecifica:  String(f[8]  || '').trim(),
          requiereTitulo:    String(f[11] || '').trim(),
          requiereMatricula: String(f[12] || '').trim(),
          normativa:         String(f[13] || '').trim()
        };
      });

    // ── 2. No jerárquicos ──
    var hojaNoJer = ss.getSheetByName(HOJA_NO_JER);
    if (!hojaNoJer) return { ok: false, datos: [], mensaje: 'Hoja BD_Puestos_NoJerarquicos no encontrada' };

    var valNoJer = hojaNoJer.getDataRange().getValues();
    var datosNoJer = valNoJer.slice(FILA_DATA_INICIO - 1)
      .filter(function(f) {
        return String(f[0] || '').trim() !== '' && String(f[1] || '').trim() !== '';
      })
      .map(function(f) {
        var tipo = String(f[2] || '').trim();
        return {
          tipoRegistro:      'nojerarquico',
          codigo:            String(f[0] || '').trim(),
          nivel:             'No jerárquico',
          nombreCargo:       String(f[1] || '').trim(),
          tipoPuesto:        tipo,
          codigoPuesto:      '',
          orientacion:       orientacionDesdeTipo_(tipo),
          secretaria:        String(f[9] || '').trim(), // dependencia directa como referencia
          misionGenerica:    '',   // se carga solo en el detalle
          misionEspecifica:  String(f[10] || '').trim(),
          requiereTitulo:    String(f[3] || '').trim() !== '' ? 'Sí' : 'No',
          requiereMatricula: 'No',
          normativa:         '',
          categoria:         String(f[4] || '').trim(),
          adicional1:        String(f[6] || '').trim(),
          adicional2:        String(f[7] || '').trim()
        };
      });

    return { ok: true, datos: datosJer.concat(datosNoJer) };

  } catch (err) {
    return { ok: false, datos: [], mensaje: err.toString() };
  }
}


// ============================================================
// getDetallePuesto(codigo, tipoRegistro)
// tipoRegistro: 'jerarquico' | 'nojerarquico'
// Busca el cargo y agrega la descripción genérica del puesto.
// ============================================================

function getDetallePuesto(codigo, tipoRegistro) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);

    var filaCargo = null;
    var tipoPuesto = '';
    var detalle = {};

    if (tipoRegistro === 'nojerarquico') {
      // ── No jerárquico: leer BD_Puestos_NoJerarquicos ──
      var hojaNoJer = ss.getSheetByName(HOJA_NO_JER);
      if (!hojaNoJer) return { ok: false, mensaje: 'Hoja BD_Puestos_NoJerarquicos no encontrada' };

      var valNoJer = hojaNoJer.getDataRange().getValues();
      for (var i = FILA_DATA_INICIO - 1; i < valNoJer.length; i++) {
        if (String(valNoJer[i][0]).trim() === String(codigo).trim()) {
          filaCargo = valNoJer[i];
          break;
        }
      }
      if (!filaCargo) return { ok: false, mensaje: 'Cargo no encontrado: ' + codigo };

      tipoPuesto = String(filaCargo[2] || '').trim();
      detalle = {
        tipoRegistro:          'nojerarquico',
        codigo:                String(filaCargo[0] || '').trim(),
        nivel:                 'No jerárquico',
        nombreCargo:           String(filaCargo[1] || '').trim(),
        tipoPuesto:            tipoPuesto,
        codigoPuesto:          '',
        orientacion:           orientacionDesdeTipo_(tipoPuesto),
        secretaria:            '',
        dependencia:           String(filaCargo[9] || '').trim(),
        misionEspecifica:      String(filaCargo[10] || '').trim(),
        requisitosEspecificos: '',
        titulacion:            String(filaCargo[3] || '').trim(),
        requiereTitulo:        String(filaCargo[3] || '').trim() !== '' ? 'Sí' : 'No',
        requiereMatricula:     'No',
        categoria:             String(filaCargo[4] || '').trim(),
        contexto:              String(filaCargo[5] || '').trim(),
        adicional1:              String(filaCargo[6]  || '').trim(),
        adicional2:              String(filaCargo[7]  || '').trim(),
        normativa:               '',
        competenciasPrincipales: String(filaCargo[11] || '').trim(),
        competenciasSecundarias: String(filaCargo[12] || '').trim(),
        resultadosIndicadores:   String(filaCargo[13] || '').trim(),
        responsabilidades:       String(filaCargo[14] || '').trim(),
        puestoGenerico:          null
      };

    } else {
      // ── Jerárquico: leer BD_Nomenclador ──
      var hojaJer = ss.getSheetByName(HOJA_BD_NOM);
      if (!hojaJer) return { ok: false, mensaje: 'Hoja BD_Nomenclador no encontrada' };

      var valJer = hojaJer.getDataRange().getValues();
      for (var j = FILA_DATA_INICIO - 1; j < valJer.length; j++) {
        if (String(valJer[j][0]).trim() === String(codigo).trim()) {
          filaCargo = valJer[j];
          break;
        }
      }
      if (!filaCargo) return { ok: false, mensaje: 'Cargo no encontrado: ' + codigo };

      tipoPuesto = String(filaCargo[3] || '').trim();
      detalle = {
        tipoRegistro:          'jerarquico',
        codigo:                String(filaCargo[0]  || '').trim(),
        nivel:                 String(filaCargo[1]  || '').trim(),
        nombreCargo:           String(filaCargo[2]  || '').trim(),
        tipoPuesto:            tipoPuesto,
        codigoPuesto:          String(filaCargo[4]  || '').trim(),
        orientacion:           String(filaCargo[5]  || '').trim(),
        secretaria:            String(filaCargo[6]  || '').trim(),
        dependencia:           '',
        misionGenerica:        String(filaCargo[7]  || '').trim(),
        misionEspecifica:      String(filaCargo[8]  || '').trim(),
        requisitosEspecificos: String(filaCargo[9]  || '').trim(),
        titulacion:            String(filaCargo[10] || '').trim(),
        requiereTitulo:        String(filaCargo[11] || '').trim(),
        requiereMatricula:     String(filaCargo[12] || '').trim(),
        categoria:             '',
        contexto:              '',
        adicional1:              '',
        adicional2:              '',
        normativa:               String(filaCargo[13] || '').trim(),
        competenciasPrincipales: String(filaCargo[14] || '').trim(),
        competenciasSecundarias: String(filaCargo[15] || '').trim(),
        resultadosIndicadores:   String(filaCargo[16] || '').trim(),
        responsabilidades:       String(filaCargo[17] || '').trim(),
        puestoGenerico:          null
      };
    }

    // ── Buscar descripción genérica del puesto en "25 Puestos" ──
    if (tipoPuesto) {
      var hoja25 = ss.getSheetByName(HOJA_25_PUESTOS);
      if (hoja25) {
        var val25 = hoja25.getDataRange().getValues();
        for (var k = FILA_DATA_INICIO - 1; k < val25.length; k++) {
          if (String(val25[k][2] || '').trim() === tipoPuesto) {
            detalle.puestoGenerico = {
              codigo:     String(val25[k][1] || '').trim(),
              nombre:     String(val25[k][2] || '').trim(),
              nivel:      String(val25[k][3] || '').trim(),
              mision:     String(val25[k][4] || '').trim(),
              funciones:  String(val25[k][5] || '').trim(),
              requisitos: String(val25[k][6] || '').trim()
            };
            break;
          }
        }
      }
    }

    return { ok: true, datos: detalle };

  } catch (err) {
    return { ok: false, mensaje: err.toString() };
  }
}


// ============================================================
// HELPER: orientación desde tipoPuesto (para no jerárquicos)
// ============================================================

function orientacionDesdeTipo_(tipo) {
  if (!tipo) return '';
  var t = tipo.toLowerCase();
  if (t.indexOf('inspecci') !== -1) return 'Inspección';
  if (t.indexOf('operativ') !== -1) return 'Operativa';
  if (t.indexOf('t\u00E9cnic') !== -1 || t.indexOf('tecnic') !== -1) return 'Técnica';
  if (t.indexOf('administrativ') !== -1) return 'Administrativa';
  if (t.indexOf('profesional') !== -1) return 'Técnica';
  return '';
}


// ============================================================
// HELPERS para coincidencia difusa de dependencias
// ============================================================

function normalizar_(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenScore_(a, b) {
  var ta = normalizar_(a).split(' ').filter(function(w){ return w.length > 2; });
  var tb = normalizar_(b).split(' ').filter(function(w){ return w.length > 2; });
  if (ta.length === 0 || tb.length === 0) return 0;
  var match = 0;
  ta.forEach(function(w) { if (tb.indexOf(w) !== -1) match++; });
  return match / Math.max(ta.length, tb.length);
}


// ============================================================
// crearMapaDependencias
// Lee la columna "dependencia directa" de BD_Puestos_NoJerarquicos,
// hace fuzzy-match con los nombres de BD_Nomenclador,
// y crea/sobreescribe la hoja "Mapa_Dependencias" con el resultado.
// Ejecutar manualmente desde el editor de Apps Script.
// ============================================================

function crearMapaDependencias() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);

  // Leer nombres del nomenclador jerárquico
  var hojaJer = ss.getSheetByName(HOJA_BD_NOM);
  var valJer   = hojaJer.getDataRange().getValues().slice(FILA_DATA_INICIO - 1);
  var candidatos = valJer
    .filter(function(f) { return String(f[0] || '').trim() !== ''; })
    .map(function(f) {
      return { codigo: String(f[0]).trim(), nombre: String(f[2]).trim() };
    });

  // Leer dependencias únicas de no jerárquicos (columna 8)
  var hojaNoJer = ss.getSheetByName(HOJA_NO_JER);
  var valNoJer  = hojaNoJer.getDataRange().getValues().slice(FILA_DATA_INICIO - 1);
  var depSet = {};
  valNoJer.forEach(function(f) {
    var dep = String(f[9] || '').trim();
    if (dep) depSet[dep] = true;
  });
  var depList = Object.keys(depSet).sort();

  // Para cada dependencia, buscar el mejor candidato
  var filas = [['dependencia_texto', 'codigo_sugerido', 'nombre_sugerido', 'confianza']];
  depList.forEach(function(dep) {
    var mejorScore = -1;
    var mejor = null;
    candidatos.forEach(function(c) {
      var score = tokenScore_(dep, c.nombre);
      if (score > mejorScore) { mejorScore = score; mejor = c; }
    });
    var conf = mejorScore >= 0.7 ? 'ALTA' : mejorScore >= 0.4 ? 'MEDIA' : 'BAJA';
    filas.push([dep, mejor ? mejor.codigo : '', mejor ? mejor.nombre : '', conf]);
  });

  // Crear o sobreescribir hoja
  var hojaMapa = ss.getSheetByName('Mapa_Dependencias');
  if (!hojaMapa) {
    hojaMapa = ss.insertSheet('Mapa_Dependencias');
  } else {
    hojaMapa.clearContents();
  }
  hojaMapa.getRange(1, 1, filas.length, 4).setValues(filas);

  // Colorear por confianza
  for (var i = 1; i < filas.length; i++) {
    var conf = filas[i][3];
    var color = conf === 'ALTA' ? '#d4edda' : conf === 'MEDIA' ? '#fff3cd' : '#f8d7da';
    hojaMapa.getRange(i + 1, 1, 1, 4).setBackground(color);
  }

  SpreadsheetApp.flush();
  return 'Mapa_Dependencias creado con ' + depList.length + ' filas.';
}


// ============================================================
// getMapaDependencias
// Lee "Mapa_Dependencias" y devuelve un objeto { dep_text: codigo }.
// Solo incluye filas donde codigo_sugerido no está vacío.
// ============================================================

function getMapaDependencias() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);
    var hoja  = ss.getSheetByName('Mapa_Dependencias');
    if (!hoja) return {};
    var vals  = hoja.getDataRange().getValues();
    var mapa  = {};
    for (var i = 1; i < vals.length; i++) {
      var dep    = String(vals[i][0] || '').trim();
      var codigo = String(vals[i][1] || '').trim();
      if (dep && codigo) mapa[dep] = codigo;
    }
    return mapa;
  } catch (e) {
    return {};
  }
}


// ============================================================
// poblarCompetencias
// Escribe las competencias ONEP en BD_Nomenclador y BD_Puestos_NoJerarquicos
// según el tipo de puesto. Solo sobreescribe filas que estén vacías en
// esas columnas (para no pisar datos manuales ya cargados).
// Ejecutar manualmente desde el editor de Apps Script.
// ============================================================

function poblarCompetencias() {
  var COMP = {
    jerarquico: {
      principales: [
        'Liderazgo efectivo',
        'Planificación y gestión de resultados',
        'Resolución de conflictos y negociación',
        'Toma de decisiones',
        'Orientación y compromiso con el servicio público'
      ].join('\n'),
      secundarias: [
        'Desarrollo de las personas',
        'Visión estratégica'
      ].join('\n')
    },
    operativo: {
      principales: [
        'Orientación y compromiso con el servicio público',
        'Integridad y ética institucional',
        'Dominio de la tarea',
        'Trabajo en equipo y colaboración',
        'Organización del trabajo'
      ].join('\n'),
      secundarias: [
        'Comunicación y empatía',
        'Manejo emocional'
      ].join('\n')
    },
    administrativo: {
      principales: [
        'Orientación y compromiso con el servicio público',
        'Dominio de la tarea',
        'Uso de tecnologías de la información y la comunicación',
        'Organización del trabajo',
        'Comunicación y empatía'
      ].join('\n'),
      secundarias: [
        'Integridad y ética institucional',
        'Trabajo en equipo y colaboración'
      ].join('\n')
    },
    tecnico: {
      principales: [
        'Dominio de la tarea',
        'Pensamiento crítico',
        'Uso de tecnologías de la información y la comunicación',
        'Orientación y compromiso con el servicio público',
        'Organización del trabajo'
      ].join('\n'),
      secundarias: [
        'Aprendizaje continuo',
        'Iniciativa y creatividad'
      ].join('\n')
    },
    profesional: {
      principales: [
        'Dominio de la tarea',
        'Pensamiento crítico',
        'Iniciativa y creatividad',
        'Aprendizaje continuo',
        'Orientación y compromiso con el servicio público'
      ].join('\n'),
      secundarias: [
        'Comunicación y empatía',
        'Trabajo en equipo y colaboración'
      ].join('\n')
    }
  };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);
  var updJer = 0, updNoJer = 0;

  // ── Jerárquicos: cols O(15) y P(16) ──
  var hojaJer = ss.getSheetByName(HOJA_BD_NOM);
  var valsJer = hojaJer.getDataRange().getValues();
  for (var i = FILA_DATA_INICIO - 1; i < valsJer.length; i++) {
    var codigo = String(valsJer[i][0] || '').trim();
    var nivel  = String(valsJer[i][1] || '').trim();
    if (!codigo || NIVELES_EXCLUIR.indexOf(nivel) !== -1) continue;
    var yaP = String(valsJer[i][14] || '').trim();
    var yaS = String(valsJer[i][15] || '').trim();
    if (yaP || yaS) continue; // no pisar datos manuales
    hojaJer.getRange(i + 1, 15).setValue(COMP.jerarquico.principales);
    hojaJer.getRange(i + 1, 16).setValue(COMP.jerarquico.secundarias);
    updJer++;
  }

  // ── No jerárquicos: cols L(12) y M(13) ──
  var hojaNoJer = ss.getSheetByName(HOJA_NO_JER);
  var valsNoJer = hojaNoJer.getDataRange().getValues();
  for (var j = FILA_DATA_INICIO - 1; j < valsNoJer.length; j++) {
    var cod2  = String(valsNoJer[j][0] || '').trim();
    var tipo  = String(valsNoJer[j][2] || '').trim().toLowerCase();
    if (!cod2) continue;
    var yaP2 = String(valsNoJer[j][11] || '').trim();
    var yaS2 = String(valsNoJer[j][12] || '').trim();
    if (yaP2 || yaS2) continue;
    var key = tipo.indexOf('operativ') !== -1 ? 'operativo'
            : tipo.indexOf('administrativ') !== -1 ? 'administrativo'
            : tipo.indexOf('profesional') !== -1 ? 'profesional'
            : 'tecnico'; // técnico como fallback
    hojaNoJer.getRange(j + 1, 12).setValue(COMP[key].principales);
    hojaNoJer.getRange(j + 1, 13).setValue(COMP[key].secundarias);
    updNoJer++;
  }

  SpreadsheetApp.flush();
  Logger.log('Jerárquicos actualizados: ' + updJer + ' | No jerárquicos: ' + updNoJer);
  return 'Jerárquicos: ' + updJer + ' | No jerárquicos: ' + updNoJer;
}


// ============================================================
// poblarResultadosIndicadores
// Escribe resultados e indicadores genéricos por nivel/tipo.
// Solo sobreescribe filas vacías en esa columna.
// BD_Nomenclador col Q (17, índice 16)
// BD_Puestos_NoJerarquicos col N (14, índice 13)
// Ejecutar manualmente desde el editor de Apps Script.
// ============================================================

function poblarResultadosIndicadores() {
  var RES = {
    'Dirección': 'RESULTADOS\n1. Área gestionada con cumplimiento de los objetivos estratégicos de la Secretaría.\n2. Procesos internos optimizados y alineados a la normativa vigente.\n3. Equipo de trabajo con desempeño adecuado a los requerimientos del área.\n4. Ciudadanía atendida con calidad y en los tiempos establecidos.\n\nINDICADORES\n1. Porcentaje de objetivos del plan anual cumplidos.\n2. Cantidad de procesos auditados sin observaciones.\n3. Resultado de evaluaciones de desempeño del equipo.\n4. Nivel de satisfacción del servicio / cantidad de reclamos resueltos.',

    'Departamento': 'RESULTADOS\n1. Tareas del área ejecutadas en tiempo y forma conforme a los lineamientos de la Dirección.\n2. Recursos humanos y materiales administrados eficientemente.\n3. Informes y reportes producidos con la periodicidad y calidad requeridas.\n\nINDICADORES\n1. Porcentaje de tareas completadas en el plazo establecido.\n2. Índice de uso de recursos respecto al presupuesto asignado.\n3. Cantidad de informes entregados en tiempo y forma.',

    'División': 'RESULTADOS\n1. Actividades operativas del sector ejecutadas correctamente y en los plazos definidos.\n2. Coordinación efectiva con otras áreas para el logro de los objetivos del Departamento.\n3. Documentación e informes del sector producidos con calidad y en tiempo.\n\nINDICADORES\n1. Porcentaje de actividades completadas en plazo.\n2. Número de coordinaciones interáreas realizadas en el período.\n3. Cantidad de documentos producidos sin observaciones.',

    'Sección': 'RESULTADOS\n1. Tareas diarias del sector ejecutadas sin errores ni interrupciones.\n2. Registros y documentación del sector actualizados y disponibles.\n3. Atención a requerimientos internos o ciudadanos resuelta en los tiempos establecidos.\n\nINDICADORES\n1. Porcentaje de tareas ejecutadas sin observaciones.\n2. Tasa de actualización de registros en el período.\n3. Tiempo promedio de respuesta a requerimientos.',

    'operativo': 'RESULTADOS\n1. Tareas operativas ejecutadas conforme a los procedimientos establecidos.\n2. Espacios, equipos o materiales bajo responsabilidad en condiciones adecuadas.\n3. Servicio brindado con calidad y en los tiempos requeridos.\n\nINDICADORES\n1. Porcentaje de tareas realizadas sin observaciones.\n2. Estado de conservación de los bienes bajo su responsabilidad.\n3. Cantidad de interrupciones o incidentes registrados en el período.',

    'administrativo': 'RESULTADOS\n1. Expedientes y documentación tramitados en tiempo y forma.\n2. Registros y bases de datos actualizados con información precisa.\n3. Atención al público brindada con calidad y cordialidad.\n\nINDICADORES\n1. Porcentaje de expedientes resueltos en el plazo establecido.\n2. Tasa de errores en registros administrativos.\n3. Nivel de satisfacción del ciudadano atendido.',

    'tecnico': 'RESULTADOS\n1. Informes técnicos elaborados con precisión y en los plazos requeridos.\n2. Problemas técnicos resueltos aplicando criterios profesionales.\n3. Conocimientos actualizados conforme a los avances del área.\n\nINDICADORES\n1. Porcentaje de informes aprobados sin correcciones.\n2. Tiempo promedio de resolución de problemas técnicos.\n3. Cantidad de capacitaciones realizadas en el período.',

    'profesional': 'RESULTADOS\n1. Intervenciones profesionales de calidad dentro del marco normativo vigente.\n2. Diagnósticos y soluciones documentados con respaldo técnico y legal adecuado.\n3. Aportes especializados al área con impacto verificable en los resultados institucionales.\n\nINDICADORES\n1. Porcentaje de intervenciones con documentación completa y respaldo normativo.\n2. Cantidad de casos resueltos favorablemente respecto al total atendido.\n3. Nivel de satisfacción de los usuarios de los servicios profesionales.'
  };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);
  var updJer = 0, updNoJer = 0;

  // ── Jerárquicos: col Q (17) ──
  var hojaJer = ss.getSheetByName(HOJA_BD_NOM);
  var valsJer = hojaJer.getDataRange().getValues();
  for (var i = FILA_DATA_INICIO - 1; i < valsJer.length; i++) {
    var codigo = String(valsJer[i][0] || '').trim();
    var nivel  = String(valsJer[i][1] || '').trim();
    if (!codigo || NIVELES_EXCLUIR.indexOf(nivel) !== -1) continue;
    if (String(valsJer[i][16] || '').trim()) continue; // no pisar
    var texto = RES[nivel] || RES['Sección'];
    hojaJer.getRange(i + 1, 17).setValue(texto);
    updJer++;
  }

  // ── No jerárquicos: col N (14) ──
  var hojaNoJer = ss.getSheetByName(HOJA_NO_JER);
  var valsNoJer = hojaNoJer.getDataRange().getValues();
  for (var j = FILA_DATA_INICIO - 1; j < valsNoJer.length; j++) {
    var cod2 = String(valsNoJer[j][0] || '').trim();
    var tipo = String(valsNoJer[j][2] || '').trim().toLowerCase();
    if (!cod2) continue;
    if (String(valsNoJer[j][13] || '').trim()) continue; // no pisar
    var key = tipo.indexOf('operativ') !== -1 ? 'operativo'
            : tipo.indexOf('administrativ') !== -1 ? 'administrativo'
            : tipo.indexOf('profesional') !== -1 ? 'profesional'
            : 'tecnico';
    hojaNoJer.getRange(j + 1, 14).setValue(RES[key]);
    updNoJer++;
  }

  SpreadsheetApp.flush();
  Logger.log('Jerárquicos: ' + updJer + ' | No jerárquicos: ' + updNoJer);
  return 'Jerárquicos: ' + updJer + ' | No jerárquicos: ' + updNoJer;
}


// ============================================================
// crearMapaResultados
// Extrae resultados e indicadores de los 17 archivos con datos
// reales y crea la hoja "Mapa_Resultados" para revisión manual.
// Ejecutar manualmente desde el editor de Apps Script.
// ============================================================

function crearMapaResultados() {
  var datos = [
    ['nombre_cargo_sugerido', 'codigo_sugerido', 'confianza', 'resultados', 'indicadores']
  ];

  // Datos extraídos manualmente de los 17 archivos (ya procesados)
  var especificos = [
    {
      nombre: 'Jefatura de División de Ferias Municipales',
      resultados: '1. Incorporar feriantes cuya situación socioeconómica justifique su participación en ferias, conforme a la normativa vigente.\n2. Asegurar que las ferias municipales funcionen de manera sostenida, ordenada y bajo condiciones seguras.\n3. Contar con padrones de feriantes completos y actualizados con documentación respaldatoria.\n4. Promover el cumplimiento normativo dentro de las ferias.\n5. Asegurar que los espacios feriales estén en condiciones óptimas de uso.',
      indicadores: '1. Porcentaje de feriantes con informe socioeconómico aprobado y actualizado.\n2. Cantidad de jornadas feriales realizadas en condiciones adecuadas.\n3. Porcentaje de padrones actualizados periódicamente.\n4. Número de operativos de fiscalización conjunta realizados.\n5. Número de intervenciones de mantenimiento ejecutadas por feria.'
    },
    {
      nombre: 'Jefatura de Departamento Técnico y Mensuras',
      resultados: '1. Registro, tratamiento y visado de expedientes de mensuras.\n2. Ingreso de mensuras al sistema catastral.\n3. Asistencia técnica a ciudadanos y profesionales en trámites de mensuras.',
      indicadores: '1. Cantidad de expedientes de mensuras procesados en plazo.\n2. Porcentaje de mensuras ingresadas al sistema sin errores.\n3. Número de consultas técnicas resueltas en el período.'
    },
    {
      nombre: 'Analista estadístico',
      resultados: '1. Informes, reportes y tableros de comando pre-establecidos y automatizados.\n2. Simulaciones y proyecciones de datos producidas para la toma de decisiones.\n3. Bases de datos actualizadas y disponibles para el área.',
      indicadores: '1. Porcentaje de informes entregados en plazo.\n2. Cantidad de tableros automatizados operativos.\n3. Tasa de actualización de bases de datos en el período.'
    },
    {
      nombre: 'Analista inspector de proyectos de obras civiles',
      resultados: '1. Proyectos de obras civiles inspeccionados conforme a normativa vigente.\n2. Informes de inspección producidos con precisión y en plazo.\n3. No conformidades detectadas y reportadas oportunamente.',
      indicadores: '1. Cantidad de inspecciones realizadas en el período.\n2. Porcentaje de informes entregados en plazo.\n3. Número de no conformidades detectadas y seguidas hasta su resolución.'
    },
    {
      nombre: 'Analista inspector de proyectos de obras de arquitectura',
      resultados: '1. Obras de arquitectura inspeccionadas conforme a normativa vigente.\n2. Informes técnicos de inspección producidos con precisión y en plazo.\n3. Desvíos detectados y comunicados para su corrección.',
      indicadores: '1. Cantidad de inspecciones de arquitectura realizadas.\n2. Porcentaje de informes aprobados sin correcciones.\n3. Número de desvíos detectados y resueltos.'
    },
    {
      nombre: 'Técnico/a en Viveros',
      resultados: '1. Material vegetal producido en cantidad y calidad adecuadas.\n2. Espacios del vivero mantenidos en condiciones óptimas.\n3. Tareas de plantación y mantenimiento ejecutadas en tiempo y forma.',
      indicadores: '1. Cantidad de plantas producidas en el período.\n2. Porcentaje de plantas en condiciones óptimas al momento del egreso.\n3. Número de intervenciones de mantenimiento del vivero realizadas.'
    },
    {
      nombre: 'Jefatura de División de Coros Municipales',
      resultados: '1. Programación de actividades corales ejecutada conforme al calendario institucional.\n2. Participación artística de calidad en eventos municipales asegurada.\n3. Integrantes del coro con formación continua garantizada.',
      indicadores: '1. Porcentaje de presentaciones realizadas respecto a las programadas.\n2. Evaluación de calidad artística de las actuaciones.\n3. Cantidad de instancias de formación realizadas en el período.'
    },
    {
      nombre: 'Jefatura de Departamento de Establecimientos Deportivos',
      resultados: '1. Establecimientos deportivos municipales operativos y en condiciones adecuadas.\n2. Programación deportiva ejecutada conforme al plan anual.\n3. Ciudadanía con acceso a los servicios deportivos municipales.',
      indicadores: '1. Porcentaje de establecimientos habilitados sin observaciones.\n2. Porcentaje de actividades programadas realizadas.\n3. Cantidad de usuarios activos en el período.'
    }
  ];

  // Crear filas para la hoja de revisión
  especificos.forEach(function(e) {
    datos.push([e.nombre, '', 'PENDIENTE', e.resultados, e.indicadores]);
  });

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);
  var hoja = ss.getSheetByName('Mapa_Resultados');
  if (!hoja) {
    hoja = ss.insertSheet('Mapa_Resultados');
  } else {
    hoja.clearContents();
  }
  hoja.getRange(1, 1, datos.length, 5).setValues(datos);
  hoja.getRange(1, 1, 1, 5).setBackground('#cfe2f3').setFontWeight('bold');

  SpreadsheetApp.flush();
  return 'Mapa_Resultados creado con ' + especificos.length + ' entradas.';
}


// ============================================================
// getLogo — sin cambios
// ============================================================

function getLogo() {
  try {
    var content = HtmlService.createHtmlOutputFromFile('Index').getContent();
    var match = content.match(/data:image\/jpeg;base64,([^"'\s]+)/);
    if (match) return 'data:image/jpeg;base64,' + match[1];
    return '';
  } catch (err) {
    return '';
  }
}
