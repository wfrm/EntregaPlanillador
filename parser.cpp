// parser.cpp
#include "parser.h"
#include <ArduinoJson.h>
#include "socket.h"
#include "reloj.h"
String horariosJSON = "";      // Variable para guardar los horarios recibidos

int myPins[] = {16, 14, 12, 13, 15, 2, 0, 4, 5, 10};
int myEstadoPins[] = {LOW, LOW, LOW, LOW, LOW, LOW, LOW, LOW, LOW, LOW};
int indice = 0;
int pin = 0;
int estadoPin = false;
DynamicJsonDocument doc(2048); // Documento JSON para almacenar los horarios

void processSchedule(const char* jsonString) {
  // Crear un documento JSON para analizar el horario
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, jsonString);

  if (error) {
    Serial.print("Error al parsear JSON: ");
    Serial.println(error.c_str());
    return;
  }

  // Acceder a los horarios
  JsonArray day0 = doc["0"];
  for (JsonArray range : day0) {
    int start = range[0];
    int end = range[1];
    Serial.printf("[Parser]Día 0: Encendido de %d a %d\n", start, end);
  }
}

String convertirAFormatoR(String contenido) {
  // Envolver el contenido en la estructura de un raw string literal
  String resultado = "R\"(";
  resultado += contenido;
  resultado += ")\"";
  return resultado;
}


void procesarHorarios4Puestos(unsigned long horaEnSegundos) {
  // Verifica si el LED debe estar encendido o apagado
  bool encender = false;
  bool validacion = false;
  bool encenderPuestoActual = false;
  String payloadMemoria = leerArchivo();
  //webSocket.sendTXT(0, payloadMemoria);

  // Intenta analizar el mensaje como JSON
  DeserializationError error = deserializeJson(doc, payloadMemoria);
  if (!error) {
    // Iterar a través de los "puestos" (puesto1, puesto2, ...)
    for (JsonPair puesto : doc.as<JsonObject>()) {
      const char* nombrePuesto = puesto.key().c_str(); // Nombre del puesto (ej. "puesto1")

      JsonObject dias = puesto.value().as<JsonObject>(); // Acceder al objeto de días

      //Serial.printf("Procesando %s\n", nombrePuesto);

      if (strstr(nombrePuesto, "puesto1") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 0;
      }
      else if (strstr(nombrePuesto, "puesto2") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 1;
      }
      else if (strstr(nombrePuesto, "puesto3") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 2;
      }
      else if (strstr(nombrePuesto, "puesto4") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 3;
      }
      else {
        indice = -1;
      }

      // Iterar a través de los días (0, 1, 2, ..., 6)
      for (JsonPair dia : dias) {
        const char* diaClave = dia.key().c_str(); // Día de la semana (ej. "0", "1", ...)
        JsonArray rangos = dia.value().as<JsonArray>(); // Obtener el array de rangos de tiempo

        // Iterar a través de los rangos de horas para el día actual
        for (JsonArray groupOfRanges : rangos) {
          for (JsonArray range : groupOfRanges) {
            unsigned long start = range[0];
            unsigned long end = range[1];
            String Hinicio = getFormattedTimeFromSeconds(start);
            String Hfin = getFormattedTimeFromSeconds(end);


            // Comprueba si la hora actual está dentro del rango
            if (horaEnSegundos >= start && horaEnSegundos <= end) {
              encenderPuestoActual = true; // ¡Coincidencia encontrada para este puesto!
              break; // Salir del bucle más interno (rangos individuales)
            }
            Serial.printf(" indice %d puesto %s  encendido?(%d) Día %s: horario de %s a %s\n", indice, nombrePuesto, validacion, diaClave, Hinicio, Hfin);
          }
        }

        // Si ya se determinó que se debe encender, no es necesario seguir con el resto de los días
        if (encender) {
          //break;
        }
      }

      // Si ya se determinó que se debe encender, no es necesario seguir con el resto de los puestos
      if (encender) {
        //break;
      }
    }
  } else {
    Serial.println(" [ 4 puestos ]Error al deserializar el JSON");
  }

  for (int g = 0; g < 4; g++) {
    pin = myPins[g];
    estadoPin = myEstadoPins[g];
    digitalWrite(pin, estadoPin); // Encender el LED
    Serial.printf("pin %d estado %d\n", pin, estadoPin);
  }

  // Aquí puedes agregar la lógica para encender o apagar el LED según `encender`
  //  if (encender) {
  //    Serial.println("Encendiendo el LED");
  //
  //    digitalWrite(pin, HIGH); // Encender el LED
  //  } else {
  //    Serial.println("Apagando el LED");
  //    digitalWrite(pin, LOW); // Apagar el LED
  //  }

  ////////////////////////////////
  // Actualiza el estado del LED
  //digitalWrite(LED_PIN, encender ? HIGH : LOW);
  String salidas = "";
  for (int z = 0; z < 4; z++) {
    if (myEstadoPins[z]) {
      salidas = salidas + "1";
    }
    else {
      salidas = salidas + "0";
    }
  }
  Serial.printf("estado de pines %s \n", salidas);
  String led_state16 = digitalRead(16) ? "manual1" : "OFF";
  String led_state14 = digitalRead(14) ? "manual2" : "OFF";
  String led_state12 = digitalRead(12) ? "manual3" : "OFF";
  String led_state13 = digitalRead(13) ? "manual4" : "OFF";
  String led_state = "estados," + led_state16 + "," + led_state14 + "," + led_state12 + "," + led_state13;
  webSocket.sendTXT(0, led_state);
}


