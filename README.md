# Nomenclador de Puestos Municipales — MSCB

Sistema web desarrollado en Google Apps Script para visualizar, consultar y gestionar el Nomenclador de Puestos de la Municipalidad de San Carlos de Bariloche. Permite consultar las descripciones de los cargos municipales bajo un modelo de dos niveles: un **puesto genérico** (uno de 25 tipos estandarizados) y un **cargo específico** (el nombre propio del puesto en el área donde trabaja la persona).

## Tipo de proyecto
Aplicación web interna publicada como Google Apps Script Web App, con base de datos en Google Sheets.

## Público objetivo
Uso interno de la Dirección de Recursos Humanos de la MSCB. Permite que cualquier agente municipal consulte la estructura organizativa, las descripciones de puestos y solicite modificaciones a través de un formulario integrado.

## Tecnologías
Google Apps Script · HTML/CSS/JS · Google Sheets como base de datos

## Estructura de archivos
Codigo.gs          → lógica del servidor (funciones GAS)
Nomenclador.html   → interfaz principal del sistema

## Hojas de Google Sheets requeridas
BD_Nomenclador           → 412 unidades jerárquicas con tipoPuesto asignado
25 Puestos               → descripciones genéricas de los 25 puestos
BD_Puestos_NoJerarquicos → 392 cargos no jerárquicos activos

## Cómo desplegar
1. Copiá los archivos en un proyecto de Google Apps Script
2. Actualizá SPREADSHEET_ID_NOMENCLADOR en Codigo.gs con el ID de tu Google Sheet
3. Verificá que los nombres de las hojas coincidan con las constantes HOJA_BD_NOM, HOJA_25_PUESTOS, HOJA_NO_JER
4. Desplegar → Nueva implementación → Aplicación web
