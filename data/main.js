       // Patrón Observer: Sistema de eventos

 

const EventBus = {
    events: {},
    
    subscribe: function(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    },
    
    publish: function(eventName, data) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName].forEach(callback => {
            callback(data);
        });
    }
};
// Sujeto (Subject)
class NotificacionSubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Observador (Observer)
class NotificacionObserver {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  update(mensaje) {
    const div = document.createElement('div');
    div.className = 'notificacion';
    div.textContent = mensaje;
    this.container.appendChild(div);

    // Eliminar después de 5 segundos
    setTimeout(() => {
      this.container.removeChild(div);
    }, 5000);
  }
}


// Modelo de datos central
const HorarioModel = {
    // Datos
    jsonCommands4Puestos: {
        "puesto1": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
        "puesto2": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
        "puesto3": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
        "puesto4": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
    },
    memoriaMicrocontrolador:{},
    
    periodosPreconfigurados: {
        Dia: { inicio: "07:00", fin: "14:45" ,icono:"dia.png"},
        Noche: { inicio: "16:00", fin: "21:45" ,icono:"noche.png"},
        Madrugada: { inicio: "02:00", fin: "07:45" ,icono:"madrugada.png"},
        FinSemana: { inicio: "07:00", fin: "13:45" ,icono:"finSemana.png"},
        Ordinario: { inicio: "07:00", fin: "14:45" ,icono:"ordinario.png"},
        todoTiempo: { inicio: "00:00", fin: "23:45" ,icono:"247.jpg" },
        Festivo: { inicio: "07:00", fin: "13:45" ,icono:"festivo.jpg"},
        Intermitencia: { encendido: "00:01", apagado: "00:01" ,icono:"intermitencia.png"}
    },
    controlManual:{
        "manual1":"",
        "manual2":"",
        "manual3":"",
        "manual4":""
    } ,
    
    puestosSeleccionados: new Set(),
    diasSeleccionados: new Set(),
    diasPreselecionados:{
        Ordinario:[1,2,3,4,5],
        FinSemana:[0,6],
        todoTiempo:[0,1,2,3,4,5,6],
        Dia:[1,2,3,4,5],
        Noche:[1,2,3,4,5]
},
    estadoManual: new Set(),

    init:function(){

    },

    activarControlManual:function(puesto){
        this.estadoManual.add(puesto);
        this.controlManual[puesto] = "ON";
        EventBus.publish('manualActualizados', Array.from(this.estadoManual));
        //EventBus.publish('horariosActualizados', this.controlManual);
    },
    desactivarControlManual:function(puesto){
        this.estadoManual.delete(puesto);
        this.controlManual[puesto] = "OFF";
        EventBus.publish('manualActualizados', Array.from(this.estadoManual));
        //EventBus.publish('horariosActualizados', this.controlManual);
    },
    
    // Métodos para manipular datos
    agregarPuesto: function(puesto) {
        this.puestosSeleccionados.add(puesto);
        EventBus.publish('puestosActualizados', Array.from(this.puestosSeleccionados));
    },
    
    quitarPuesto: function(puesto) {
        this.puestosSeleccionados.delete(puesto);
        EventBus.publish('puestosActualizados', Array.from(this.puestosSeleccionados));
    },
    
    agregarDia: function(dia) {
        this.diasSeleccionados.add(dia);
        EventBus.publish('diasActualizados', Array.from(this.diasSeleccionados));
    },
    
    quitarDia: function(dia) {
        this.diasSeleccionados.delete(dia);
        EventBus.publish('diasActualizados', Array.from(this.diasSeleccionados));
    },
    
    limpiarDias: function() {
        this.diasSeleccionados.clear();
        EventBus.publish('diasActualizados', Array.from(this.diasSeleccionados));
    },
    
    seleccionarDiasOrdinarios: function() {
        this.limpiarDias();
HorarioModel.diasPreselecionados.Ordinario.forEach(dia => {
    this.agregarDia(dia.toString());
});
    },
    
    seleccionarFinDeSemana: function() {
        this.limpiarDias();
        this.agregarDia("0");
        this.agregarDia("6");
    },
    
    seleccionarTodaLaSemana: function() {
        this.limpiarDias();
        for (let i = 0; i <= 6; i++) {
            this.agregarDia(i.toString());
        }
    },
    seleccionarDiasNoche: function() {
        this.limpiarDias();
HorarioModel.diasPreselecionados.Noche.forEach(dia => {
    this.agregarDia(dia.toString());
});
    },
        seleccionarDiasDia: function() {
        this.limpiarDias();
HorarioModel.diasPreselecionados.Dia.forEach(dia => {
    this.agregarDia(dia.toString());
});
    },
    timeToMinutes:function(time) {
    const [hh, mm] = time.split(":").map(Number);
    return hh * 60 + mm;
}
    ,
    guardarHorario: function(horaInicio, horaFin) {
        if (this.puestosSeleccionados.size === 0 || this.diasSeleccionados.size === 0) {
            return false;
        }
        
        const horario = [horaInicio, horaFin];
        let nuevoArray=horario;
        const horaInicioNueva =this.timeToMinutes(nuevoArray[0]);
        const horaFinNueva = this.timeToMinutes(nuevoArray[1]);
 
        this.puestosSeleccionados.forEach(puesto => {
            this.diasSeleccionados.forEach(dia => {
                //this.jsonCommands4Puestos[puesto][dia].unshift(horario);
                this.jsonCommands4Puestos[puesto][dia]=[horario];
            });
        });


        let data=this.jsonCommands4Puestos;


        for (const puesto in data) {
        for (const key in data[puesto]) {
            const arrays = data[puesto][key];

            for (let i = 0; i < arrays.length; i++) {
                const [horaInicio, horaFin] = arrays[i].map(timeToMinutes);

                if (horaInicio < horaInicioNueva && horaFin > horaFinNueva) {
                    // Reemplazamos el array que cumple la condición
                    data[puesto][key][i] = nuevoArray;
                    return; // Salimos después de reemplazar
                }
            }
        }
    }
    this.jsonCommands4Puestos=data;
        
        EventBus.publish('horariosActualizados', this.jsonCommands4Puestos);
        return true;
    },
    
    actualizarPeriodo: function(periodo, tipo, valor) {
        if (tipo === 'inicio' || tipo === 'encendido') {
            this.periodosPreconfigurados[periodo].inicio = valor;
            this.periodosPreconfigurados[periodo].encendido = valor;
        } else {
            this.periodosPreconfigurados[periodo].fin = valor;
            this.periodosPreconfigurados[periodo].apagado = valor;
        }
        
        EventBus.publish('periodosActualizados', this.periodosPreconfigurados);
    },
    
    aplicarPeriodo: function(periodo) {
        if (this.puestosSeleccionados.size === 0 || this.diasSeleccionados.size === 0) {
            return false;
        }
        
        const configuracion = this.periodosPreconfigurados[periodo];
        const horario = [configuracion.inicio || configuracion.encendido, configuracion.fin || configuracion.apagado];
        

        let nuevoArray=horario;
        const horaInicioNueva = this.timeToMinutes(nuevoArray[0]);
        const horaFinNueva = this.timeToMinutes(nuevoArray[1]);

        this.puestosSeleccionados.forEach(puesto => {
            this.diasSeleccionados.forEach(dia => {
                //this.jsonCommands4Puestos[puesto][dia].unshift(horario);
                this.jsonCommands4Puestos[puesto][dia]=[horario];
            });
        });



        ////////////////////////////codigo repetido
        let data=this.jsonCommands4Puestos;
        for (const puesto in data) {
        for (const key in data[puesto]) {
            const arrays = data[puesto][key];

            for (let i = 0; i < arrays.length; i++) {
                const [horaInicio, horaFin] = arrays[i].map(this.timeToMinutes);

                if (horaInicio <= horaInicioNueva && horaFin >= horaFinNueva) {
                    // Reemplazamos el array que cumple la condición
                    data[puesto][key][i] = nuevoArray;
                    //return; // Salimos después de reemplazar
                }
            }
        }
    }
    this.jsonCommands4Puestos=data;
    // todo: hay que eliminar los repetidos. es decir dejar solo un horario





        ////////////////////////////
        
        EventBus.publish('horariosActualizados', this.jsonCommands4Puestos);
        return true;
    }
};