void procesarHorarios4PuestosGrupoRangos(unsigned long horaEnSegundos) {
  bool validacion = false;
  bool encender = false;
  int hoyEs = obtenerDia();
  String payloadMemoria = leerArchivo();
  DeserializationError error = deserializeJson(doc, payloadMemoria);
  if (!error) {
    for (JsonPair puesto : doc.as<JsonObject>()) {
      validacion = false;
      encender = false;
      const char* nombrePuesto = puesto.key().c_str();
      JsonObject dias = puesto.value().as<JsonObject>();
      if (strstr(nombrePuesto, "puesto1") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 0;
      }
      else if (strstr(nombrePuesto, "puesto2") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 1;
      }
      else if (strstr(nombrePuesto, "puesto3") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 2;
      }
      else if (strstr(nombrePuesto, "puesto4") != nullptr) {
        //Serial.println("'puesto1' está dentro de nombrePuesto");
        indice = 3;
      }
      else {
        indice = -1;
      }
      for (JsonPair dia : dias) {
        const char* diaClave = dia.key().c_str();
        JsonArray rangos = dia.value().as<JsonArray>();
        for (JsonArray rango : rangos) {
          unsigned long inicio = rango[0];
          unsigned long fin = rango[1];
          validacion = horaEnSegundos >= inicio && horaEnSegundos <= fin && hoyEs == atoi(diaClave);
          Serial.printf("Puesto: %s, Día: %s, Rango: [%lu, %lu], encender:%d en el dia %d \n", nombrePuesto, diaClave, inicio, fin, validacion, hoyEs);
          if (validacion) {
            break;
          }
        }//fun rangos
        if (validacion) {
          break;
        }
      }// fin de dias
      if (validacion) {
        encender = true;
        if (indice != -1)
          myEstadoPins[indice] = encender;
        // break; // Sale del ciclo si el rango de tiempo coincide
      }
      else {
        if (indice != -1)
          myEstadoPins[indice] = false;
      }
      if (validacion) {
        //break;
      }
    }// fin de puestos

  } else {
    Serial.println("Error al deserializar el JSON");
  }
  for (int g = 0; g < 4; g++) {
    pin = myPins[g];
    estadoPin = myEstadoPins[g];
    digitalWrite(pin, estadoPin); // Encender el LED
    Serial.printf("pin %d estado %d\n", pin, estadoPin);
  }
  String salidas = "";
  for (int z = 0; z < 4; z++) {
    if (myEstadoPins[z]) {
      salidas = salidas + "1";
    }
    else {
      salidas = salidas + "0";
    }
  }
  Serial.printf("estado de pines %s \n", salidas);
  String led_state16 = digitalRead(16) ? "manual1" : "OFF";
  String led_state14 = digitalRead(14) ? "manual2" : "OFF";
  String led_state12 = digitalRead(12) ? "manual3" : "OFF";
  String led_state13 = digitalRead(13) ? "manual4" : "OFF";
  String led_state = "estados," + led_state16 + "," + led_state14 + "," + led_state12 + "," + led_state13;

  webSocket.sendTXT(0, led_state);
}

