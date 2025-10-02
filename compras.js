// Funciones para manejar las compras
function cargarCompras() {
    const container = document.getElementById('compras-container');
    const compras = JSON.parse(localStorage.getItem('compras')) || [];

    if (compras.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <h3 class="text-muted">No tienes compras registradas</h3>
                <p class="text-muted">¡Visita nuestra cartelera y compra tus boletos!</p>
                <a href="cartelera.html" class="btn btn-primary">Ver Cartelera</a>
            </div>
        `;
        return;
    }

    // Ordenar compras por fecha (más recientes primero)
    compras.sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra));

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Película</th>
                        <th>Fecha y Hora</th>
                        <th>Sala</th>
                        <th>Asientos</th>
                        <th>Total</th>
                        <th>Método de Pago</th>
                        <th>Fecha de Compra</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${compras.map(compra => `
                        <tr>
                            <td>${compra.pelicula_titulo}</td>
                            <td>${formatearFecha(compra.horario_fecha)} ${compra.horario_hora}</td>
                            <td>${compra.sala}</td>
                            <td>${compra.asientos}</td>
                            <td>$${compra.total.toFixed(2)}</td>
                            <td>${formatearMetodoPago(compra.metodo_pago)}</td>
                            <td>${formatearFechaHora(compra.fecha_compra)}</td>
                            <td>
                                <button class="btn btn-danger btn-sm" onclick="cancelarCompra(${compra.id})">
                                    Cancelar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Cancelar compra
function cancelarCompra(compraId) {
    if (confirm('¿Estás seguro de que quieres cancelar esta compra?')) {
        const compras = JSON.parse(localStorage.getItem('compras'));
        const compraIndex = compras.findIndex(c => c.id === compraId);
        
        if (compraIndex !== -1) {
            const compra = compras[compraIndex];
            
            // Liberar asientos ocupados
            const asientosOcupados = JSON.parse(localStorage.getItem('asientosOcupados'));
            const key = `${compra.horario_id}`;
            if (asientosOcupados[key]) {
                asientosOcupados[key] = asientosOcupados[key].filter(
                    asiento => !compra.asientos.split(',').includes(asiento)
                );
                localStorage.setItem('asientosOcupados', JSON.stringify(asientosOcupados));
            }
            
            // Eliminar compra
            compras.splice(compraIndex, 1);
            localStorage.setItem('compras', JSON.stringify(compras));
            
            // Recargar la vista
            cargarCompras();
            
            // Mostrar mensaje de éxito
            mostrarAlerta('Compra cancelada exitosamente', 'success');
        }
    }
}

// Formatear fecha
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
}

// Formatear fecha y hora
function formatearFechaHora(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES');
}

// Formatear método de pago
function formatearMetodoPago(metodo) {
    const metodos = {
        'tarjeta': 'Tarjeta',
        'paypal': 'PayPal',
        'transferencia': 'Transferencia'
    };
    return metodos[metodo] || metodo;
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// Inicializar página de compras
document.addEventListener('DOMContentLoaded', cargarCompras);