const SyncStatusView = {
    init: function() {
        // Crear un elemento para mostrar el estado de sincronización
        const statusElement = document.createElement('div');
        statusElement.id = 'sync-status';
        statusElement.className = 'sync-status';
        document.body.appendChild(statusElement);
        
        // Suscribirse a eventos de sincronización
        EventBus.subscribe('sincronizacionExitosa', this.mostrarExito);
        EventBus.subscribe('sincronizacionFallida', this.mostrarError);
        EventBus.subscribe('horariosActualizados', this.mostrarSincronizando);

        EventBus.subscribe('estadoConexion', function(data) {
        //this.mostrarEstadoConexion(data.mensaje, data.estado);//todo: acalarar porque es SyncStatusView
        });

    },
    
    mostrarSincronizando: function() {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = 'Sincronizando...';
            statusElement.className = 'sync-status syncing';
            // Ocultar después de un tiempo
            setTimeout(() => {
             statusElement.style.opacity = '0';
            statusElement.textContent = "";
            statusElement.className = "";
            }, 3000);
        }
    },
    
    mostrarExito: function(data) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = 'Datos sincronizados correctamente';
            statusElement.className = 'sync-status success';
            // Ocultar después de un tiempo
            setTimeout(() => {
            statusElement.style.opacity = '0';
            statusElement.textContent = "";
            statusElement.className = "";
            }, 3000);
        }
    },
    
    mostrarError: function(error) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = 'Error: ' + error;
            statusElement.className = 'sync-status error';
            setTimeout(() => {
            statusElement.style.opacity = '0';
            statusElement.textContent = "";
            statusElement.className = "";
        }, 3000);
            // No ocultar automáticamente en caso de error para que el usuario lo vea
        }
    },
    mostrarEstadoConexion: function(mensaje, estado) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = mensaje;
            statusElement.className = `sync-status ${estado}`;
            statusElement.style.opacity = '1';
            setTimeout(() => {
            statusElement.style.opacity = '0';
            statusElement.textContent = "";
            statusElement.className = "";
        }, 3000);
        }
    },
};

