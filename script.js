let longitud = document.getElementById('longitud');
let upper = document.getElementById('upper');
let lower = document.getElementById('lower');
let numbers = document.getElementById('numbers');
let symbols = document.getElementById('symbols');
let espacioContra = document.getElementById('datos');
let btnGenerar = document.getElementById('generateButton');
let strengthLabel = document.getElementById('strengthLabel');
let sliderValue = document.getElementById('sliderValue');
let copyButton = document.getElementById('copyButton');

// Grupos de caracteres disponibles para crear la contraseña.
const caracteres = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+[]{}|;:,.<>?'
};

function generarPassword(longitud) {
    // Guarda los grupos que el usuario ha seleccionado.
    const gruposSeleccionados = [];

    if (upper.checked) {
        gruposSeleccionados.push(caracteres.upper);
    }
    if (lower.checked) {
        gruposSeleccionados.push(caracteres.lower);
    }
    if (numbers.checked) {
        gruposSeleccionados.push(caracteres.numbers);
    }
    if (symbols.checked) {
        gruposSeleccionados.push(caracteres.symbols);
    }

    if (gruposSeleccionados.length === 0 || longitud < gruposSeleccionados.length) {
        return '';
    }

    const caracteresSeleccionados = gruposSeleccionados.join('');

    // Añade primero un carácter aleatorio de cada grupo seleccionado.
    const password = gruposSeleccionados.map(grupo => {
        // Crea un array de 32 bits para almacenar un valor aleatorio.
        const valor = new Uint32Array(1);
        // Llena el array con un valor aleatorio seguro.
        crypto.getRandomValues(valor);
        // Devuelve un carácter aleatorio del grupo correspondiente.
        return grupo[valor[0] % grupo.length];
    });

    // Completa la contraseña hasta alcanzar la longitud indicada.
    while (password.length < longitud) {
        const valor = new Uint32Array(1);
        crypto.getRandomValues(valor);
        password.push(caracteresSeleccionados[valor[0] % caracteresSeleccionados.length]);
    }

    // Mezcla los caracteres para que los grupos no queden en orden.
    for (let i = password.length - 1; i > 0; i--) {
        const valor = new Uint32Array(1);
        crypto.getRandomValues(valor);
        // Calcula un índice aleatorio para intercambiar los caracteres.
        const indice = valor[0] % (i + 1);
        // Intercambia los caracteres en las posiciones i e indice.
        [password[i], password[indice]] = [password[indice], password[i]];
    }
    
    // Devuelve la contraseña como una cadena.
    return password.join('');
}

// Calcula la entropía estimada según la longitud y los caracteres posibles.
function calcularBits(longitud, caracteresPosibles) {
    return longitud * Math.log2(caracteresPosibles);
}

function actualizarFuerzaPassword() {
    // Cuenta solo los caracteres de los grupos seleccionados.
    let totalCaracteres = 0;

    if (upper.checked) totalCaracteres += caracteres.upper.length;
    if (lower.checked) totalCaracteres += caracteres.lower.length;
    if (numbers.checked) totalCaracteres += caracteres.numbers.length;
    if (symbols.checked) totalCaracteres += caracteres.symbols.length;

    const bits = Math.floor(
        calcularBits(Number(longitud.value), totalCaracteres)
    );

    // Muestra el nivel de fuerza correspondiente al cálculo.
    if (bits < 28) {
        strengthLabel.textContent = 'Muy débil';
        strengthLabel.className = 'text-xs font-semibold text-red-500';
    } else if (bits < 36) {
        strengthLabel.textContent = 'Débil';
        strengthLabel.className = 'text-xs font-semibold text-orange-500';
    } else if (bits < 60) {
        strengthLabel.textContent = 'Aceptable';
        strengthLabel.className = 'text-xs font-semibold text-yellow-500';
    } else if (bits < 128) {
        strengthLabel.textContent = 'Fuerte';
        strengthLabel.className = 'text-xs font-semibold text-green-400';
    } else {
        strengthLabel.textContent = 'Muy fuerte';
        strengthLabel.className = 'text-xs font-semibold text-blue-600';
    }
}

// Inicializa la contraseña, el valor de la longitud y su fuerza.
espacioContra.textContent = generarPassword(longitud.value);
sliderValue.textContent = longitud.value;
actualizarFuerzaPassword();


longitud.addEventListener('input', () => {
    // Actualiza la contraseña y la fuerza cuando cambia la longitud.
    sliderValue.textContent = longitud.value;
    espacioContra.textContent = generarPassword(longitud.value);
    actualizarFuerzaPassword();
});

const tipos = [upper, lower, numbers, symbols];

tipos.forEach(tipo => {
    tipo.addEventListener('change', () => {
        // Impide que el usuario desmarque todos los grupos.
        if (!tipos.some(opcion => opcion.checked)) {
            tipo.checked = true;
        } else {
            espacioContra.textContent = generarPassword(longitud.value);
            actualizarFuerzaPassword();
        }
        
    });
});

// Genera una contraseña nueva al pulsar el botón.
btnGenerar.addEventListener('click', () => {
    const password = generarPassword(longitud.value);
    espacioContra.textContent = password;
    actualizarFuerzaPassword();
});

// Copia la contraseña generada al portapapeles.
copyButton.addEventListener('click', () => {
    const password = espacioContra.textContent;
    navigator.clipboard.writeText(password);
    
});
