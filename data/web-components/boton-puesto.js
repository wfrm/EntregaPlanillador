class PuestoButton extends HTMLElement {
    constructor() {
      super();
  
      // Crear un Shadow DOM
      const shadow = this.attachShadow({ mode: 'open' });
      this.horario="aquiva el horario";
      // Agregar estructura y estilos usando innerHTML
      shadow.innerHTML = `
        <style>
          .puesto-button {
            display: block;
            align-items: center;
            gap: 8px;
            border: none;
            padding: 1px 1px;
            background-color: #007bff;
            color: white;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s ease;
            width: 80px;
            height: 80px;
          }
  
          .puesto-button:hover {
            background-color: #0056b3;
          }
  
          .puesto-button img {
  width: 95%; /* Reduce el tamaño de la imagen */
  height: auto; /* Mantiene la proporción */
  object-fit: cover;
          }
  
          .puesto-button .button-text {
            font-weight: bold;
            
          }
            .envoltura{
            display: flex;
            flex-direction: column;
            gap: 10px; /* Espaciado entre los divs */
            }
        </style>
        <button class="puesto-button">
          <span class="button-text"></span>
        </button>
        </div>
      `;
  
      // Guardar referencias a los elementos creados
      this.button = shadow.querySelector('.puesto-button');
       this.text = shadow.querySelector('.button-text');
    }
  
    static get observedAttributes() {
      return ['img-src', 'text'];
    }

    getHorario(){
      return this.horario;
    }

    setHorario(horario){
      this.horario=horario;
    }

  
    // Este método se ejecuta cuando el componente es agregado al DOM
    connectedCallback() {
      this.updateComponent();
      //this.button.addEventListener('click', this.handleClickpuesto.bind(this));
    }
    handleClickpuesto() {
      console.log("evento puesto")
        const text = this.getAttribute('text') || '';
        const even_puesto = new CustomEvent('puesto-click', {
          detail: { name: text, emitter: this },
          bubbles: true,  // Permite que el evento se propague a los padres
          composed: true  // Permite que el evento atraviese los límites del Shadow DOM
        });
    
        this.dispatchEvent(even_puesto);
    }
  
    // Este método se ejecuta cuando uno de los atributos observados cambia
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.updateComponent();
      }
    }
  
    // Actualizar los valores de la imagen y el texto
    updateComponent() {
      //const imgSrc = this.getAttribute('img-src') || '';
      const text = this.getAttribute('text') || '';
  
      //this.image.setAttribute('src', imgSrc);
      this.text.textContent = text;
    }
  }
  
  // Registrar el componente
  customElements.define('puesto-button', PuestoButton);
  