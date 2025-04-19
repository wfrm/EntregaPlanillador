#include "memoriaHorarios.h"
String leerArchivoJson(String archivo) {
  String ruta="/"+archivo;
  File file = SPIFFS.open(ruta, "r");
  if (!file) {
    Serial.println("Error al abrir el archivo para lectura");
    return "";  // Retorna un string vacío en caso de error
  }

  // Crear un String para almacenar el contenido leído
  String contenido = "";

  // Leer el archivo y acumular el contenido
  while (file.available()) {
    contenido += (char)file.read();  // Convierte el byte a char y lo agrega al String
  }

  file.close();  // Cerrar el archivo
  //Serial.println("[memoriaHorarios]archivo leido");
  //Serial.println("###################");
  //Serial.println(contenido);
  return contenido;  // Retorna el contenido leído
}


void guardarJson(String jsonConfig,String archivo){


  // Abrir el archivo en modo escritura
  String ruta="/"+archivo;
  Serial.print("[guardarJson]");Serial.println(ruta);
  //File file = SPIFFS.open("/configuracion.json", "w");
  File file = SPIFFS.open(ruta, "w");
  if (!file) {
    Serial.println("Error al abrir el archivo para escritura");
    return;
  }

  // Escribir el JSON en el archivo
  if (file.print(jsonConfig)) {
    Serial.println("Archivo guardado exitosamente");
  } else {
    Serial.println("Error al escribir en el archivo");
  }

  // Cerrar el archivo
  file.close();
}

void escribirManual(String jsonConfig){


  // Abrir el archivo en modo escritura
  File file = SPIFFS.open("/manual.json", "w");
  if (!file) {
    Serial.println("Error al abrir el archivo para escritura");
    return;
  }

  // Escribir el JSON en el archivo
  if (file.print(jsonConfig)) {
    Serial.println("Archivo manual guardado exitosamente");
  } else {
    Serial.println("Error al escribir en el archivo manual");
  }

  // Cerrar el archivo
  file.close();
}

void escribir(String jsonConfig){


  // Abrir el archivo en modo escritura
  File file = SPIFFS.open("/configuracion.json", "w");
  if (!file) {
    Serial.println("Error al abrir el archivo para escritura");
    return;
  }

  // Escribir el JSON en el archivo
  if (file.print(jsonConfig)) {
    Serial.println("Archivo guardado exitosamente");
  } else {
    Serial.println("Error al escribir en el archivo");
  }

  // Cerrar el archivo
  file.close();
}
void init_SPIFFS(){
    // Inicializar SPIFFS
  if (!SPIFFS.begin()) {
    Serial.println("Error al montar el sistema de archivos SPIFFS");
    return;
  }
}

String leerArchivo() {
  File file = SPIFFS.open("/configuracion.json", "r");
  if (!file) {
    Serial.println("Error al abrir el archivo para lectura");
    return "";  // Retorna un string vacío en caso de error
  }

  // Crear un String para almacenar el contenido leído
  String contenido = "";

  // Leer el archivo y acumular el contenido
  while (file.available()) {
    contenido += (char)file.read();  // Convierte el byte a char y lo agrega al String
  }

  file.close();  // Cerrar el archivo
  //Serial.println("[memoriaHorarios]archivo leido");
  return contenido;  // Retorna el contenido leído
}

String leerManual() {
  File file = SPIFFS.open("/manual.json", "r");
  if (!file) {
    Serial.println("Error al abrir el archivo para lectura");
    return "";  // Retorna un string vacío en caso de error
  }

  // Crear un String para almacenar el contenido leído
  String contenido = "";

  // Leer el archivo y acumular el contenido
  while (file.available()) {
    contenido += (char)file.read();  // Convierte el byte a char y lo agrega al String
  }

  file.close();  // Cerrar el archivo
  //Serial.println("[memoriaHorarios]archivo leido");
  return contenido;  // Retorna el contenido leído
}
