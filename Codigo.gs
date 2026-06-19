// ============================================================
// CONFIGURACIÓN
// ============================================================

var SPREADSHEET_ID_NOMENCLADOR = '16r3ZmX5rI5e6tnYyOz8e5NW6ewe7bn_vFEdyjU9Nx6Q';

var HOJA_BD_NOM     = 'BD_Nomenclador';
var HOJA_25_PUESTOS = '25 Puestos';
var HOJA_NO_JER     = 'BD_Puestos_NoJerarquicos';
var HOJA_1          = 'Hoja 1';

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

    // ── 3. Agregar áreas correctas a no jerárquicos desde Hoja 1 ──
    var areaMap = getAreaMappings_();

    // Regla especial: "Administrativo/a general" → todas las áreas cuyo nombre
    // contenga "administrativ" (ej: "División Administrativa de ...", "Dept. Administrativo de ...")
    var areasAdminGeneral = datosJer
      .filter(function(j) {
        return (j.nombreCargo || '').toLowerCase().indexOf('administrativ') !== -1;
      })
      .map(function(j) { return { codigo: j.codigo, nombre: j.nombreCargo }; });

    datosNoJer = datosNoJer.map(function(p) {
      var nombre = (p.nombreCargo || '').trim();
      if (/administrativ[ao]\/a general/i.test(nombre)) {
        p.areas = areasAdminGeneral;
      } else {
        p.areas = areaMap[nombre] || [];
      }
      return p;
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
        puestoGenerico:          null,
        areas:                   []
      };

      // Agregar áreas correctas desde Hoja 1
      var areaMapDet = getAreaMappings_();
      var nomCargoDet = detalle.nombreCargo;
      if (/administrativ[ao]\/a general/i.test(nomCargoDet)) {
        var hojaJerDet = ss.getSheetByName(HOJA_BD_NOM);
        if (hojaJerDet) {
          detalle.areas = hojaJerDet.getDataRange().getValues()
            .slice(FILA_DATA_INICIO - 1)
            .filter(function(f) {
              return (String(f[2] || '').toLowerCase()).indexOf('administrativ') !== -1;
            })
            .map(function(f) { return { codigo: String(f[0]||'').trim(), nombre: String(f[2]||'').trim() }; });
        }
      } else {
        detalle.areas = areaMapDet[nomCargoDet] || [];
      }

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
// getAreaMappings_
// Lee "Hoja 1" y devuelve un mapa nombrePuesto → [{codigo, nombre}]
// Solo incluye filas con área asignada real (descarta textos libres).
// ============================================================

function getAreaMappings_() {
  try {
    var ss   = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);
    var hoja = ss.getSheetByName(HOJA_1);
    if (!hoja) return {};
    var vals = hoja.getDataRange().getValues();
    var map  = {};
    var curr = null;
    for (var i = 0; i < vals.length; i++) {
      var r      = vals[i];
      var puesto = String(r[0] || '').trim();
      var codigo = String(r[2] || '').trim();
      var nombre = String(r[3] || '').trim();
      if (puesto && puesto !== 'Puesto') {
        curr = puesto;
        if (!map[curr]) map[curr] = [];
      }
      // Solo agrega si tiene nombre de área real y código razonable (no texto libre)
      if (curr && nombre && codigo && codigo.length <= 40 && !/deberi|este puesto/i.test(codigo)) {
        map[curr].push({ codigo: codigo, nombre: nombre });
      }
    }
    return map;
  } catch (e) { return {}; }
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
