// tiempo maximo de insitencia
// no recibe contraseña
// despues de dar conectar como clave fue necesario dar reset fisico

#include "servidor.h"
#include "parser.h"

#define EEPROM_SIZE 512        // Tamaño de la EEPROM
#define WIFI_STATUS_ADDR 0     // Dirección en la EEPROM para guardar el estado WiFi

const char *ssid = "IpMatche"; // Nombre del punto de acceso
const char *password = "12345678";  // Contraseña del punto de acceso

IPAddress apIP(192, 168, 4, 1); // Dirección IP del punto de acceso

// Configuración de IP estática
IPAddress local_IP(192, 168, 1, 111); // Dirección IP fija
IPAddress gateway(192, 168, 1, 1);    // Puerta de enlace
IPAddress subnet(255, 255, 255, 0);   // Máscara de subred
IPAddress dns(8, 8, 8, 8);            // Servidor DNS


ESP8266WebServer server(80);
DNSServer dnsServer;

void handleRoot() {
  // Obtener la IP del cliente que está haciendo la solicitud
  IPAddress clientIP = server.client().remoteIP();
  
  // Comprobar si el cliente está accediendo a través del AP (192.168.4.x)
  bool isAccessingViaAP = (clientIP[0] == 192 && clientIP[1] == 168 && clientIP[2] == 4);
  
  if (isAccessingViaAP) {
    // Si accede a través del AP, mostrar página con información de conexión
    String html = "<html><head>";
    html += "<html lang='es'>";
    html += "<meta name='viewport' content='width=device-width, initial-scale=1.0' charset='UTF-8'>";
    html += "<title>ESP8266 - Información de Red</title>";
    html += "<style>";
    html += "body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }";
    html += ".info-box { background-color: #f0f0f0; border-radius: 10px; padding: 20px; margin: 20px auto; max-width: 600px; }";
    html += "h1 { color: #0066cc; }";
    html += "table { width: 100%; border-collapse: collapse; margin: 20px 0; }";
    html += "th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }";
    html += "th { background-color: #0066cc; color: white; }";
    html += ".btn { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }";
    html += "</style>";
    html += "</head><body>";
    html += "<div class='info-box'>";
    html += "<h1>Información de Conexión ESP8266</h1>";
    html += "<table>";
    html += "<tr><th>Parámetro</th><th>Valor</th></tr>";
    
    // Información del AP
    html += "<tr><td>Modo AP SSID</td><td>" + String(ssid) + "</td></tr>";
    html += "<tr><td>IP del AP</td><td>" + WiFi.softAPIP().toString() + "</td></tr>";
    
    // Información del modo estación (si está conectado)
    if (WiFi.status() == WL_CONNECTED) {
      html += "<tr><td>Conectado a WiFi</td><td>" + WiFi.SSID() + "</td></tr>";
      html += "<tr><td>IP modo Estación</td><td><strong>" + WiFi.localIP().toString() + "</strong></td></tr>";
      html += "<tr><td>Máscara de subred</td><td>" + WiFi.subnetMask().toString() + "</td></tr>";
      html += "<tr><td>Puerta de enlace</td><td>" + WiFi.gatewayIP().toString() + "</td></tr>";
    } else {
      html += "<tr><td>Estado WiFi</td><td>Desconectado</td></tr>";
    }
    
    html += "</table>";
    
    // Si está conectado al WiFi, agregar un botón para ir a la interfaz principal
    if (WiFi.status() == WL_CONNECTED) {
      html += "<p>Para acceder a la interfaz principal, use la dirección IP del modo Estación:</p>";
      html += "<a class='btn' href='http://" + WiFi.localIP().toString() + "'>Ir a la interfaz principal</a>";
    }
    
    html += "</div></body></html>";
    
    server.send(200, "text/html", html);
  } else {
    // Para otras solicitudes, servir el archivo index.html normal
    serveIndexFile();
  }
}

void handleNotFound() {
  String html = "<html><body><h1>¡Conexión exitosa!</h1>";
  html += "<p>IP del dispositivo: " + WiFi.localIP().toString() + "</p>";
  //html += "<p>IP del dispositivo: " + String("HOLA") + "</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
  //server.send(200, "text/plain", "hello from esp8266! solicitud de pagina no encontrada");
}



