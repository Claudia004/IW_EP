// Funciones para manejar la selección de asientos
let asientosSeleccionados = [];
let precioPorAsiento = 5.00; // Precio base por asiento

// Cargar sala de asientos
function cargarSalaAsientos(horarioId) {
    const salaContainer = document.getElementById('salaContainer');
    const asientosOcupados = JSON.parse(localStorage.getItem('asientosOcupados')) || {};
    const asientosOcupadosHorario = asientosOcupados[horarioId] || [];
    
    // Obtener datos del horario seleccionado
    const horarios = JSON.parse(localStorage.getItem('horarios'));
    const horario = horarios.find(h => h.id == horarioId);
    
    // Obtener datos de la película para el precio
    const peliculas = JSON.parse(localStorage.getItem('peliculas'));
    const peliculaSelect = document.getElementById('pelicula');
    const peliculaId = peliculaSelect.value;
    const pelicula = peliculas.find(p => p.id == peliculaId);
    
    if (pelicula) {
        precioPorAsiento = pelicula.precio;
    }
    
    // Generar la sala de asientos
    salaContainer.innerHTML = `
        <div class="sala-container">
            <div class="pantalla">PANTALLA</div>
            <div class="asientos-grid" id="asientosGrid">
                ${generarAsientos(asientosOcupadosHorario)}
            </div>
            <div class="leyenda-asientos mt-3">
                <div class="leyenda-item">
                    <div class="leyenda-color disponible"></div>
                    <span>Disponible</span>
                </div>
                <div class="leyenda-item">
                    <div class="leyenda-color seleccionado"></div>
                    <span>Seleccionado</span>
                </div>
                <div class="leyenda-item">
                    <div class="leyenda-color ocupado"></div>
                    <span>Ocupado</span>
                </div>
                <div class="leyenda-item">
                    <div class="leyenda-color vip"></div>
                    <span>VIP (+$2)</span>
                </div>
            </div>
        </div>
    `;
    
    // Configurar eventos para los asientos
    configurarEventosAsientos();
    
    // Actualizar contador y total
    actualizarResumenCompra();
}

// Generar los asientos de la sala
function generarAsientos(asientosOcupados) {
    let html = '';
    const filas = ['A', 'B', 'C', 'D', 'E', 'F'];
    const columnas = 8;
    
    for (let i = 0; i < filas.length; i++) {
        for (let j = 1; j <= columnas; j++) {
            const asientoId = `${filas[i]}${j}`;
            const esVip = (i === 0 || i === 1); // Las primeras dos filas son VIP
            const estaOcupado = asientosOcupados.includes(asientoId);
            const estaSeleccionado = asientosSeleccionados.includes(asientoId);
            
            let claseAsiento = 'asiento disponible';
            if (estaOcupado) {
                claseAsiento = 'asiento ocupado';
            } else if (estaSeleccionado) {
                claseAsiento = 'asiento seleccionado';
            } else if (esVip) {
                claseAsiento = 'asiento disponible vip';
            }
            
            html += `<div class="${claseAsiento}" data-asiento="${asientoId}" data-vip="${esVip}">${asientoId}</div>`;
        }
    }
    
    return html;
}

// Configurar eventos para los asientos
function configurarEventosAsientos() {
    const asientos = document.querySelectorAll('.asiento.disponible, .asiento.seleccionado, .asiento.vip');
    
    asientos.forEach(asiento => {
        asiento.addEventListener('click', function() {
            const asientoId = this.getAttribute('data-asiento');
            const esVip = this.getAttribute('data-vip') === 'true';
            
            // Si el asiento ya está seleccionado, quitarlo
            if (asientosSeleccionados.includes(asientoId)) {
                asientosSeleccionados = asientosSeleccionados.filter(a => a !== asientoId);
                this.classList.remove('seleccionado');
                if (esVip) {
                    this.classList.add('vip');
                } else {
                    this.classList.add('disponible');
                }
            } 
            // Si no está seleccionado y es disponible, agregarlo
            else if (this.classList.contains('disponible') || this.classList.contains('vip')) {
                asientosSeleccionados.push(asientoId);
                this.classList.remove('disponible', 'vip');
                this.classList.add('seleccionado');
            }
            
            // Actualizar resumen de compra
            actualizarResumenCompra();
        });
    });
}

// Actualizar el resumen de la compra
function actualizarResumenCompra() {
    const contador = document.getElementById('contadorAsientos');
    const totalCompra = document.getElementById('totalCompra');
    const asientosSeleccionadosInput = document.getElementById('asientosSeleccionados');
    const totalInput = document.getElementById('total');
    const btnComprar = document.getElementById('btnComprar');
    
    // Contar asientos VIP
    let asientosVip = 0;
    asientosSeleccionados.forEach(asientoId => {
        const fila = asientoId.charAt(0);
        if (fila === 'A' || fila === 'B') {
            asientosVip++;
        }
    });
    
    const asientosNormales = asientosSeleccionados.length - asientosVip;
    const total = (asientosNormales * precioPorAsiento) + (asientosVip * (precioPorAsiento + 2));
    
    // Actualizar elementos
    contador.textContent = asientosSeleccionados.length;
    totalCompra.textContent = total.toFixed(2);
    asientosSeleccionadosInput.value = asientosSeleccionados.join(',');
    totalInput.value = total.toFixed(2);
    
    // Habilitar o deshabilitar botón de compra
    btnComprar.disabled = asientosSeleccionados.length === 0;
}