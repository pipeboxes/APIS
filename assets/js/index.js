const formulario = document.querySelector("#formulario");
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    convertirValor();
    formulario.reset();
});

const convertirValor = async function () {
    try {
        const valor = Number(document.querySelector("#valor").value);
        const moneda = document.querySelector("#moneda").value.toLowerCase();
        if (valor && moneda !== "sin seleccion") {
            const respuesta = await obtenerDatos(moneda);
            const valorApi = respuesta.serie[0].valor;
            const dias = respuesta.serie.map(d => d.fecha.split("T", 1)[0]).slice(0, 10).reverse();
            const valores = respuesta.serie.map(v => v.valor).slice(0, 10).reverse();

            await mostrarConversion(valor, valorApi, moneda);
            await renderizarGrafico(dias, valores, moneda);
        } else {
            alert("Debe ingresar un valor y seleccionar una moneda");
        }
    } catch (error) {
        alert("Error al obtener los datos");
    }
};

async function obtenerDatos(moneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!res.ok) {
            throw new Error("Error al obtener datos desde la API");
        }
        return await res.json();
    } catch (error) {
        const offlineResponse = await fetch('./res-offline.json');
        return await offlineResponse.json();
    }
}

async function mostrarConversion(valorUsuario, valorApi, moneda) {
    const valorConvertido = (valorUsuario / valorApi).toFixed(2);
    const etiquetaMoneda = valorConvertido >= 2 ? moneda === 'euro' ? 'euros' : 'dólares' : moneda;

    document.querySelector("#resultado").textContent = `El valor convertido es: ${valorConvertido} ${etiquetaMoneda}`;
}

let grafico;
async function renderizarGrafico(dias, valores, moneda) {
    const ctx = document.getElementById("grafico");

    if (grafico) {
        grafico.destroy();
    }

    const coloresPuntos = [
        "red", "orange", "yellow", "green", "blue", 
        "indigo", "violet", "purple", "pink", "cyan"
    ];

    grafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: dias,
            datasets: [
                {
                    label: `Valor del ${moneda} en los últimos 10 días`,
                    data: valores,
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    borderColor: "rgb(0, 0, 0)",
                    pointBackgroundColor: coloresPuntos,
                    borderWidth: 2,
                    pointRadius: 8,
                },
            ],
        },
    });
}