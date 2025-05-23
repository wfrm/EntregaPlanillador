// parser.h
#ifndef PARSER_H
#define PARSER_H
#define LED_PIN 16 // Pin donde está conectado el LED
#include <ArduinoJson.h>
#include "memoriaHorarios.h"

extern String horariosJSON;      // Variable para guardar los horarios recibidos
extern int myPins[];

// Declaración de la función que procesa los horarios
void processSchedule(const char* jsonString);
String convertirAFormatoR(String contenido);
void procesarHorarios(unsigned long horaEnSegundos);
void procesarHorarios4PuestosGrupoRangos(unsigned long horaEnSegundos);
void procesarHorarios4Puestos(unsigned long horaEnSegundos);
void procesarHorarios4Puestos_old(unsigned long horaEnSegundos);
String procesarConfigRapida(String payloadMemoria);
String procesarSolucitudArchivo(String archivo);
void procesarManual4Puestos();

#endif
