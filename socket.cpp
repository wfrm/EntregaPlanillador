#include "socket.h"
#include "parser.h"
#include "reloj.h"
#include "servidor.h"
WebSocketsServer webSocket = WebSocketsServer(81);
int selector=1;

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Desconectado!\n", num);
      break;

    case WStype_CONNECTED: {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Conectado desde %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        // Envía un mensaje de bienvenida al cliente
        webSocket.sendTXT(num, "Bienvenido al servidor WebSocket");
        break;
      }

    case WStype_TEXT: {
        Serial.printf(" Mensaje recibido web socket [%s]\n", payload);

        if (strstr((const char*)payload, "puesto") != nullptr) {
          Serial.println("programacion de horarios rapidos");
          selector=1;
        }
        else if (strstr((const char*)payload, "manual") != nullptr) {
          Serial.println("programacion manual");
          selector=2;
        }
        else{
          selector=-1;
        }

        horariosJSON = (const char *)payload; // Guarda el JSON recibido
        if(selector==1)
        escribir(horariosJSON);
        if(selector==2)
        escribirManual(horariosJSON);
        
        //leerConfiguracion();
        //procesarHorarios(getSecondsFromFormattedTime());
        webSocket.sendTXT(num, "Horarios recibidos");  //TODO: ¿ esta linea se puede poner en otro lado?
        break;
      }

    default:
      break;
  }
}

void init_socket() {
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

}
