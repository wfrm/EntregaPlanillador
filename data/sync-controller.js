// Nuevo controlador para sincronización con el servidor
// Corrected SyncController with fixed keep-alive functionality
const SyncController = {
    apiUrlPOST: 'https://tu-api-endpoint.com/horarios', // Reemplaza con la URL real de tu API
    apiUrlWS: `${window.BASE_URL}:81`, 
    ws: null,
    apiUrlLeerConfig: `${window.BASE_URL}/leerConfig`,
    keepAliveTimeout: null, // Temporizador para el keep-alive
    keepAliveInterval: 5000, // Intervalo de tiempo para validar el keep-alive (5 segundos)
    esJSONValido:function(cadena) {
    try {
        JSON.parse(cadena); // Intenta analizar el string como JSON
        return true; // Si no lanza un error, es un JSON válido
    } catch (error) {
        return false; // Si lanza un error, no es un JSON válido
    }
},
actualizar:function(objetoOriginal,reemplazo){
     // Crear un nuevo objeto con los valores actualizados
const objetoActualizado = Object.fromEntries(
  Object.entries(objetoOriginal).map(([clave, valorOriginal]) => {
    // Si la clave existe en reemplazo, combinar los valores
    if (reemplazo[clave]) {
      return [clave, { ...valorOriginal, ...reemplazo[clave] }];
    }
    // Si no existe en reemplazo, mantener el valor original
    return [clave, valorOriginal];
  })
);
  return objetoActualizado; 
},

leerArchivoConfigRapida: function() {
    const url = `${window.BASE_URL}/leerArchivo?archivo=config-rapida`;

    fetch(url, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener el archivo: ' + response.status);
        }
        return response.json(); // Si el servidor devuelve un JSON
    })
    .then(data => {
        console.log('Archivo recibido:', data);

        // Procesar los datos recibidos si es necesario
       // const datosEnHoras = this.procesarDatosSegundosEnHoras(data);
      //console.log(this.actualizar(HorarioModel.periodosPreconfigurados,data));
        HorarioModel.periodosPreconfigurados=this.actualizar(HorarioModel.periodosPreconfigurados,data);

        // Publicar el evento para actualizar la visualización
        EventBus.publish('periodosActualizados', HorarioModel.periodosPreconfigurados);
    })
    .catch(error => {
        console.error('Error al leer el archivo:', error);
        EventBus.publish('sincronizacionFallida', error.message);
    });
},
preparar:function(data){
  const objetoSinIconos = Object.fromEntries(
  Object.entries(data).map(([clave, valor]) => {
    const { icono, ...resto } = valor;
    return [clave, resto];
  })
);
  return objetoSinIconos
},
enviarDiasPreconfigurados:function () {
    // Convertir el objeto periodosPreconfigurados a JSON
    const queryParams =  'diasPreconfigurados='+JSON.stringify(HorarioModel.diasPreselecionados);
   
    // Realizar la solicitud POST al endpoint /saveconfig-rapida
    fetch(`${window.BASE_URL}/saveDiasPreConfigurados?${queryParams}`, {
        method: 'GET',
        /*headers: {
            'Content-Type': 'application/json'
        },
        body: datosParaEnviar*/
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.status);
        }
        return response.json(); // Si el servidor devuelve una respuesta JSON
    })
    .then(data => {
        console.log('Configuración guardada exitosamente:', data);
        //alert('Configuración guardada exitosamente.');
        subject.notify('Configuración guardada exitosamente.');
    })
    .catch(error => {
        console.error('Error al guardar la configuración:', error);
        alert('Error al guardar la configuración: ' + error.message);
    });
},
enviarPeriodosPreconfigurados:function () {
    // Convertir el objeto periodosPreconfigurados a JSON
    //const datosParaEnviar = JSON.stringify(HorarioModel.periodosPreconfigurados);
    const queryParams =  'configuracion='+JSON.stringify(this.preparar(HorarioModel.periodosPreconfigurados) );
   
    // Realizar la solicitud POST al endpoint /saveconfig-rapida
    fetch(`${window.BASE_URL}/saveconfig-rapida?${queryParams}`, {
        method: 'GET',
        /*headers: {
            'Content-Type': 'application/json'
        },
        body: datosParaEnviar*/
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.status);
        }
        return response.json(); // Si el servidor devuelve una respuesta JSON
    })
    .then(data => {
        console.log('Configuración guardada exitosamente:', data);
        //alert('Configuración guardada exitosamente.');
        subject.notify('Configuración guardada exitosamente.');
    })
    .catch(error => {
        console.error('Error al guardar la configuración:', error);
        alert('Error al guardar la configuración: ' + error.message);
    });
},

