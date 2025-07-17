const API_KEY = "f830b16357308619485ba441fce2e92a";

// 🔍 Busca manual por cidade
document.getElementById("buscarBtn").addEventListener("click", () => {
  const cidade = document.getElementById("cidade").value.trim();
  if (!cidade) {
    alert("Digite uma cidade!");
    return;
  }
  buscarClima(cidade);
  buscarPrevisao(cidade);
});

// 📍 Detecta localização ao carregar
window.addEventListener("load", detectarLocalizacao);

// 🌙 Alterna modo escuro
document.getElementById("toggleTema").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const botao = document.getElementById("toggleTema");
  botao.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Modo Claro"
    : "🌙 Modo Escuro";
});

// ✨ Inicializa AOS
AOS.init();

// 🌍 Geolocalização
function detectarLocalizacao() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const lat = posicao.coords.latitude;
        const lon = posicao.coords.longitude;
        buscarClimaPorCoordenadas(lat, lon);
        buscarPrevisaoPorCoordenadas(lat, lon);
      },
      (erro) => {
        console.warn("Geolocalização negada:", erro.message);
      }
    );
  }
}

// 🔧 Clima atual por nome
function buscarClima(cidade) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        alert(`Erro: ${data.message}`);
        return;
      }
      mostrarDados(data);
    });
}

// 🔧 Clima atual por coordenadas
function buscarClimaPorCoordenadas(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        alert(`Erro: ${data.message}`);
        return;
      }
      mostrarDados(data);
    });
}

// 📊 Exibe dados e gráfico
function mostrarDados(data) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const container = document.getElementById("dadosClima");
  container.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="${iconUrl}" alt="Clima" />
    <p>🌡️ ${data.main.temp}°C</p>
    <p>💧 Umidade: ${data.main.humidity}%</p>
    <p>🌬️ Vento: ${data.wind.speed} km/h</p>
    <p>☁️ Condição: ${data.weather[0].description}</p>
  `;

  const ctx = document.getElementById("graficoTemperatura").getContext("2d");
  if (window.graficoTemp) window.graficoTemp.destroy();

  window.graficoTemp = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Temperatura Atual"],
      datasets: [{
        label: "°C",
        data: [data.main.temp],
        backgroundColor: "#4a90e2"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// 🔧 Previsão por nome
function buscarPrevisao(cidade) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") {
        console.error("Erro na previsão:", data.message);
        return;
      }
      const dias = filtrarDias(data.list);
      mostrarPrevisao(dias);
    });
}

// 🔧 Previsão por coordenadas
function buscarPrevisaoPorCoordenadas(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") {
        console.error("Erro na previsão:", data.message);
        return;
      }
      const dias = filtrarDias(data.list);
      mostrarPrevisao(dias);
    });
}

// 🔍 Filtra 1 previsão por dia (meio-dia)
function filtrarDias(lista) {
  const diasFiltrados = [];
  const usados = new Set();

  lista.forEach(item => {
    const data = new Date(item.dt_txt);
    const hora = data.getHours();
    const dia = data.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "numeric" });

    if (hora === 12 && !usados.has(dia)) {
      usados.add(dia);
      diasFiltrados.push(item);
    }
  });

  return diasFiltrados;
}

// 📆 Exibe os dias na tela
function mostrarPrevisao(dias) {
  const container = document.getElementById("diasContainer");
  container.innerHTML = "";

  dias.forEach(item => {
    const data = new Date(item.dt_txt);
    const dia = data.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "numeric" });
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    const card = document.createElement("div");
    card.className = "dia";
    card.innerHTML = `
      <h3>${dia}</h3>
      <img src="${iconUrl}" alt="Clima" />
      <p>🌡️ ${item.main.temp_min.toFixed(1)}°C - ${item.main.temp_max.toFixed(1)}°C</p>
      <p>${item.weather[0].description}</p>
    `;
    container.appendChild(card);
  });
}