void procesarManual4Puestos() {
  // Verifica si el LED debe estar encendido o apagado
  bool encender = false;

  String payloadMemoria = leerManual();
  //webSocket.sendTXT(0, payloadMemoria);

  // Intenta analizar el mensaje como JSON
  DeserializationError error = deserializeJson(doc, payloadMemoria);
  if (!error) {
    // Iterar a través de los "puestos" (manual1, manual2, ...)
    for (JsonPair puesto : doc.as<JsonObject>()) {
      const char* nombrePuesto = puesto.key().c_str();  // Nombre del puesto (ej. "manual1")
      const char* estado = puesto.value().as<const char*>(); // Valor "ON" o "OFF"

      // Validar si el estado es nulo
      if (estado == nullptr) {
        Serial.printf("Error: No se pudo obtener el estado de %s\n", nombrePuesto);
        continue; // Saltar al siguiente puesto
      }

      int indice = -1; // Inicializar índice

      if (strcmp(nombrePuesto, "manual1") == 0) {
        indice = 0;
      } else if (strcmp(nombrePuesto, "manual2") == 0) {
        indice = 1;
      } else if (strcmp(nombrePuesto, "manual3") == 0) {
        indice = 2;
      } else if (strcmp(nombrePuesto, "manual4") == 0) {
        indice = 3;
      }

      Serial.printf("Índice %d Puesto %s Estado %s\n", indice, nombrePuesto, estado);

      // Si el índice es válido, actualizar el estado del pin correspondiente
      if (indice != -1) {
        myEstadoPins[indice] = (strcmp(estado, "ON") == 0); // Convertir "ON"/"OFF" en 1/0
      }
    }
  } else {
    Serial.println("Error al deserializar el JSON");
  }

  // Configurar los pines según los valores leídos
  for (int g = 0; g < 4; g++) {
    int pin = myPins[g];
    int estadoPin = myEstadoPins[g];
    digitalWrite(pin, estadoPin); // Encender o apagar el LED
    Serial.printf("Pin %d Estado %d\n", pin, estadoPin);
  }

  // Crear la cadena de estado de los pines
  String salidas = "";
  for (int z = 0; z < 4; z++) {
    salidas += myEstadoPins[z] ? "1" : "0";
  }
  Serial.printf("Estado de pines %s\n", salidas);

  // Leer estados de los pines físicos
  String led_state16 = digitalRead(16) ? "manual1" : "OFF";
  String led_state14 = digitalRead(14) ? "manual2" : "OFF";
  String led_state12 = digitalRead(12) ? "manual3" : "OFF";
  String led_state13 = digitalRead(13) ? "manual4" : "OFF";
  String led_state = "estados," + led_state16 + "," + led_state14 + "," + led_state12 + "," + led_state13;

  // Enviar estado por WebSocket
  webSocket.sendTXT(0, led_state);
}