leerArchivoDiasPreconfigurados: function() {
    const url = `${window.BASE_URL}/leerArchivo?archivo=dias-preconfigurados`;

    fetch(url, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener el archivo: ' + response.status);
        }
        return response.json(); // Si el servidor devuelve un JSON
    })
    .then(data => {
        console.log('Archivo recibido dias preconfigurados:', data);

        // Procesar los datos recibidos si es necesario
       // const datosEnHoras = this.procesarDatosSegundosEnHoras(data);
        HorarioModel.diasPreselecionados=data;

        // Publicar el evento para actualizar la visualización
        //EventBus.publish('periodosActualizados', HorarioModel.periodosPreconfigurados);
    })
    .catch(error => {
        console.error('Error al leer el archivo:', error);
        EventBus.publish('sincronizacionFallida', error.message);
    });
},
leerConfigYActualizarVisualizacion: function() {
        fetch(this.apiUrlLeerConfig, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener la configuración: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Configuración recibida:', data);
            datosEnHoras = this.procesarDatosSegundosEnHoras(data);

            // Publicar el evento para actualizar la visualización
            EventBus.publish('memoriaHorariosActualizados', datosEnHoras);
        })
        .catch(error => {
            console.error('Error al leer la configuración:', error);
            EventBus.publish('sincronizacionFallida', error.message);
        });
    },

horaEnSegundos: function(hora = "00:00:00") {
        // Divide la hora en partes (horas y minutos)
        const partes = hora.split(':');
        const horas = parseInt(partes[0], 10);    // Convierte las horas a entero
        const minutos = parseInt(partes[1], 10);  // Convierte los minutos a entero
        
        // Calcula el total en segundos (sin segundos específicos)
        return minutos * 60 + horas * 3600;
    },
SegundosEnHora:function(segundos = 0) {
    // Asegurarnos de que los segundos sean positivos
    segundos = Math.max(0, segundos);

    // Calcular las horas, minutos y segundos
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;

    // Formatear para mostrar siempre dos dígitos
    const formato = (valor) => valor.toString().padStart(2, '0');

    return `${formato(horas)}:${formato(minutos)}`;
},

procesarDatosSegundosEnHoras:function(datos){
    if (this.esJSONValido(datos)) {
        console.log("es un json valido");
    }
    else {
        console.log("no es un json valido");
    }
    var resultado = {};
    //console.log(`datos del evento ${datos}`);
    const datosConvertidosHoras = Object.fromEntries(
            Object.entries(datos).map(([puesto, semana]) => [
                puesto, // Mantener la clave principal
                Object.fromEntries(
                    // Procesar las claves internas del subobjeto (0, 1, 2, ...)
                    Object.entries(semana).map(([dia, intervalos]) => [
                        dia,
                        intervalos.map(intervalo => intervalo.map(this.SegundosEnHora))
                    ])
                )
            ])
        );
  resultado=JSON.stringify(datosConvertidosHoras, null, 0);
   console.log(datosConvertidosHoras); /// apesar que no es un json valido lo procesa
    
    return datosConvertidosHoras;
},

procesarDatosHoraEnSegundos: function(datos) {
        let resultado = {};

        // Procesar las claves principales (1, 2, 3, 4, ...)
        const datosConvertidos = Object.fromEntries(
            Object.entries(datos).map(([clavePrincipal, subObjeto]) => [
                clavePrincipal, // Mantener la clave principal
                Object.fromEntries(
                    // Procesar las claves internas del subobjeto (0, 1, 2, ...)
                    Object.entries(subObjeto).map(([dia, intervalos]) => [
                        dia,
                        intervalos.map(intervalo => intervalo.map(this.horaEnSegundos))
                    ])
                )
            ])
        );
        resultado = JSON.stringify(datosConvertidos, null, 0);
        return resultado;
    },

init: function() {
        this.leerArchivoConfigRapida(); 
        //ToDo:leer dias preconfigurados  
        this.leerArchivoDiasPreconfigurados(); 
        SyncController.leerConfigYActualizarVisualizacion()
        // Crear la conexión WebSocket
        this.ws = new WebSocket(this.apiUrlWS);
        
        // Configurar manejadores de eventos para WebSocket
        this.ws.onopen = this.handleWebSocketOpen.bind(this);
        this.ws.onmessage = this.handleWebSocketMessage.bind(this);
        this.ws.onerror = this.handleWebSocketError.bind(this);
        this.ws.onclose = this.handleWebSocketClose.bind(this);

        // Suscribirse a eventos
        EventBus.subscribe('horariosActualizados', this.sincronizarDatosWS.bind(this));
        EventBus.subscribe('periodosActualizados', this.enviarPeriodosPreconfigurados.bind(this));
        EventBus.subscribe('manualPuestoActualizado', this.sincronizarDatosWS.bind(this));
        EventBus.subscribe('diasPreConfiguradosActualizados', this.enviarDiasPreconfigurados.bind(this));
    },

    // Manejadores de eventos WebSocket
