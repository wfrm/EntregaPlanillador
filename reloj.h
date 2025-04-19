#ifndef RELOJ_H
#define RELOJ_H
#include <Arduino.h>
#include <NTPClient.h>     // Biblioteca para cliente NTP
#include <WiFiUdp.h>       // Biblioteca para UDP (usada por NTPClient)
//extern WiFiUDP ntpUDP;
//extern NTPClient timeClient;

extern String targetTime; // Variable para almacenar la hora recibida por Serial
//extern const int pinLed = 2;   // GPIO2 (Led o dispositivo conectado)

// Declaración de funciones
void iniciarReloj(const char *ntpServer, int timeZoneOffset, unsigned long updateInterval);
String obtenerHoraActual();
bool isValidTimeFormat(String time);
String getFormattedTimeFromSeconds(unsigned long totalSeconds);
int obtenerDia();

unsigned long getSecondsFromFormattedTime();
#endif