void serveIndexFile()
{
  String clave = server.arg("p");
  String usuario = server.arg("u");
  File file1 = SPIFFS.open("/index.html", "r");
  File file2 = SPIFFS.open("/login.html", "r");
  String m;
  String c;
  String u;
  //c = leer(0, 12);
  //u = leer(30, 9);
//  if (c == clave && u == usuario)//if (true)
//  {
//    m = "correcto";
//    Serial.println(m);
//    server.streamFile(file1, "text/html");
//  }
//  else
//  {
//    m = "incorrecto";
//    Serial.println(m);
//    server.streamFile(file2, "text/html");
//  }
  //

server.streamFile(file1, "text/html");
  file1.close();
  file2.close();
}

void saveWiFiStatus(bool status) {
  EEPROM.write(WIFI_STATUS_ADDR, status ? 1 : 0);  // Guardar estado WiFi en EEPROM
  EEPROM.commit();                                // Aplicar los cambios
}

bool getWiFiStatus() {
  boolean loge = EEPROM.read(WIFI_STATUS_ADDR);
  Serial.printf("credenciales validadas? %d\n", loge);
  return  loge == 1;     // Leer estado WiFi desde EEPROM
}



void wifiManager() {
  WiFiManager wm;

  // Intentar conectarse a la red, o abrir portal cautivo si falla
  if (!wm.autoConnect("Toma Inteligente", "conectar")) {
    Serial.println("Falló la conexión o se cerró el portal.");
    saveWiFiStatus(false);  // Guardar estado de conexión fallida

  }
  saveWiFiStatus(true);
  ESP.restart();
}





void conectar() {
  EEPROM.begin(EEPROM_SIZE);
  delay(2000);

  // Leer el estado WiFi desde EEPROM
  if (getWiFiStatus()) {
    Serial.println("Intentando conectarse a la última red conocida...");


    // Configurar IP fija antes de conectar al WiFi
    if (!WiFi.config(local_IP, gateway, subnet, dns)) {
      Serial.println("Error al configurar la IP fija.");
    }
    // Configurar el modo Station y conectar
    WiFi.mode(WIFI_STA);
    WiFi.begin();  // Usa las credenciales guardadas en la EEPROM

    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.print(".");
      if (millis() - startTime > 10000) {
        Serial.println("\nNo se pudo conectar a la última red conocida.");
        WiFi.disconnect();
        saveWiFiStatus(false); // Guardar que no hay conexión
        ESP.restart();         // Reiniciar para abrir WiFiManager
      }
    }

    // Conexión exitosa
    Serial.println("\nConectado a WiFi:");
    Serial.println("IP Estación: " + WiFi.localIP().toString());
  } else {
    // No hay conexión previa o falló, inicia WiFiManager
    wifiManager();
  }

  // Configurar el punto de acceso
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP(ssid, password);

  Serial.println("Punto de acceso creado. IP: " + WiFi.softAPIP().toString());

  // Iniciar el servidor DNS para redirigir al portal cautivo
  dnsServer.start(53, "*", apIP);

  // Configurar las rutas del servidor web
//  server.on("/",  []() {
//    String html = "<html><body><h1>¡Conexión exitosa!</h1>";
//    html += "<p>IP del dispositivo: " + WiFi.localIP().toString() + "</p>";
//    //html += "<p>IP del dispositivo: " + String("HOLA") + "</p>";
//    html += "</body></html>";
//    server.send(200, "text/html", html);
//  });

}

void init_servidor() {
  server.on("/", handleRoot);
  server.on("/saveconfig-rapida", jsonconfigRapida);
  server.on("/leerConfig", leerConfiguracion);
  server.on("/leerArchivo", GetArchivoJson);
  server.on("/saludo", saludar);
  server.onNotFound(handleWebRequests); //Set setver all paths are not found so we can handle as per URI
  server.begin();
  Serial.println("Servidor web y portal cautivo iniciados.");
}
void handleWebRequests() {
  if (loadFromSpiffs(server.uri())) return;
  String message = "File Not Detected\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " NAME:" + server.argName(i) + "\n VALUE:" + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
  Serial.println(message);
}

