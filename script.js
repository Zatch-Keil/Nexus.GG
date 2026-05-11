const API_KEY = "d18da697a5674bfba690c73e114c9ae4"
const BASE_URL = "https://api.rawg.io/api"

async function getTrendingGames() {
  const response = await fetch(BASE_URL + "/games?key=" + API_KEY + "&ordering=-rating&page_size=8")
  const data = await response.json()
  afficherCards(data.results, "trending-games")
}

async function getUpcomingGames() {
  const today = new Date().toISOString().split("T")[0]
  const response = await fetch(BASE_URL + "/games?key=" + API_KEY + "&dates=" + today + ",2026-12-31&ordering=-added&page_size=6")
  const data = await response.json()
  afficherUpcoming(data.results, "upcoming-games")
}

async function getCatalogueGames() {
  const response = await fetch(BASE_URL + "/games?key=" + API_KEY + "&ordering=-rating&page_size=12")
  const data = await response.json()
  afficherCards(data.results, "all-games")
}

function afficherCards(jeux, idConteneur) {
  const conteneur = document.getElementById(idConteneur)
  if (!conteneur) return

  conteneur.innerHTML = ""

  jeux.forEach(function(jeu) {
    const card = document.createElement("div")
    card.classList.add("card")

    const img = document.createElement("img")
    img.classList.add("card-img")
    img.src = jeu.background_image || "img/placeholder.jpg"
    img.alt = jeu.name

    const body = document.createElement("div")
    body.classList.add("card-body")

    const titre = document.createElement("p")
    titre.classList.add("card-title")
    titre.textContent = jeu.name

    const genre = document.createElement("p")
    genre.classList.add("card-genre")
    genre.textContent = jeu.genres ? jeu.genres.map(function(g) { return g.name }).join(" · ") : "—"

    const footer = document.createElement("div")
    footer.classList.add("card-footer")

    const rating = document.createElement("span")
    rating.classList.add("rating")
    rating.textContent = "★ " + jeu.rating

    const plateforme = document.createElement("span")
    plateforme.classList.add("platform-tag")
    plateforme.textContent = jeu.platforms ? jeu.platforms[0].platform.name : "Multi"

    footer.appendChild(rating)
    footer.appendChild(plateforme)
    body.appendChild(titre)
    body.appendChild(genre)
    body.appendChild(footer)
    card.appendChild(img)
    card.appendChild(body)

    card.addEventListener("click", function() {
      window.location.href = "detail.html?id=" + jeu.id
    })

    conteneur.appendChild(card)
  })
}

function afficherUpcoming(jeux, idConteneur) {
  const conteneur = document.getElementById(idConteneur)
  if (!conteneur) return

  conteneur.innerHTML = ""

  jeux.forEach(function(jeu) {
    const card = document.createElement("div")
    card.classList.add("upcoming-card")

    const img = document.createElement("img")
    img.classList.add("upcoming-img")
    img.src = jeu.background_image || "img/placeholder.jpg"
    img.alt = jeu.name

    const info = document.createElement("div")
    info.classList.add("upcoming-info")

    const titre = document.createElement("p")
    titre.classList.add("card-title")
    titre.textContent = jeu.name

    const date = document.createElement("p")
    date.classList.add("upcoming-date")
    date.textContent = jeu.released || "Date à confirmer"

    info.appendChild(titre)
    info.appendChild(date)
    card.appendChild(img)
    card.appendChild(info)

    conteneur.appendChild(card)
  })
}

async function getDetailJeu() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get("id")
  if (!id) return

  const response = await fetch(BASE_URL + "/games/" + id + "?key=" + API_KEY)
  const jeu = await response.json()

  document.getElementById("game-title").textContent = jeu.name
  document.getElementById("game-studio").textContent = (jeu.developers && jeu.developers[0] ? jeu.developers[0].name : "—") + " · " + (jeu.released || "—")
  document.getElementById("game-synopsis").textContent = jeu.description_raw
  document.getElementById("game-rating").textContent = jeu.rating
  document.getElementById("game-date").textContent = jeu.released
  document.getElementById("game-genre").textContent = jeu.genres ? jeu.genres.map(function(g) { return g.name }).join(" / ") : "—"
  document.getElementById("game-platforms").textContent = jeu.platforms ? jeu.platforms.map(function(p) { return p.platform.name }).join(" · ") : "—"

  getScreenshots(id)
  getTrailer(id)
}

async function getTrailer(id) {
  const response = await fetch(BASE_URL + "/games/" + id + "/movies?key=" + API_KEY)
  const data = await response.json()

  const trailerBox = document.querySelector(".trailer-box")
  if (!trailerBox) return

  // Si RAWG a un trailer pour ce jeu
  if (data.results && data.results.length > 0) {
    const urlTrailer = data.results[0].data.max

    // On remplace la trailer-box par une vraie vidéo
    trailerBox.innerHTML = ""
    const video = document.createElement("video")
    video.src = urlTrailer
    video.controls = true
    video.style.width = "100%"
    video.style.height = "100%"
    video.style.borderRadius = "8px"
    trailerBox.appendChild(video)

  } else {
    // Pas de trailer RAWG — on cherche sur YouTube
    const nomJeu = document.getElementById("game-title").textContent
    const urlYoutube = "https://www.youtube.com/results?search_query=" + encodeURIComponent(nomJeu + " official trailer")

    trailerBox.style.cursor = "pointer"
    trailerBox.innerHTML = "▶ Voir le trailer sur YouTube"
    trailerBox.addEventListener("click", function() {
      window.open(urlYoutube, "_blank")
    })
  }
}

async function getScreenshots(id) {
  const response = await fetch(BASE_URL + "/games/" + id + "/screenshots?key=" + API_KEY)
  const data = await response.json()
  const conteneur = document.getElementById("game-screenshots")
  if (!conteneur) return

  data.results.slice(0, 3).forEach(function(screen) {
    const img = document.createElement("img")
    img.src = screen.image
    img.alt = "Screenshot"
    conteneur.appendChild(img)
  })
}

function initSearch() {
  const input = document.querySelector(".search")
  if (!input) return

  input.addEventListener("keypress", async function(e) {
    if (e.key === "Enter") {
      const query = input.value.trim()
      if (!query) return

      const response = await fetch(BASE_URL + "/games?key=" + API_KEY + "&search=" + query + "&page_size=12")
      const data = await response.json()
      afficherCards(data.results, "all-games")
    }
  })
}

document.addEventListener("DOMContentLoaded", function() {

  if (document.getElementById("trending-games")) {
    getTrendingGames()
    getUpcomingGames()
  }

  if (document.getElementById("all-games")) {
    getCatalogueGames()
    initSearch()
  }

  if (document.getElementById("game-title")) {
    getDetailJeu()
  }

})