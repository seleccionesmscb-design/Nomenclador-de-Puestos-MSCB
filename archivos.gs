// ============================================================
//  CONFIGURACIÓN
// ============================================================
const FOLDER_ID      = "1b1JV-Ed3JYpeDjfZesRiGy4Lj2pnXsbj";
const SPREADSHEET_ID = "1en3YVHwGMHRW9uOItAKtH1ezuU4Y4NQvZZ3UFvtvJt8";
const SHEET_NAME     = "Contenido Archivos";
const BATCH_SIZE     = 3;   // archivos por ejecución (bajá a 3 si sigue cortando)
const MAX_MINUTES    = 4;   // corta antes de los 6 min del límite de Apps Script

// ============================================================
//  INICIO — llama esto la primera vez (resetea todo)
// ============================================================
function startExtraction() {
  // Limpiar estado anterior
  const props = PropertiesService.getScriptProperties();
  props.deleteAllProperties();

  // Recolectar todos los IDs de archivos de la carpeta recursivamente
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const allFiles = [];
  collectFileIds(folder, allFiles);

  // Guardar lista completa en propiedades
  props.setProperty("fileIds",   JSON.stringify(allFiles));
  props.setProperty("cursor",    "0");
  props.setProperty("initiated", "true");

  // Preparar la hoja
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet   = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clearContents();
  }
  sheet.appendRow(["Nombre archivo", "Tipo", "Fecha modificación", "URL", "Contenido"]);
  const hr = sheet.getRange(1, 1, 1, 5);
  hr.setFontWeight("bold");
  hr.setBackground("#4A90D9");
  hr.setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);

  Logger.log(`📋 Total archivos encontrados: ${allFiles.length}`);
  Logger.log("▶️ Iniciando primer lote...");

  // Crear trigger para continuar automáticamente
  deleteTriggers_();
  ScriptApp.newTrigger("continueExtraction")
    .timeBased()
    .after(5000) // 5 segundos
    .create();
}

// ============================================================
//  CONTINUAR — se llama automáticamente via trigger
// ============================================================
function continueExtraction() {
  deleteTriggers_();

  const props   = PropertiesService.getScriptProperties();
  const allFiles = JSON.parse(props.getProperty("fileIds") || "[]");
  let cursor    = parseInt(props.getProperty("cursor") || "0");

  if (cursor >= allFiles.length) {
    finalize_();
    return;
  }

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const start = Date.now();
  const limit = MAX_MINUTES * 60 * 1000;

  while (cursor < allFiles.length) {
    // Cortar si se acerca al límite de tiempo
    if (Date.now() - start > limit) {
      Logger.log(`⏱️ Límite de tiempo alcanzado. Guardando cursor en ${cursor}...`);
      break;
    }

    const fileId = allFiles[cursor];
    try {
      const file = DriveApp.getFileById(fileId);
      const row  = extractFileContent(file);
      if (row) sheet.appendRow(row);
      Logger.log(`✅ [${cursor + 1}/${allFiles.length}] ${file.getName()}`);
    } catch (e) {
      Logger.log(`❌ Error en archivo ${fileId}: ${e.message}`);
      sheet.appendRow([fileId, "ERROR", "", "", "[Error: " + e.message + "]"]);
    }

    cursor++;
  }

  // Guardar progreso
  props.setProperty("cursor", cursor.toString());

  if (cursor >= allFiles.length) {
    finalize_();
  } else {
    // Programar siguiente lote
    Logger.log(`🔄 Programando siguiente lote desde ${cursor}...`);
    ScriptApp.newTrigger("continueExtraction")
      .timeBased()
      .after(3000) // 3 segundos de pausa entre lotes
      .create();
  }
}

// ============================================================
//  RECOLECTAR IDs DE ARCHIVOS RECURSIVAMENTE
// ============================================================
function collectFileIds(folder, result) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    result.push(files.next().getId());
  }
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    collectFileIds(subfolders.next(), result);
  }
}

