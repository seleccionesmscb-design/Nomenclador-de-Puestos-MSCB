// ============================================================
// CONFIGURACIÓN
// ============================================================

var SPREADSHEET_ID_NOMENCLADOR  = '16r3ZmX5rI5e6tnYyOz8e5NW6ewe7bn_vFEdyjU9Nx6Q';
var SPREADSHEET_ID_DESCRIPCIONES = '1en3YVHwGMHRW9uOItAKtH1ezuU4Y4NQvZZ3UFvtvJt8';

var HOJA_BD_NOM     = 'BD_Nomenclador';
var HOJA_25_PUESTOS = '25 Puestos';
var HOJA_NO_JER     = 'BD_Puestos_NoJerarquicos';
var HOJA_BD_PUESTOS = 'BD_Puestos';

// Fila 1 = título, fila 2 = headers, fila 3 = primera fila de datos
var FILA_DATA_INICIO = 3;

// Asignación manual de secretaría para puestos no jerárquicos sin secretaría en la planilla
var SECRETARIA_NOJER = {
  'GG_HT_23':     '106 — Sec. de Hacienda',
  'GG_HCOM_39':   '106 — Sec. de Hacienda',
  'GG_HC_39':     '106 — Sec. de Hacienda',
  'GG_HC_36':     '106 — Sec. de Hacienda',
  'GG_HFyT_32':   '106 — Sec. de Hacienda',
  'GG_A_20':      '106 — Sec. de Hacienda',
  'MC_MC_201':    '106 — Sec. de Hacienda',
  'JG_PCG_04':    '101 — Intendencia',
  'JG_PCG_01':    '101 — Intendencia',
  'JG_PCG_02':    '101 — Intendencia',
  'JG_PCG_03':    '101 — Intendencia',
  'JG_RRHH_16':   '101 — Intendencia',
  'JG_RRHH_05':   '101 — Intendencia',
  'JG_RRHH_01':   '101 — Intendencia',
  'JG_RRHH_02':   '101 — Intendencia',
  'JG_RRHH_03':   '101 — Intendencia',
  'JG_RRHH_17':   '101 — Intendencia',
  'GG_HS_30':     '101 — Intendencia',
  'GG_A_21':      '101 — Intendencia',
  'GG_TFM_46':    '101 — Intendencia',
  'GG_TFM_47':    '101 — Intendencia',
  'JG_MAY_03':    '101 — Intendencia',
  'SP_CHVL_123':  '101 — Intendencia',
  'SP_CH_125':    '101 — Intendencia',
  'SP_CHVP_124':  '101 — Intendencia',
  'SP_SAN_122':   '101 — Intendencia',
  'JG_TyT_23':    '101 — Intendencia',
  'JG_SL_02':     '101 — Intendencia',
  'JG_SL_03':     '101 — Intendencia',
  'JG_SL_04':     '101 — Intendencia',
  'JG_SL_05':     '101 — Intendencia',
  'JG_SL_06':     '101 — Intendencia',
  'JG_SL_07':     '101 — Intendencia',
  'JG_COM_01':    '101 — Intendencia',
  'JG_COM_02':    '101 — Intendencia',
  'JG_COM_03':    '101 — Intendencia',
  'JG_COM_04':    '101 — Intendencia',
  'JG_COM_05':    '101 — Intendencia',
  'JG_DS_01':     '101 — Intendencia',
  'JG_DS_02':     '101 — Intendencia',
  'JG_DS_03':     '101 — Intendencia',
  'TyV_148':      '101 — Intendencia',
  'SP_MANT_103':  '103 — Sec. Coord. Obras y Servicios',
  'SP_MANT_104':  '103 — Sec. Coord. Obras y Servicios',
  'SP_MANT_105':  '103 — Sec. Coord. Obras y Servicios',
  'SP_MANT_106':  '103 — Sec. Coord. Obras y Servicios',
  'SP_MP_122':    '103 — Sec. Coord. Obras y Servicios',
  'SP_PBACH_127': '103 — Sec. Coord. Obras y Servicios',
  'SP_PMG_128':   '103 — Sec. Coord. Obras y Servicios',
  'SP_CEM_118':   '103 — Sec. Coord. Obras y Servicios',
  'SP_PG_127':    '103 — Sec. Coord. Obras y Servicios',
  'DS_CUL_97':    '104 — Sec. de Deportes',
  'DS_CUL_99':    '104 — Sec. de Deportes',
  'DS_CUL_93':    '104 — Sec. de Deportes',
  'DS_CUL_95':    '104 — Sec. de Deportes',
  'DS_CUL_100':   '104 — Sec. de Deportes',
  'DS_Dep_87':    '104 — Sec. de Deportes',
  'DS_Dep_89':    '104 — Sec. de Deportes',
  'DSES_CU_3':    '104 — Sec. de Deportes',
  'DSES_CU_2':    '104 — Sec. de Deportes',
  'JG_DS_09':     '105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n',
  'JG_DS_10':     '105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n',
  'JG_DS_11':     '105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n',
  'JG_DS_17':     '105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n',
  'SP_Mec_107':   '107 — Sec. Obras y Servicios P\xFAblicos',
  'SP_Mec_109':   '107 — Sec. Obras y Servicios P\xFAblicos',
  'SP_PyJ_113':   '107 — Sec. Obras y Servicios P\xFAblicos',
  'SP_PyJ_114':   '107 — Sec. Obras y Servicios P\xFAblicos',
  'SP_PyJ_116':   '107 — Sec. Obras y Servicios P\xFAblicos',
  'OSP_MI_183':   '107 — Sec. Obras y Servicios P\xFAblicos',
  'JG_CRUB_152':  '107 — Sec. Obras y Servicios P\xFAblicos',
  'JG_CRUB_153':  '107 — Sec. Obras y Servicios P\xFAblicos',
  'SP_Reco_117':  '107 — Sec. Obras y Servicios P\xFAblicos',
  'SUB_CAT_139':  '108 — Sec. Planeamiento Territorial',
  'SUB_MA_4':     '108 — Sec. Planeamiento Territorial',
  'SUB_MA_5':     '108 — Sec. Planeamiento Territorial',
  'SUB_MA_6':     '108 — Sec. Planeamiento Territorial',
  'SUB_MA_7':     '108 — Sec. Planeamiento Territorial',
  'SUB_MA_8':     '108 — Sec. Planeamiento Territorial',
  'SUB_MA_13':    '108 — Sec. Planeamiento Territorial',
  'SUB_PLA_130':  '108 — Sec. Planeamiento Territorial',
  'SUB_PLA_131':  '108 — Sec. Planeamiento Territorial',
  'SUB_PLA_132':  '108 — Sec. Planeamiento Territorial',
  'SUB_PLA_133':  '108 — Sec. Planeamiento Territorial',
  'SUB_PLA_134':  '108 — Sec. Planeamiento Territorial',
  'SUB_PLA_136':  '108 — Sec. Planeamiento Territorial',
  'SP_OXC_112':   '108 — Sec. Planeamiento Territorial',
  'DS_INST_28':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DS_INST_17':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DS_INST_18':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DS_INST_19':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DS_INST_23':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DS_INST_20':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DS_SOC_28':    '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_69':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_70':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_71':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_72':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_73':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_75':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_78':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_79':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_80':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'Dsocial_82':   '109 — Sec. Capital Humano y Acci\xF3n Social',
  'DSocial_76':   '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_63':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_64':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_65':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_66':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_68':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_71':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_T_72':      '110 — Sec. Producci\xF3n y Empleo',
  'DE_TR_165':    '110 — Sec. Producci\xF3n y Empleo',
  'JG_OMIDUC_07': '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_OMIDUC_08': '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_OMIDUC_01': '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_VZ_155':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_VZ_156':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_VZ_159':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_VZ_160':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_HAB_01':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_LB_04':     '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_LB_06':     '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_TyT_02':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_TyT_07':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_TyT_12':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_TyT_21':    '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_SC_04':     '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_SC_05':     '111 — Sec. Protecci\xF3n Ciudadana',
  'JG_SC_06':     '111 — Sec. Protecci\xF3n Ciudadana',
  'Educaci\xF3n vial': '111 — Sec. Protecci\xF3n Ciudadana',
  'DE_TUR_49':    '112 — Sec. de Turismo',
  'DE_TUR_156':   '112 — Sec. de Turismo',
  'DE_TUR_157':   '112 — Sec. de Turismo'
};