handleWebSocketOpen: function() {
        console.log("Conectado al servidor WebSocket.");
        EventBus.publish('estadoConexion', {
        mensaje: "Mensaje recibido del servidor",
        estado: "success" // Puedes usar "success", "warning", "error", etc.
    });
        this.iniciarKeepAlive();
    },

handleWebSocketMessage: function(event) {
        console.log("Respuesta del servidor:", event.data);
        this.reiniciarKeepAlive(); // Reinicia el temporizador cuando se recibe un mensaje
        if(event.data.includes("estados")){}
        else
        subject.notify(event.data);
        try {
            const data = JSON.parse(event.data);
            EventBus.publish('sincronizacionExitosa', data);
        } catch (error) {
            if (event.data.includes("estados")) {
                let partes = event.data.split(",");
                partes.forEach((parte, index) => {
                    if (parte.includes("manual")) {
                        HorarioModel.controlManual[parte] = "ON";
                        HorarioModel.activarControlManual(parte);
                    } else {
                        HorarioModel.controlManual[parte] = "OFF"; 
                        HorarioModel.desactivarControlManual(`manual${index}`);
                    }
                });
            }
            EventBus.publish('sincronizacionExitosa', event.data);
        }
    },

handleWebSocketError: function(error) {
        console.error("Error en el WebSocket:", error);
        EventBus.publish('sincronizacionFallida', error.message);
        this.mostrarEstadoConexion("Error en la conexión", "error");
    },

handleWebSocketClose: function() {
        console.log("Conexión WebSocket cerrada.");
        this.mostrarEstadoConexion("Conexión cerrada", "error");
        this.detenerKeepAlive();
    },

    // Funciones de Keep-Alive
iniciarKeepAlive: function() {
        console.log("Iniciando temporizador de keep-alive...");
        // Limpiar cualquier temporizador existente primero
        this.detenerKeepAlive();
        
        // Configura un nuevo temporizador
        this.keepAliveTimeout = setTimeout(() => {
            console.log("Keep-alive timeout triggered");
            subject.notify("Conexión inactiva, refrescar pagina");
            //this.mostrarEstadoConexion("Conexión inactiva", "warning");
            EventBus.publish('estadoConexion', {
        mensaje: "Conexión inactiva, refrescar pagina",
        estado: "warning" // Puedes usar "success", "warning", "error", etc.
    });
            
            // Opcional: Intenta reconectar
            // this.reconectar();
        }, this.keepAliveInterval);
    },

reiniciarKeepAlive: function() {
        // Reinicia el temporizador del keep-alive
        this.detenerKeepAlive();
        this.iniciarKeepAlive();
    },

detenerKeepAlive: function() {
        // Detiene el temporizador del keep-alive
        if (this.keepAliveTimeout) {
            clearTimeout(this.keepAliveTimeout);
            this.keepAliveTimeout = null;
        }
    },

    // Función opcional de reconexión
reconectar: function() {
        console.log("Intentando reconectar...");
        if (this.ws) {
            this.ws.close();
        }
        this.init();
    },

sincronizarDatosWS: function(jsonData) {
        console.log("Sincronizando datos con el servidor a través de WebSocket...");

        let datosEnSegundos = JSON.stringify(jsonData);
        let datosParaEnviar = jsonData;
        
        // Crear una copia de los datos para evitar modificar los originales
        let selector = "manual1" in jsonData;
        if (!selector) {
            datosEnSegundos = this.procesarDatosHoraEnSegundos(jsonData);
            datosParaEnviar = JSON.parse(JSON.stringify(datosEnSegundos));
        }
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(datosEnSegundos);
                console.log("Datos enviados al servidor:", datosParaEnviar);
            } catch (error) {
                console.error("Error al enviar datos por WebSocket:", error);
                EventBus.publish('sincronizacionFallida', error.message);
            }
        } else {
            console.error("El WebSocket no está conectado.");
            EventBus.publish('sincronizacionFallida', "El WebSocket no está conectado.");
        }
    },

sincronizarDatosPOST: function(jsonData) {
        console.log("Sincronizando datos con el servidor...");
        
        // Crear una copia para evitar modificar los datos originales
        const datosParaEnviar = JSON.parse(JSON.stringify(jsonData));
        
        // Enviar datos al servidor mediante fetch
        fetch(this.apiUrlPOST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosParaEnviar)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Sincronización exitosa:', data);
            EventBus.publish('sincronizacionExitosa', data);
        })
        .catch(error => {
            console.error('Error al sincronizar con el servidor:', error);
            EventBus.publish('sincronizacionFallida', error.message);
        });
    },
    
    // Método para forzar la sincronización manualmente
forzarSincronizacion: function() {
        this.sincronizarDatosPOST(HorarioModel.jsonCommands4Puestos);
    },

mostrarEstadoConexion: function(mensaje, estado) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = mensaje;
            statusElement.className = `sync-status ${estado}`;
        }
    }
};
window.SyncController = SyncController;