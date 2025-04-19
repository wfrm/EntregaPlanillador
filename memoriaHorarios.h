#ifndef MEMORIAHORARIOS_H
#define MEMORIAHORARIOS_H
#include <Arduino.h>
#include <FS.h> // Librería para SPIFFS
  
void escribir(String jsonConfig);
void escribirManual(String jsonConfig);
void init_SPIFFS();
String leerArchivo();
String leerManual();
void guardarJson(String jsonConfig,String archivo);
String leerArchivoJson(String arcivo);


#endif