// Puestos transversales: se replican en todas las secretarías de planta
var SECRETARIAS_PLANTA = [
  '101 — Intendencia',
  '102 — Sec. Legal y T\xE9cnica',
  '103 — Sec. Coord. Obras y Servicios',
  '104 — Sec. de Deportes',
  '105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n',
  '106 — Sec. de Hacienda',
  '107 — Sec. Obras y Servicios P\xFAblicos',
  '108 — Sec. Planeamiento Territorial',
  '109 — Sec. Capital Humano y Acci\xF3n Social',
  '110 — Sec. Producci\xF3n y Empleo',
  '111 — Sec. Protecci\xF3n Ciudadana',
  '112 — Sec. de Turismo'
];
var CODIGOS_TRANSVERSALES = ['GG_A_30', 'GSA_AG_2025'];

// Niveles que NO son de planta (política/estructura) → se excluyen de la lista
var NIVELES_EXCLUIR = ['Secretaría', 'Subsecretaría', 'Juzgado', 'Concejo',
                       'Tribunal', 'Defensoría', 'Instituto', 'Junta', 'Otro'];

// Datos salariales por nivel (fuente: Tabla_nombre_puestoperfiles_categorias)
var SALARIO_POR_NIVEL = {
  'Dirección':         { categoria: '23', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' },
  'Dirección General': { categoria: '23', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' },
  'Dirección Técnica Contable': { categoria: '23', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' },
  'Delegación':        { categoria: '23', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' },
  'Departamento':      { categoria: '21', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' },
  'División':          { categoria: '19', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' },
  'Sección':           { categoria: '16', contexto: 'a.1. Cubierto y calefaccionado (0%)', adicional1: 'ADIC. RESPONSABILIDAD JERARQ', adicional2: '' }
};


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

    // Mapa prefix → secretaría para derivar la secretaría desde el código de dependencia
    var SEC_POR_PREFIJO = {
      '101':'101 — Intendencia',
      '102':'102 — Sec. Legal y T\xE9cnica',
      '103':'103 — Sec. Coord. Obras y Servicios',
      '104':'104 — Sec. de Deportes',
      '105':'105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n',
      '106':'106 — Sec. de Hacienda',
      '107':'107 — Sec. Obras y Servicios P\xFAblicos',
      '108':'108 — Sec. Planeamiento Territorial',
      '109':'109 — Sec. Capital Humano y Acci\xF3n Social',
      '110':'110 — Sec. Producci\xF3n y Empleo',
      '111':'111 — Sec. Protecci\xF3n Ciudadana',
      '112':'112 — Sec. de Turismo'
    };

    var valNoJer = hojaNoJer.getDataRange().getValues();
    var datosNoJer = valNoJer.slice(FILA_DATA_INICIO - 1)
      .filter(function(f) {
        return String(f[0] || '').trim() !== '' && String(f[1] || '').trim() !== '';
      })
      .map(function(f) {
        var tipo       = String(f[2] || '').trim();
        var codigo     = String(f[0] || '').trim();
        var depCode    = String(f[9] || '').trim(); // columna J: código jerárquico de dependencia
        var secFromDep = depCode ? (SEC_POR_PREFIJO[depCode.substring(0, 3)] || '') : '';
        var sec        = String(f[8] || '').trim() || secFromDep || SECRETARIA_NOJER[codigo] || '';
        return {
          tipoRegistro:      'nojerarquico',
          codigo:            codigo,
          nivel:             'No jer\xE1rquico',
          nombreCargo:       String(f[1] || '').trim(),
          tipoPuesto:        tipo,
          codigoPuesto:      '',
          orientacion:       orientacionDesdeTipo_(tipo),
          secretaria:        sec,
          dependencia:       depCode,
          misionGenerica:    '',
          misionEspecifica:  '',
          requiereTitulo:    String(f[3] || '').trim() !== '' ? 'S\xED' : 'No',
          requiereMatricula: 'No',
          normativa:         '',
          categoria:         String(f[4] || '').trim(),
          adicional1:        String(f[6] || '').trim(),
          adicional2:        String(f[7] || '').trim()
        };
      });

    // Los puestos transversales (GG_A_30, GSA_AG_2025) ahora tienen asignación específica
    // en la columna de dependencia (f[9]), por lo que ya no se replican por secretaría.
    var datosNoJerExpandido = [];
    datosNoJer.forEach(function(item) {
      if (CODIGOS_TRANSVERSALES.indexOf(item.codigo) !== -1 && !item.dependencia) {
        // Solo replicar si NO tienen dependencia específica asignada
        SECRETARIAS_PLANTA.forEach(function(sec) {
          var copia = {};
          for (var k in item) copia[k] = item[k];
          copia.secretaria = sec;
          datosNoJerExpandido.push(copia);
        });
      } else {
        datosNoJerExpandido.push(item);
      }
    });

    return { ok: true, datos: datosJer.concat(datosNoJerExpandido) };

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
      var depCodeDet    = String(filaCargo[9] || '').trim(); // col J: código jerárquico de dependencia
      var secFromDepDet = '';
      if (depCodeDet) {
        var SEC_MAP_DET = {
          '101':'101 — Intendencia','102':'102 — Sec. Legal y T\xE9cnica',
          '103':'103 — Sec. Coord. Obras y Servicios','104':'104 — Sec. de Deportes',
          '105':'105 — Sec. Gesti\xF3n Estrat\xE9gica y Modernizaci\xF3n','106':'106 — Sec. de Hacienda',
          '107':'107 — Sec. Obras y Servicios P\xFAblicos','108':'108 — Sec. Planeamiento Territorial',
          '109':'109 — Sec. Capital Humano y Acci\xF3n Social','110':'110 — Sec. Producci\xF3n y Empleo',
          '111':'111 — Sec. Protecci\xF3n Ciudadana','112':'112 — Sec. de Turismo'
        };
        secFromDepDet = SEC_MAP_DET[depCodeDet.substring(0, 3)] || '';
      }
      detalle = {
        tipoRegistro:          'nojerarquico',
        codigo:                String(filaCargo[0] || '').trim(),
        nivel:                 'No jer\xE1rquico',
        nombreCargo:           String(filaCargo[1] || '').trim(),
        tipoPuesto:            tipoPuesto,
        codigoPuesto:          '',
        orientacion:           orientacionDesdeTipo_(tipoPuesto),
        secretaria:            String(filaCargo[8] || '').trim() || secFromDepDet || SECRETARIA_NOJER[String(filaCargo[0] || '').trim()] || '',
        dependencia:           depCodeDet,
        misionEspecifica:      '',
        requisitosEspecificos: '',
        titulacion:            String(filaCargo[3] || '').trim(),
        requiereTitulo:        String(filaCargo[3] || '').trim() !== '' ? 'S\xED' : 'No',
        requiereMatricula:     'No',
        categoria:             String(filaCargo[4] || '').trim(),
        contexto:              String(filaCargo[5] || '').trim(),
        adicional1:              String(filaCargo[6]  || '').trim(),
        adicional2:              String(filaCargo[7]  || '').trim(),
        normativa:               '',
        competenciasPrincipales: String(filaCargo[10] || '').trim(),
        competenciasSecundarias: String(filaCargo[11] || '').trim(),
        resultadosIndicadores:   String(filaCargo[12] || '').trim(),
        responsabilidades:       String(filaCargo[13] || '').trim(),
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
        adicional1:            '',
        adicional2:            '',
        normativa:               String(filaCargo[13] || '').trim(),
        competenciasPrincipales: String(filaCargo[14] || '').trim(),
        competenciasSecundarias: String(filaCargo[15] || '').trim(),
        resultadosIndicadores:   String(filaCargo[16] || '').trim(),
        responsabilidades:       String(filaCargo[17] || '').trim(),
        puestoGenerico:          null
      };

      // Enriquecer con datos salariales desde "base de datos descripciones"
      try {
        var ssDesc = SpreadsheetApp.openById(SPREADSHEET_ID_DESCRIPCIONES);
        var hojaDesc = ssDesc.getSheetByName(HOJA_BD_PUESTOS);
        if (hojaDesc) {
          var valDesc = hojaDesc.getDataRange().getValues();
          var codigoBuscar = String(filaCargo[0]).trim();
          for (var d = 1; d < valDesc.length; d++) {
            if (String(valDesc[d][0] || '').trim() === codigoBuscar) {
              detalle.categoria  = String(valDesc[d][7]  || '').trim();
              detalle.contexto   = String(valDesc[d][8]  || '').trim();
              detalle.adicional1 = String(valDesc[d][9]  || '').trim();
              detalle.adicional2 = String(valDesc[d][10] || '').trim();
              break;
            }
          }
        }
      } catch (errDesc) {
        // Si no se puede leer la hoja de descripciones, continuar sin datos salariales
      }

      // Si no se encontraron datos salariales, aplicar defaults por nivel
      if (!detalle.categoria && SALARIO_POR_NIVEL[detalle.nivel]) {
        var sal = SALARIO_POR_NIVEL[detalle.nivel];
        detalle.categoria  = sal.categoria;
        detalle.contexto   = sal.contexto;
        detalle.adicional1 = sal.adicional1;
        detalle.adicional2 = sal.adicional2;
      }
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
// DEBUG: columnas raw de un puesto no jerárquico
// ============================================================

function debugNoJerColumnas(codigo) {
  try {
    var ss     = SpreadsheetApp.openById(SPREADSHEET_ID_NOMENCLADOR);
    var hoja   = ss.getSheetByName(HOJA_NO_JER);
    if (!hoja) return { ok: false, msg: 'Hoja no encontrada' };
    var vals   = hoja.getDataRange().getValues();
    // fila 0 = titulo, fila 1 = headers, fila 2+ = datos
    var headers = vals[1] || [];
    for (var i = FILA_DATA_INICIO - 1; i < vals.length; i++) {
      if (String(vals[i][0] || '').trim() === codigo) {
        var row = vals[i];
        var resultado = { headers: {}, valores: {} };
        for (var c = 0; c < row.length; c++) {
          var h = headers[c] ? String(headers[c]).trim() : '(sin header)';
          resultado.headers['f[' + c + ']'] = h;
          resultado.valores['f[' + c + ']'] = String(row[c] || '');
        }
        return { ok: true, fila: i + 1, resultado: resultado };
      }
    }
    return { ok: false, msg: 'Codigo no encontrado: ' + codigo };
  } catch (e) {
    return { ok: false, msg: e.toString() };
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
