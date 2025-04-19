#include "reloj.h"
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP); // UTC-5 para Colombia

// Función para validar el formato HH:MM:SS
bool isValidTimeFormat(String time) {
  if (time.length() != 8) return false; // Debe tener exactamente 8 caracteres
  if (time[2] != ':' || time[5] != ':') return false; // ':' en las posiciones 2 y 5
  int hour = time.substring(0, 2).toInt();
  int minute = time.substring(3, 5).toInt();
  int second = time.substring(6, 8).toInt();
  if (hour < 0 || hour > 23) return false;   // Validar horas
  if (minute < 0 || minute > 59) return false; // Validar minutos
  if (second < 0 || second > 59) return false; // Validar segundos
  return true;
}
// Inicializa el reloj con los parámetros proporcionados
void iniciarReloj(const char *ntpServer, int timeZoneOffset, unsigned long updateInterval) {
  timeClient.setPoolServerName(ntpServer);
  timeClient.setTimeOffset(timeZoneOffset);
  timeClient.setUpdateInterval(updateInterval);
  timeClient.begin();
}
// Devuelve la hora actual desde el servidor NTP
String obtenerHoraActual() {
  timeClient.update();
  return timeClient.getFormattedTime();
}

int obtenerDia() {
  timeClient.update();
  int hoy = timeClient.getDay();
  //Serila.println("-------------------------");
  //Serial.print("dia "); Serial.println(hoy);
  return hoy;
}

unsigned long getSecondsFromFormattedTime() {
  // Obtiene el tiempo formateado como HH:MM:SS
  String formattedTime = timeClient.getFormattedTime();

  // Divide el tiempo en horas, minutos y segundos
  int hours = formattedTime.substring(0, 2).toInt();
  int minutes = formattedTime.substring(3, 5).toInt();
  int seconds = formattedTime.substring(6, 8).toInt();

  // Calcula el total de segundos
  return seconds + (minutes * 60) + (hours * 3600);
}

String getFormattedTimeFromSeconds(unsigned long totalSeconds) {
  // Calcula las horas, minutos y segundos a partir del total de segundos
  int hours = totalSeconds / 3600;
  int minutes = (totalSeconds % 3600) / 60;
  int seconds = totalSeconds % 60;

  // Crea y devuelve el formato "hh:mm:ss" como String
  char formattedTime[9];  // Formato "hh:mm:ss" tiene 8 caracteres + 1 para '\0'
  sprintf(formattedTime, "%02d:%02d:%02d", hours, minutes, seconds);

  // Devuelve el resultado como un String
  return String(formattedTime);
}
