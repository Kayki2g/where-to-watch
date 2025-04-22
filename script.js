const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const results = document.getElementById("results");

const OMDB_API_KEY = "e599359c";
const WATCHMODE_API_KEY = "V5EWhm7y6uJ2EqylKBMip2Afy9tddByJM8U64pOW";

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    buscarFilmes(query);
  }
});

function buscarFilmes(titulo) {
  results.innerHTML = "<p>🔍 Buscando...</p>";

  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(titulo)}&apikey=${OMDB_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        results.innerHTML = "";
        data.Search.forEach(filme => {
          exibirFilme(filme);
          buscarStreaming(filme.imdbID, filme.Title);
        });
      } else {
        results.innerHTML = `<p>❌ Nenhum filme ou série encontrado.</p>`;
      }
    })
    .catch(() => {
      results.innerHTML = `<p>⚠️ Erro ao buscar dados.</p>`;
    });
}

function exibirFilme(filme) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
      <img src="${filme.Poster !== "N/A" ? filme.Poster : 'https://via.placeholder.com/200x300?text=Sem+Imagem'}" alt="${filme.Title}" />
      <h3>${filme.Title} (${filme.Year})</h3>
      <div id="ondeAssistir-${filme.imdbID}"></div>
  `;
  results.appendChild(card);
}

function buscarStreaming(imdbID, titulo) {
  fetch(`https://api.watchmode.com/v1/search/?search_field=imdb_id&search_value=${imdbID}&apiKey=${WATCHMODE_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.title_results && data.title_results.length > 0) {
        const id = data.title_results[0].id;
        fetch(`https://api.watchmode.com/v1/title/${id}/sources/?apiKey=${WATCHMODE_API_KEY}`)
          .then(res => res.json())
          .then(fontes => {
            const container = document.getElementById(`ondeAssistir-${imdbID}`);
            const unicos = [...new Map(fontes.map(item => [item.name, item])).values()];

            if (unicos.length > 0) {
              container.innerHTML = `<p><strong>Disponível em:</strong></p>
                <div>
                  ${unicos.map(f => `
                    <a href="${f.web_url}" target="_blank">${f.name}</a>
                  `).join(' | ')}
                </div>`;
            } else {
              container.innerHTML = `<p>❌ Nenhuma plataforma encontrada para "${titulo}".</p>`;
            }
          });
      }
    });
}
