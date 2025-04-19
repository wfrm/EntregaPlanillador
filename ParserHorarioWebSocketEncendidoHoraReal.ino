#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#define LED_PIN 14

//#include <ArduinoJson.h>

#include "reloj.h"
#include "parser.h"
#include "memoriaHorarios.h"
#include "servidor.h"
#include "socket.h"

unsigned long tempo = 0;
unsigned long horaEnSegundos;

char* jsonString = "{\"0\":[[9,12],[15,17]],\"1\":[],\"2\":[[8,10]],\"3\":[],\"4\":[[6,8],[20,22]],\"5\":[],\"6\":[[13,16]]}";
const char* jsonStringSensor = "{\"sensor\":\"temperatura\",\"valor\":23.5}";
// asi debe ser el json
//{
//  "0": [[9, 12], [15, 17]],
//  "1": [],
//  "2": [[8, 10]],
//  "3": [],
//  "4": [[6, 8], [20, 22]],
//  "5": [],
//  "6": [[13, 16]]
//}

// es mas practico comunicar con la hora en el equivalente a segundos
//{
//  "0": [[54660, 55200], [9, 12]],
//  "1": [],
//  "2": [[8, 10]],
//  "3": [],
//  "4": [[6, 8], [20, 22]],
//  "5": [],
//  "6": [[13, 16]]
//}

ESP8266WiFiMulti WiFiMulti;


#define USE_SERIAL Serial






void setup() {
  USE_SERIAL.begin(115200);
  //Serial.setDebugOutput(true);
  USE_SERIAL.setDebugOutput(true);
  USE_SERIAL.println();
  pinMode(16, OUTPUT);
  pinMode(14, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);

  conectar();
//  WiFiMulti.addAP("FamiliaRomero", "Terraza2024"); // Cambia las credenciales a tu red WiFi
//
//  while (WiFiMulti.run() != WL_CONNECTED) {
//    delay(100);
//  }

  USE_SERIAL.println("Conectado a WiFi!");
  init_servidor();
  init_socket();
  // Inicializar el reloj con NTP
  iniciarReloj("south-america.pool.ntp.org", -5 * 3600, 60000); // UTC-5 para Colombia
  init_SPIFFS();
}

void loop() {
  server.handleClient();
  webSocket.loop();
  String hora = obtenerHoraActual();
  horaEnSegundos = getSecondsFromFormattedTime();

  if (!horariosJSON.isEmpty()) {
    delay(1000); // Da tiempo al we bsoket de responder TODO: buscar la forma que responda despues de revizar el json
    USE_SERIAL.printf("hora actual: %s \n", hora);
    int dia = obtenerDia();
    horariosJSON = "";
  }
  else {
    if (millis() - tempo > 1000) {
      //procesarHorarios(horaEnSegundos); // Procesa los horarios y actualiza el LED
      if (selector == 1)
        procesarHorarios4Puestos(horaEnSegundos);
      if (selector == 2)
        procesarManual4Puestos();
        //Serial.printf("selector %d\n",selector);
      tempo = millis();
    }

  }
}