void procesarHorarios4Puestos_old(unsigned long horaEnSegundos) { // TODO: enviar codigo al parser.cpp
  // Verifica si el LED debe estar encendido o apagado
  bool encender = false;

  String payloadMemoria = leerArchivo();
  //webSocket.sendTXT(0, payloadMemoria);
  Serial.println(payloadMemoria);
  DeserializationError error = deserializeJson(doc, payloadMemoria);
  //Serial.println(payloadMemoria);
  if (!error) {
    if (doc.containsKey("puesto1")) {
      Serial.println("[procesar horarios 4 puestos]existe Puesto1");
      JsonObject puesto1 = doc["puesto1"];
      Serial.println("Claves dentro de puesto1:");
      for (JsonPair keyValue : puesto1) {
        const char* clave = keyValue.key().c_str(); // Obtener la clave
        JsonVariant valor = keyValue.value();
        Serial.print("Clave: ");
        Serial.print(clave);
        Serial.print(", Valor: ");

        // Detectar el tipo del valor y manejarlo
        if (valor.is<JsonArray>()) {
          Serial.print("[");
          JsonArray array = valor.as<JsonArray>();
          for (size_t i = 0; i < array.size(); i++) {
            JsonArray subArray = array[i];
            Serial.print("[");
            for (size_t j = 0; j < subArray.size(); j++) {
              Serial.print(subArray[j].as<int>()); // Acceder a los elementos como enteros
              if (j < subArray.size() - 1) Serial.print(", ");
            }
            Serial.print("]");
            if (i < array.size() - 1) Serial.print(", ");
          }
          Serial.println("]");
        } else if (valor.is<JsonObject>()) {
          Serial.println("(objeto JSON)");
        } else if (valor.is<int>()) {
          Serial.println(valor.as<int>());
        } else if (valor.is<const char*>()) {
          Serial.println(valor.as<const char*>());
        } else if (valor.isNull()) {
          Serial.println("null");
        } else {
          Serial.println("Otro tipo no manejado");
        }

      }
    }
    Serial.println("[procesar horarios 4 puestos]parseado");
  }
  else {
    Serial.println("[procesar horarios 4 puestos ]error parseando");
    webSocket.sendTXT(0, "error en json");//TODO: forma de saber a que cliente enviar la respuesta
  }

}
void procesarHorarios(unsigned long horaEnSegundos) { // TODO: enviar codigo al parser.cpp
  // Verifica si el LED debe estar encendido o apagado
  bool encender = false;

  String payloadMemoria = leerArchivo();
  //webSocket.sendTXT(0, payloadMemoria);

  // Intenta analizar el mensaje como JSON
  DeserializationError error = deserializeJson(doc, payloadMemoria);
  //Serial.println(payloadMemoria);
  if (!error) {
    //////////////////////////////////
    for (int i = 0; i <= 0; i++) {// ahora es el numero de tomas
      // Accede al arreglo correspondiente para cada puesto de la toma elctrica
      JsonArray day = doc[String(obtenerDia())];// filtro de dia

      // Itera a través de los rangos de horas para el día actual
      for (JsonArray range : day) {
        unsigned long start = range[0];
        unsigned long end = range[1];
        String Hinicio = getFormattedTimeFromSeconds(start);
        String Hfin = getFormattedTimeFromSeconds(end);
        Serial.printf("Puesto %d: Encendido de %s a %s\n", i, Hinicio, Hfin);

        // Comprueba si la hora actual está dentro del rango
        if (horaEnSegundos >= start && horaEnSegundos < end) {
          encender = true;
          break; // Sale del ciclo si el rango de tiempo coincide
        }
      }

      // Si ya se determinó que se debe encender, no es necesario seguir con el resto de los días
      if (encender) {
        break;
      }
    }

    ////////////////////////////////
    // Actualiza el estado del LED
    digitalWrite(LED_PIN, encender ? HIGH : LOW);
    String led_state = digitalRead(LED_PIN) ? "ON" : "OFF";
    webSocket.sendTXT(0, led_state);
  }
  else {
    Serial.println("[procesar horarios]error parseando");
    webSocket.sendTXT(0, "error en json");//TODO: forma de saber a que cliente enviar la respuesta
  }
}
String procesarSolucitudArchivo(String archivo) {
  String contenido = leerArchivoJson("config-rapida");
  return (contenido);
}
String procesarConfigRapida(String payloadMemoria) { // TODO: enviar codigo al parser.cpp

  // Intenta analizar el mensaje como JSON
  DeserializationError error = deserializeJson(doc, payloadMemoria);
  Serial.println(payloadMemoria);
  guardarJson(payloadMemoria, "config-rapida");
  String contenido = leerArchivoJson("config-rapida");
  //Serial.println("###################");
  //Serial.println(contenido);
  if (!error) {
    //////////////////////////////////
    // Leer los valores del JSON y mostrarlos en el monitor serial
    if (doc.containsKey("Dia")) {
      JsonObject dia = doc["Dia"];
      String diaInicio = dia["inicio"];
      String diaFin = dia["fin"];
      Serial.println("Dia:");
      Serial.println("Inicio: " + diaInicio);
      Serial.println("Fin: " + diaFin);
    }

    if (doc.containsKey("Noche")) {
      JsonObject noche = doc["Noche"];
      String nocheInicio = noche["inicio"];
      String nocheFin = noche["fin"];
      Serial.println("Noche:");
      Serial.println("Inicio: " + nocheInicio);
      Serial.println("Fin: " + nocheFin);
    }

    if (doc.containsKey("Madrugada")) {
      JsonObject madrugada = doc["Madrugada"];
      String madrugadaInicio = madrugada["inicio"];
      String madrugadaFin = madrugada["fin"];
      Serial.println("Madrugada:");
      Serial.println("Inicio: " + madrugadaInicio);
      Serial.println("Fin: " + madrugadaFin);
    }

    if (doc.containsKey("FinSemana")) {
      JsonObject finSemana = doc["FinSemana"];
      String finSemanaInicio = finSemana["inicio"];
      String finSemanaFin = finSemana["fin"];
      Serial.println("Fin de Semana:");
      Serial.println("Inicio: " + finSemanaInicio);
      Serial.println("Fin: " + finSemanaFin);
    }

    if (doc.containsKey("Ordinario")) {
      JsonObject ordinario = doc["Ordinario"];
      String ordinarioInicio = ordinario["inicio"];
      String ordinarioFin = ordinario["fin"];
      Serial.println("Ordinario:");
      Serial.println("Inicio: " + ordinarioInicio);
      Serial.println("Fin: " + ordinarioFin);
    }

    if (doc.containsKey("Festivo")) {
      JsonObject festivo = doc["Festivo"];
      String festivoInicio = festivo["inicio"];
      String festivoFin = festivo["fin"];
      Serial.println("Festivo:");
      Serial.println("Inicio: " + festivoInicio);
      Serial.println("Fin: " + festivoFin);
    }

    if (doc.containsKey("Intermitencia")) {
      JsonObject intermitencia = doc["Intermitencia"];
      String encendido = intermitencia["encendido"];
      String apagado = intermitencia["apagado"];
      Serial.println("Intermitencia:");
      Serial.println("Encendido: " + encendido);
      Serial.println("Apagado: " + apagado);
    }
  }
  return contenido;
}