// ============================================================
//  EXTRAER CONTENIDO SEGÚN TIPO
// ============================================================
function extractFileContent(file) {
  const name     = file.getName();
  const mimeType = file.getMimeType();
  const modified = file.getLastUpdated().toLocaleDateString("es-AR");
  const url      = file.getUrl();
  let content    = "";

  try {
    if (mimeType === MimeType.GOOGLE_DOCS) {
      const doc = DocumentApp.openById(file.getId());
      content   = doc.getBody().getText();

    } else if (mimeType === MimeType.GOOGLE_SHEETS) {
      const wb   = SpreadsheetApp.openById(file.getId());
      const rows = [];
      wb.getSheets().forEach(s => {
        const data = s.getDataRange().getValues();
        data.forEach(row => rows.push(row.join(" | ")));
      });
      content = rows.join("\n");

    } else if (mimeType === MimeType.PDF) {
      content = convertViaDriveApi_(file.getId(), "pdf");

    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword" ||
      mimeType === "application/vnd.oasis.opendocument.text" ||
      mimeType === "application/vnd.oasis.opendocument.spreadsheet" ||
      mimeType === "application/vnd.oasis.opendocument.presentation"
    ) {
      content = convertViaDriveApi_(file.getId(), "office");

    } else if (mimeType === MimeType.PLAIN_TEXT || mimeType === "text/csv") {
      content = file.getBlob().getDataAsString("UTF-8");

    } else {
      content = "[Tipo no soportado: " + mimeType + "]";
    }

  } catch (e) {
    content = "[Error al leer: " + e.message + "]";
  }

  if (content.length > 49000) {
    content = content.substring(0, 49000) + "\n... [TRUNCADO]";
  }

  return [name, mimeType, modified, url, content];
}

// ============================================================
//  CONVERSIÓN VIA DRIVE API REST (PDF, Word, ODT, etc.)
// ============================================================
function convertViaDriveApi_(fileId, type) {
  const token = ScriptApp.getOAuthToken();

  const copyResponse = UrlFetchApp.fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/copy`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    payload: JSON.stringify({ mimeType: "application/vnd.google-apps.document", name: "temp_extract" }),
    muteHttpExceptions: true
  });

  if (copyResponse.getResponseCode() !== 200) {
    return "[Error al convertir (" + type + "): " + copyResponse.getContentText() + "]";
  }

  const convertedId = JSON.parse(copyResponse.getContentText()).id;
  let text = "";

  try {
    const exportResponse = UrlFetchApp.fetch(
      `https://www.googleapis.com/drive/v3/files/${convertedId}/export?mimeType=text/plain`, {
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true
    });

    text = exportResponse.getResponseCode() === 200
      ? exportResponse.getContentText("UTF-8")
      : "[Error al exportar: " + exportResponse.getContentText() + "]";
  } finally {
    DriveApp.getFileById(convertedId).setTrashed(true);
  }

  return text;
}

// ============================================================
//  HELPERS
// ============================================================
function deleteTriggers_() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "continueExtraction")
    .forEach(t => ScriptApp.deleteTrigger(t));
}

function finalize_() {
  const props    = PropertiesService.getScriptProperties();
  const allFiles = JSON.parse(props.getProperty("fileIds") || "[]");
  Logger.log(`🎉 ¡Completado! Se procesaron ${allFiles.length} archivos.`);

  // Autoajustar columnas
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  sheet.autoResizeColumns(1, 4);
  sheet.setColumnWidth(5, 600);

  // Limpiar estado
  props.deleteAllProperties();
  deleteTriggers_();
}

// ============================================================
//  CANCELAR (si querés frenar manualmente)
// ============================================================
function cancelExtraction() {
  deleteTriggers_();
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("🛑 Extracción cancelada.");
}

// ============================================================
//  MENÚ
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📂 Drive Extractor")
    .addItem("▶️ Iniciar extracción", "startExtraction")
    .addItem("🛑 Cancelar", "cancelExtraction")
    .addToUi();
}
