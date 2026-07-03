// ============================================================
// SCRIPT DE USO ÚNICO — Generar códigos en BD_Puestos_NoJerarquicos
//
// INSTRUCCIONES:
// 1. Abrir la planilla en Google Sheets
// 2. Ir a Extensiones → Apps Script
// 3. Pegar TODO este código en un archivo nuevo
// 4. Hacer clic en "Ejecutar" (elegir la función generarCodigos)
// 5. Aceptar los permisos que pida
// 6. Listo — los códigos quedan escritos en la columna A
// ============================================================

function generarCodigos() {
  var ss = SpreadsheetApp.openById('16r3ZmX5rI5e6tnYyOz8e5NW6ewe7bn_vFEdyjU9Nx6Q');

  // ── Paso 1: leer Hoja 1 y armar un mapa nombre → código de área ──
  var hoja1 = ss.getSheetByName('Hoja 1');
  var filas1 = hoja1.getDataRange().getValues();

  var mapaArea = {};
  for (var i = 1; i < filas1.length; i++) {          // fila 0 = encabezados
    var nombre     = String(filas1[i][0] || '').trim(); // col A: Puesto
    var codigoArea = String(filas1[i][2] || '').trim(); // col C: Código de área
    if (nombre && codigoArea) {
      mapaArea[nombre.toLowerCase()] = codigoArea;
    }
  }

  // ── Paso 2: leer BD_Puestos_NoJerarquicos y escribir códigos ──
  var hojaNJ   = ss.getSheetByName('BD_Puestos_NoJerarquicos');
  var filasNJ  = hojaNJ.getDataRange().getValues();

  // Fila 1 = título, fila 2 = encabezados, fila 3 en adelante = datos
  var INICIO = 2; // índice 0-based → fila 3 de la hoja

  var ok = 0;
  var sinMatch = [];

  for (var i = INICIO; i < filasNJ.length; i++) {
    var nombre = String(filasNJ[i][1] || '').trim(); // col B: Nombre del Cargo
    var tipo   = String(filasNJ[i][2] || '').trim(); // col C: Tipo Puesto

    if (!nombre) continue;

    var codigoArea = mapaArea[nombre.toLowerCase()];

    if (!codigoArea) {
      sinMatch.push(nombre);
      continue;
    }

    var sufijo        = armarSufijo_(tipo, nombre);
    var codigoFinal   = codigoArea + ' ' + sufijo;

    hojaNJ.getRange(i + 1, 1).setValue(codigoFinal); // col A, fila i+1 (1-based)
    ok++;
  }

  // ── Paso 3: mostrar resumen ──
  var msg = '✅ Códigos generados: ' + ok;
  if (sinMatch.length > 0) {
    msg += '\n\n⚠️ Sin coincidencia en Hoja 1 (' + sinMatch.length + ' cargos):\n';
    msg += sinMatch.slice(0, 25).join('\n');
    if (sinMatch.length > 25) msg += '\n... y ' + (sinMatch.length - 25) + ' más';
  }

  SpreadsheetApp.getUi().alert(msg);
}


// ── Función interna: genera el sufijo TYPE-ABREV ─────────────────────────────

function armarSufijo_(tipo, nombre) {
  var TIPOS = {
    'Administrativo/a': 'ADM',
    'Técnico/a':        'TEC',
    'Operativo/a':      'OPE',
    'Profesional':      'PRO'
  };

  var abrevTipo = TIPOS[tipo];
  if (!abrevTipo) {
    // Fallback: derivar del nombre del cargo
    var nl = nombre.toLowerCase();
    if      (nl.indexOf('administrativ') === 0)                              abrevTipo = 'ADM';
    else if (nl.indexOf('técnic') === 0 || nl.indexOf('tecnic') === 0) abrevTipo = 'TEC';
    else if (nl.indexOf('operativ') === 0)                                   abrevTipo = 'OPE';
    else if (nl.indexOf('profesional') === 0)                                abrevTipo = 'PRO';
    else                                                                     abrevTipo = 'NJ';
  }

  var STOP = ['de','del','la','el','los','las','al','en','y','e','a',
              'por','para','con','un','una','su','sus'];

  var abrevCargo = '';
  var palabras   = nombre.split(/\s+/);

  for (var j = 0; j < palabras.length && abrevCargo.length < 5; j++) {
    var p = palabras[j];
    if (!p || STOP.indexOf(p.toLowerCase()) !== -1) continue;

    // Si es un acrónimo (ej: RRHH, TIC) → conservar completo
    var soloLetras = p.replace(/[^a-zA-ZÀ-ɏ]/g, '');
    if (soloLetras.length > 1 && soloLetras === soloLetras.toUpperCase()) {
      abrevCargo += soloLetras;
    } else {
      abrevCargo += p.charAt(0).toUpperCase();
    }
  }

  return abrevTipo + '-' + abrevCargo.substring(0, 5);
}
