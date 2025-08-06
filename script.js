
let currentIndex = 0;
const batchSize = 20;
let ranking = [];

function contarAcertos(participante, resultados) {
  const numerosAcertadosUnicos = new Set();

  resultados.forEach((resultado) => {
    if (resultado.concurso >= participante.inicioConcurso) {
      resultado.numeros.forEach(num => {
        if (participante.numeros.includes(num)) {
          numerosAcertadosUnicos.add(num);
        }
      });
    }
  });

  return {
    totalAcertos: numerosAcertadosUnicos.size,
    acertouOs10: numerosAcertadosUnicos.size === 10,
    acertosUnicos: Array.from(numerosAcertadosUnicos)
  };
}

function formatarNumero(num) {
  return num.toString().padStart(2, '0');
}

function gerarRanking() {
  const rankingDiv = document.getElementById("ranking");
  rankingDiv.innerHTML = "";

  if (typeof participantes === 'undefined' || participantes.length === 0) {
    rankingDiv.innerHTML = `
      <div class="alert alert-info text-center">
        Ainda não existe dados para visualização.<br>Aguardar atualização.
      </div>`;
    return;
  }

  ranking = participantes.map(participante => {
    const { totalAcertos, acertouOs10, acertosUnicos } = contarAcertos(participante, resultados);
    return {
      nome: participante.nome,
      numeros: participante.numeros,
      inicioConcurso: participante.inicioConcurso,
      totalAcertos,
      acertouOs10,
      acertosUnicos
    };
  }).sort((a, b) => b.totalAcertos - a.totalAcertos);

  if (ranking.length === 0) {
    rankingDiv.innerHTML = `
      <div class="alert alert-info text-center">
        Ainda não existe dados para visualização.<br>Aguardar atualização.
      </div>`;
    return;
  }

  currentIndex = 0;
  renderizarProximoLote();
}

function renderizarProximoLote() {
  const rankingDiv = document.getElementById("ranking");
  const loader = document.getElementById("loader");
  if (currentIndex >= ranking.length) return;

  if (loader) loader.style.display = "block";

  setTimeout(() => {
    for (let i = currentIndex; i < currentIndex + batchSize && i < ranking.length; i++) {
      const item = ranking[i];
      const div = document.createElement("div");
      div.className = "participante mb-3 p-3 border rounded bg-light shadow-sm";

      const numerosHTML = item.numeros.map(num => {
        const acertou = item.acertosUnicos.includes(num);
        return `<span class="numero${acertou ? ' acertado' : ''}">${formatarNumero(num)}</span>`;
      }).join(" ");

      div.innerHTML = `
        <h5><strong>${i + 1}. ${item.nome}</strong></h5>
        <p class="mb-1">Números escolhidos: ${numerosHTML}</p>
        <p class="mb-1">
          Início: <strong>${item.inicioConcurso}</strong>
          <span title="Concurso inicial para esse apostador" style="cursor: help; color: #888; font-weight: bold;">&#x003F;</span>
        </p>
        <p class="mb-0">Total de acertos: <strong>${item.totalAcertos}</strong> ${item.acertouOs10 ? "🎯 <span class='badge bg-success'>ACERTOU OS 10!</span>" : ""}</p>
      `;
      rankingDiv.appendChild(div);
    }

    currentIndex += batchSize;
    if (loader) loader.style.display = "none";
  }, 300);
}

function mostrarConcursos() {
  const concursosDiv = document.getElementById("concursos");
  concursosDiv.innerHTML = "";

  if (typeof resultados === 'undefined' || resultados.length === 0) return;

  resultados.forEach((resultado) => {
    const numerosFormatados = resultado.numeros.map(formatarNumero).join(", ");
    const div = document.createElement("div");
    div.className = "concurso mb-3 p-3 border rounded bg-white shadow-sm";
    div.innerHTML = `
      <h6><strong>Concurso ${resultado.concurso}</strong></h6>
      <p class="mb-0">Números sorteados: <span class="text-success">${numerosFormatados}</span></p>
    `;
    concursosDiv.appendChild(div);
  });
}

function buscarParticipante() {
  const input = document.getElementById("buscarNome").value.toLowerCase().trim();
  const resultadoDiv = document.getElementById("resultadoBusca");
  const posicao = ranking.findIndex(p => p.nome.toLowerCase() === input);

  if (posicao !== -1) {
    resultadoDiv.innerHTML = `<div class="alert alert-success mt-2">👤 ${ranking[posicao].nome} está na <strong>${posicao + 1}ª posição</strong> do ranking.</div>`;
  } else {
    resultadoDiv.innerHTML = `<div class="alert alert-warning mt-2">Nome não encontrado. Verifique a grafia.</div>`;
  }
}

// Estilo extra para os números
const estilo = document.createElement("style");
estilo.innerHTML = `
  .numero {
    display: inline-block;
    margin: 2px;
    padding: 6px 10px;
    border-radius: 50%;
    background: #e9ecef;
    color: #333;
    font-weight: bold;
    min-width: 36px;
    text-align: center;
  }
  .numero.acertado {
    border: 2px solid #90ee90;
    background: #d4edda;
    color: #155724;
  }
`;
document.head.appendChild(estilo);

// Scroll infinito
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const innerHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;

  if (scrollY + innerHeight >= bodyHeight - 100) {
    renderizarProximoLote();
  }
});

gerarRanking();
mostrarConcursos();