// Controladores para la UI
const PuestoController = {
    puestoActivo:"puesto1",
    init: function() {
        document.querySelectorAll('.puesto-btn').forEach(boton => {
            boton.addEventListener('click', this.handlePuestoClick);
        });

        document.querySelectorAll('#Bogota .manual-btn').forEach(boton => {
            boton.addEventListener('click', this.manualPuestoClick);
        });

        document.querySelectorAll('#Paris .temp-manual-btn').forEach(boton => { // ToDo: sigue duplicando el evento click-->
    if (!boton.dataset.eventRegistered) { // Verifica si ya tiene el evento registrado
        boton.addEventListener('click', PuestoController.tempManualPuestoClick);
        boton.dataset.eventRegistered = true; // Marca el botón como registrado
    }
});

        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');

            tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Quitar clase active de todos los tabs y contenidos
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        // Activar el tab y el contenido correspondiente
        tab.classList.add('active');
        //console.log(tab.dataset.puesto);
        this.puestoActivo=tab.dataset.puesto;
        document.getElementById(tab.dataset.tab).classList.add('active');
        EventBus.publish('memoriaHorariosActualizados', HorarioModel.memoriaMicrocontrolador);
            });
        });

        EventBus.subscribe('puestosActualizados', this.actualizarVistaSeleccion);
        EventBus.subscribe('horariosActualizados', this.actualizarVisualizacion);
        EventBus.subscribe('manualActualizados', this.actualizarVisualManual);
        EventBus.subscribe('manualActualizados', this.actualizarVisualManualToggle);
        EventBus.subscribe('manualActualizados', this.actualizarVisualManualLedCheckbox);
        EventBus.subscribe('memoriaHorariosActualizados', this.actualizarVisualizacion);// pureba de concepto
        //
    },

    tempManualPuestoClick: function(event) {
        const puesto = event.target.dataset.puesto;
        
console.log(`####control manual temporizado puesto ${puesto}`);
if(puesto!==undefined  && puesto !== null && puesto !=="")
    subject.notify(`prueba temporizada de un minuto en puesto: ${puesto}`);
//console.log(`estado de los puestos ${JSON.stringify(HorarioModel.controlManual)}`);
if (HorarioModel.estadoManual.has(puesto)) { //diferenciar de estado manual de control manual
            HorarioModel.desactivarControlManual(puesto);
        } else {
            HorarioModel.activarControlManual(puesto);
        }
        EventBus.publish('manualPuestoActualizado', HorarioModel.controlManual);
setTimeout(() => {
        console.log(`Ejecutando acción para el puesto ${puesto} después de 1 minuto.`);
        // Aquí puedes agregar el código que deseas ejecutar
        if (HorarioModel.estadoManual.has(puesto)) { //diferenciar de estado manual de control manual
            HorarioModel.desactivarControlManual(puesto);
        } else {
            HorarioModel.activarControlManual(puesto);
        }
        EventBus.publish('manualPuestoActualizado', HorarioModel.controlManual);
    }, 60000); // 60,000 milisegundos = 1 minuto


    },

    manualPuestoClick: function(event) {
        const puesto = event.target.dataset.puesto;
        
//console.log(`control manual puesto ${puesto}`);
//console.log(`estado de los puestos ${JSON.stringify(HorarioModel.controlManual)}`);
        if (HorarioModel.estadoManual.has(puesto)) { //diferenciar de estado manual de control manual
            HorarioModel.desactivarControlManual(puesto);
        } else {
            HorarioModel.activarControlManual(puesto);
        }
        EventBus.publish('manualPuestoActualizado', HorarioModel.controlManual);
    },
    
    handlePuestoClick: function(event) {
        const puesto = event.target.dataset.puesto;
        
        if (HorarioModel.puestosSeleccionados.has(puesto)) {
            HorarioModel.quitarPuesto(puesto);
        } else {
            HorarioModel.agregarPuesto(puesto);
        }
    },
    
    actualizarVistaSeleccion: function(puestos) {
        document.querySelectorAll('.puesto-btn').forEach(boton => {
            const puesto = boton.dataset.puesto;
            if (puestos.includes(puesto)) {
                boton.style.backgroundColor = "#F5B041";
            } else {
                boton.style.backgroundColor = "";
            }
        });
    },
    
    actualizarVisualizacion: function(jsonData) {
        let validador= "manual1" in jsonData;
        HorarioModel.memoriaMicrocontrolador=jsonData;
        if (!validador){
        $("#day-schedule").data('artsy.dayScheduleSelector').clearAll();
        
        HorarioModel.puestosSeleccionados.forEach(puesto => {
            $("#day-schedule").data('artsy.dayScheduleSelector').deserialize(jsonData[puesto]);
        });

        if (HorarioModel.puestosSeleccionados.size === 0) {
    console.log("No hay puestos seleccionados. memoria del microcontrolador programacion");
    $("#day-schedule").data('artsy.dayScheduleSelector').deserialize(jsonData[PuestoController.puestoActivo]);
    // Realiza la acción correspondiente
}
    }
    },
    actualizarVisualManual:function(data){
        //console.log("actualizarVisualManual",data);
        const soloManualBtn = Array.from(document.querySelectorAll('.manual-btn'))
        .filter(el => el.classList.length === 1);

        soloManualBtn.forEach(boton => {
            const puesto = boton.dataset.puesto;
            if (data.includes(puesto)) {
                boton.style.backgroundColor = "#F5B041";
            } else {
                boton.style.backgroundColor = "";
            }
        });

    },
    actualizarVisualManualToggle:function(data){
        //console.log("actualizarVisualManual",data);
        const checkboxesConPuesto = document.querySelectorAll('input[type="checkbox"][data-puesto]');
        checkboxesConPuesto.forEach(boton => {
            const puesto = boton.dataset.puesto;
            if (data.includes(puesto)) {
                //boton.style.backgroundColor = "lightgreen";
                boton.checked=true
            } else {
                //boton.style.backgroundColor = "";
                boton.checked=false;
            }
        });

    },
    actualizarVisualManualLedCheckbox:function(data){
        //console.log("actualizarVisualManual",data);
        const checkboxesConPuesto = document.querySelectorAll('input[type="checkbox"].indicadorLed');
        checkboxesConPuesto.forEach(boton => {
            const puesto = boton.dataset.puesto;
            if (data.includes(puesto)) {
                //boton.style.backgroundColor = "lightgreen";
                boton.checked=true
            } else {
                //boton.style.backgroundColor = "";
                boton.checked=false;
            }
        });

    }

};

