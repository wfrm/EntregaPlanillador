let cachedStyles = null;
// 1. Definir la clase del Custom Element
class BotonMatche extends HTMLElement {
  constructor() {
    super(); // Llamar al constructor de HTMLElement

    // Crear un Shadow DOM para encapsular el estilo y el contenido
    //this.attachShadow({ mode: 'open' });

    // Estado inicial del componente
    this.puesto = 1;
    this.estado = "";
    this.attachShadow({ mode: 'open' });
    this.render();

  }
    // Método para manejar el evento de clic
    handleClick(event) {
      const isChecked = event.target.checked;
      this.estado = isChecked ? "ON" : "OFF";
      console.log(`Puesto: ${this.puesto}, Estado: ${this.estado}`);
    }

  // Método para actualizar el valor del contador en el DOM
  async render() {
        // Cargar el archivo CSS
        if (!cachedStyles) {
        const response = await fetch('web-components/boton-matche.css');
        cachedStyles = await response.text();
        }
    
    this.shadowRoot.innerHTML=`
        <style>${cachedStyles}</style>
        <div style="display: flex; justify-content: flex-start;">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px; font-weight: bold;">${this.puesto}</span> <!-- Número del puesto -->
            <div class="toggleWrapper">
              <input type="checkbox" id="${this.puesto}" class="${this.puesto} toggle-input">
              <label for="${this.puesto}" class="toggle">
                <span class="toggle__handler"></span>
              </label>
            </div>
          </div>
        </div>
      `
            // Agregar el evento al checkbox
            const checkbox = this.shadowRoot.querySelector('.toggle-input');
            checkbox.addEventListener('change', this.handleClick.bind(this));
  }

}

// 4. Registrar el Custom Element
customElements.define('boton-matche', BotonMatche);
