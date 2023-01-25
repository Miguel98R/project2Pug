
const notyf = new Notyf({
    duration: 1000,
    position: {
        x: 'right',
        y: 'top',
    },
    types: [
        {
            type: 'warning',
            background: 'orange',
            icon: '<i class="fas fa-exclamation"></i>',
            duration: 2000,
            dismissible: true
        },
        {
            type: 'error',
            background: 'indianred',
            duration: 2000,
            dismissible: true
        },
        {
            type: 'success',
            background: 'green',
            duration: 2000,
            dismissible: true
        }
    ]
});


// Define el número de esferas
    var sphereCount = 605;

// Crea un bucle para generar las esferas
for (var i = 0; i < sphereCount; i++) {
    // Crea una nueva esfera
    var sphere = document.createElement("div");
    sphere.classList.add("sphere");
    // Genera una posición aleatoria en el body
    sphere.style.left = Math.random() * 100 + "%";
    sphere.style.top = Math.random() * 100 + "%";
    // Agrega la esfera al body
    document.body.appendChild(sphere);
}