const DiaController = {
    init: function() {
        document.querySelectorAll('.dia-btn').forEach(boton => {
            boton.addEventListener('click', this.handleDiaClick);
        });
        
        EventBus.subscribe('diasActualizados', this.actualizarVistaSeleccion);
    },
    
    handleDiaClick: function(event) {
        const dia = event.target.dataset.dia;
        
        if (HorarioModel.diasSeleccionados.has(dia)) {
            HorarioModel.quitarDia(dia);
        } else {
            HorarioModel.agregarDia(dia);
        }
            // Actualiza diasPreselecionados.Ordinario (como ejemplo, puedes hacer lo mismo para otros)
    const idx = HorarioModel.diasPreselecionados[PeriodoController.periodoSeleccionado].indexOf(Number(dia));
    if (idx !== -1) {
        // Si ya está, lo quitamos
        HorarioModel.diasPreselecionados[PeriodoController.periodoSeleccionado].splice(idx, 1);
    } else {
        // Si no está, lo agregamos
        HorarioModel.diasPreselecionados[PeriodoController.periodoSeleccionado].push(Number(dia));
    }
    },
    
    actualizarVistaSeleccion: function(dias) {
        document.querySelectorAll('.dia-btn').forEach(boton => {
            const dia = boton.dataset.dia;
            if (dias.includes(dia)) {
                boton.style.backgroundColor = "red";
            } else {
                boton.style.backgroundColor = "";
            }
        });
    }
};

