#ifndef SERVIDOR_H
#define SERVIDOR_H
#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>         // Para redirigir tráfico al Captive Portal
#include <EEPROM.h>  
#include <FS.h>

extern ESP8266WebServer server ;

void serveIndexFile();
void conectar();
void init_servidor();
bool loadFromSpiffs(String path);
void handleWebRequests();
void saludar();
bool leerConfiguracion();
bool jsonconfigRapida();
void GetArchivoJson();
bool jsonDiasPreconfigurados();
#endif