bool loadFromSpiffs(String path) {
  String dataType = "text/plain";
  if (path.endsWith("/")) path += "/semana.html";

  if (path.endsWith(".src")) path = path.substring(0, path.lastIndexOf("."));
  else if (path.endsWith(".html")) dataType = "text/html";
  else if (path.endsWith(".htm")) dataType = "text/html";
  else if (path.endsWith(".css")) dataType = "text/css";
  else if (path.endsWith(".js")) dataType = "application/javascript";
  else if (path.endsWith(".png")) dataType = "image/png";
  else if (path.endsWith(".gif")) dataType = "image/gif";
  else if (path.endsWith(".jpg")) dataType = "image/jpeg";
  else if (path.endsWith(".ico")) dataType = "image/x-icon";
  else if (path.endsWith(".xml")) dataType = "text/xml";
  else if (path.endsWith(".pdf")) dataType = "application/pdf";
  else if (path.endsWith(".zip")) dataType = "application/zip";
  else if (path.endsWith(".json")) dataType = "application/json";
  File dataFile = SPIFFS.open(path.c_str(), "r");
  if (server.hasArg("download")) dataType = "application/octet-stream";
  if (server.streamFile(dataFile, dataType) != dataFile.size()) {
  }

  dataFile.close();
  return true;
}
void saludar() {
  server.send(200, "text/plain", "hello from esp8266!");
}
bool leerConfiguracion()
{
  String msg = "";
  File file2 = SPIFFS.open("/configuracion.json", "r");

  if (!file2) {
    Serial.println("Failed to open file for reading");
    return false;
  }
  Serial.println("imprimiendo configuracion");
  while (file2.available()) {
    msg = msg + (char)file2.read();
    //Serial.write(file2.read());
  }
  file2.close();
  Serial.println(msg);
   server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200, "application/json", msg);
  return true;
}
/*
 forma de probar:
   http://192.168.1.49/saveconfig-rapida?archivo=config-rapida
*/
void GetArchivoJson()
{
  String mm = server.arg("archivo");
  Serial.print("[243]leyendo arcivo ");Serial.println(mm);
  String resultado = leerArchivoJson(mm);//procesarSolucitudArchivo(mm);
  Serial.println(resultado);
  server.send(200, "text/plain", resultado);
}
/*
   forma de probar:
   http://192.168.1.49/saveconfig-rapida?configuracion={"Dia":{"inicio":"00:00","fin":"23:45"},"Noche":{"inicio":"00:00","fin":"23:45"},"Madrugada":{"inicio":"00:00","fin":"23:45"},"FinSemana":{"inicio":"00:00","fin":"23:45"},"Ordinario":{"inicio":"00:00","fin":"23:45"},"Festivo":{"inicio":"00:00","fin":"23:45"},"Intermitencia":{"encendido":"00:00","apagado":"00:00"}}

   curl "http://192.168.1.49/saveconfig-rapida?configuracion=%7B%22Dia%22%3A%7B%22inicio%22%3A%2200%3A00%22%2C%22fin%22%3A%2223%3A45%22%7D%2C%22Noche%22%3A%7B%22inicio%22%3A%2200%3A00%22%2C%22fin%22%3A%2223%3A45%22%7D%2C%22Madrugada%22%3A%7B%22inicio%22%3A%2200%3A00%22%2C%22fin%22%3A%2223%3A45%22%7D%2C%22FinSemana%22%3A%7B%22inicio%22%3A%2200%3A00%22%2C%22fin%22%3A%2223%3A45%22%7D%2C%22Ordinario%22%3A%7B%22inicio%22%3A%2200%3A00%22%2C%22fin%22%3A%2223%3A45%22%7D%2C%22Festivo%22%3A%7B%22inicio%22%3A%2200%3A00%22%2C%22fin%22%3A%2223%3A45%22%7D%2C%22Intermitencia%22%3A%7B%22encendido%22%3A%2200%3A00%22%2C%22apagado%22%3A%2200%3A00%22%7D%7D"
*/
bool jsonconfigRapida()// guardar la configuracion rapida en la memoria flash
{
  Serial.println("guardando configuracion");
  //File file = SPIFFS.open("/configuracion.json", "w");
  String mm = server.arg("configuracion");
  //Serial.println(mm);
  String resultado = procesarConfigRapida(mm);
  server.send(200, "text/plane", resultado);
  return true;
}