const HorarioController = {
    init: function() {
        try{
        document.getElementById('guardarHorario').addEventListener('click', this.handleGuardarClick);
        }
        catch(e){
            console.log("Error al inicializar el controlador de horarios:", e);
        }
        // EventBus.subscribe('horariosActualizados', function(data) {
        //     console.log("JSON actualizado:", data);
        // });
    },
    
    handleGuardarClick: function() {
        const horaInicio = document.getElementById('horaInicio').value;
        const horaFin = document.getElementById('horaFin').value;
        
        if (!horaInicio || !horaFin) {
            alert("Selecciona ambas horas.");
            return;
        }
        
        const resultado = HorarioModel.guardarHorario(horaInicio, horaFin);
        
        if (!resultado) {
            alert("Selecciona al menos un puesto y un día.");
            return;
        }
        
        alert("Horario guardado correctamente.");
        
        // Limpiar selección
        HorarioModel.puestosSeleccionados.clear();
        HorarioModel.diasSeleccionados.clear();
        EventBus.publish('puestosActualizados', []);
        EventBus.publish('diasActualizados', []);
    }
};

const PeriodoController = {
    selectedButton: null,
    periodoSeleccionado: null,
    
    init: function() {
        this.createTable();
        this.crearBotoneraRapida();
        
        EventBus.subscribe('periodosActualizados', this.actualizarTabla);
        
document.getElementById('dia-btn-guardar').addEventListener('click', this.PeriodosPreconfigurados2Memoria.bind(this));
    },

    crearBotoneraRapida:function(){
        const botoneraRapida = document.querySelector(".botnesRapidos");
        botoneraRapida.innerHTML = "";

for (let key in HorarioModel.periodosPreconfigurados) {
    // Obtener el periodo actual del objeto
    const periodo = HorarioModel.periodosPreconfigurados[key];
    
    // Usar += para añadir a lo que ya existe en innerHTML, no reemplazarlo
    botoneraRapida.innerHTML += `
        <div class="boton-item">
        <button class="puesto-button" data-periodo=${key} onclick="PeriodoController.handleButtonClick(this, '${key}')">
            <img src="${periodo.icono}" alt="Icono" style="width: 72px; height: 72px;">
            <span class="button-text"></span>
        </button>
        <p style="margin-top: 5px;">${key}</p>
        </div>
    `;
}
    },
    
    createTable: function() {
        const tbody = document.querySelector("#data-table tbody");
        tbody.innerHTML = "";
        
        for (let key in HorarioModel.periodosPreconfigurados) {
            let row = document.createElement("tr");
            const periodo = HorarioModel.periodosPreconfigurados[key];
            //TODO: este codigo se repite todo: refactorizar
            row.innerHTML = `
                <td> <button class="puesto-button" 
onclick="PeriodoController.handleButtonClick(this, '${key}')">
                    <img src=${periodo.icono} alt="Icono" style="width: 72px; height: 72px;">
                        <span class="button-text"></span>
                     </button>
                     <p style="margin-top: 5px;">${key}</p>
                </td>
                <td><input type="time" value="${periodo.inicio || periodo.encendido}" onchange="PeriodoController.updateData('${key}', 'inicio', this.value)"></td>
                <td><input type="time" value="${periodo.fin || periodo.apagado}" onchange="PeriodoController.updateData('${key}', 'fin', this.value)"></td>
            `;
            tbody.appendChild(row);
        }
    },
    
    actualizarTabla: function(data) {
        const tbody = document.querySelector("#data-table tbody");
        tbody.innerHTML = "";
        
        for (let key in data) {
            let row = document.createElement("tr");
            const periodo = data[key];
            //este codigo se repite todo: refactorizar
            row.innerHTML = `

        <td> <button class="puesto-button" onclick="PeriodoController.guardarPeriodosPreconfigurados(this, '${key}')">
                    <img src=${periodo.icono} alt="Icono" style="width: 72px; height: 72px;">
                        <span class="button-text"></span>
                     </button>
                     <p style="margin-top: 5px;">${key}</p>
                </td>
                <td><input type="time" value="${periodo.inicio || periodo.encendido}" onchange="PeriodoController.updateData('${key}', 'inicio', this.value)"></td>
                <td><input type="time" value="${periodo.fin || periodo.apagado}" onchange="PeriodoController.updateData('${key}', 'fin', this.value)"></td>
            `;
            tbody.appendChild(row);
        }
    },
    
    updateData: function(periodo, tipo, valor) {
        //
        setTimeout(() => {
            HorarioModel.actualizarPeriodo(periodo, tipo, valor);
        }, 3000); // Esperar 1 segundo antes de actualizar
    },
    guardarPeriodosPreconfigurados: function(button, periodo) {
    PeriodoController.periodoSeleccionado = periodo;
    if (periodo === "Ordinario") {
            HorarioModel.seleccionarDiasOrdinarios();
        } else if (periodo === "FinSemana") {
            HorarioModel.seleccionarFinDeSemana();
        } else if (periodo === "todoTiempo") {
            HorarioModel.seleccionarTodaLaSemana();
        }
        else if (periodo==="Dia") {
            HorarioModel.seleccionarDiasDia();
        }
        else if (periodo==="Noche") {
            HorarioModel.seleccionarDiasNoche();
        }
        
    
        // Gestionar la selección del botón
        if (this.selectedButton) {
            this.selectedButton.classList.remove("selected");
            this.selectedButton.style.backgroundColor = "";
        }
        this.selectedButton = button;
        this.selectedButton.classList.add("selected");
        this.selectedButton.style.backgroundColor = "#F5B041";
    },
    PeriodosPreconfigurados2Memoria: function() {
        console.log("Guardando periodos preconfigurados en memoria del microcontrolador",HorarioModel.diasPreselecionados);
        EventBus.publish('diasPreConfiguradosActualizados', HorarioModel.diasPreselecionados);
    },
    
    handleButtonClick: function(button, periodo) {
        $("#day-schedule").data('artsy.dayScheduleSelector').clearAll();
        
        // Gestionar la selección automática de días según el periodo
        if (periodo === "Ordinario") {
            HorarioModel.seleccionarDiasOrdinarios();
        } else if (periodo === "FinSemana") {
            HorarioModel.seleccionarFinDeSemana();
        } else if (periodo === "todoTiempo" || periodo==="Dia" || periodo==="Noche") {
            HorarioModel.seleccionarTodaLaSemana();
        }
        
        if (HorarioModel.diasSeleccionados.size === 0) {
            alert("Debe seleccionar al menos un día.");
            return;
        }
        
        if (HorarioModel.puestosSeleccionados.size === 0) {
            alert("Debe seleccionar al menos un puesto.");
            return;
        }
        
        // Gestionar la selección del botón
        if (this.selectedButton) {
            this.selectedButton.classList.remove("selected");
            this.selectedButton.style.backgroundColor = "";
        }
        this.selectedButton = button;
        this.selectedButton.classList.add("selected");
        this.selectedButton.style.backgroundColor = "#F5B041";
        
        // Aplicar el periodo
        HorarioModel.aplicarPeriodo(periodo);
    }
};


// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    SyncController.init(); // Inicializar el nuevo controlador
    SyncStatusView.init();
    PuestoController.init();
    DiaController.init();
    HorarioController.init();
    PeriodoController.init();
// Crear instancia del sujeto
const subject = new NotificacionSubject();
window.subject = subject; // Hacerlo global

// Crear y registrar observadores
const observer1 = new NotificacionObserver('notificaciones');
window.observer1 = observer1; // Hacerlo global
subject.subscribe(observer1);

});