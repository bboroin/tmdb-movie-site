import { API_KEY } from "../config.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function renderMovies(movies) {
  const cardList = document.getElementById("card-list");
  const message = document.getElementById("message");
  cardList.innerHTML = "";
  message.textContent = "";

  if (!movies || movies.length === 0) {
    message.textContent = "검색 결과가 없습니다.";
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = movie.id;

    card.innerHTML = `
      <div class="card-img">
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" />
      </div>
      <div class="card-title">${movie.title}</div>
      <div class="card-description">${movie.overview}</div>
    `;

    cardList.appendChild(card);
  });
}

async function getPopularMovie() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=1",
      options
    );
    const data = await response.json();
    renderMovies(data.results);
  } catch (error) {
    console.log(error);
  }
}

async function searchMovie(query) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&language=ko-KR&page=1`,
      options
    );
    const data = await response.json();
    renderMovies(data.results);
  } catch (error) {
    console.log(error);
  }
}

getPopularMovie();

document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search-input").value.trim();
  if (query) searchMovie(query);
});

document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.trim();
    if (query) searchMovie(query);
  }
});

const cardList = document.getElementById("card-list");
cardList.addEventListener("click", async (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const movieId = card.dataset.id;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=ko-KR`,
      options
    );
    const detail = await res.json();

    openModal(detail);
  } catch (err) {
    console.error(err);
  }
});

function openModal(detail) {
  const modal = document.getElementById("modal");
  const title = document.getElementById("modal-title");
  const desc = document.getElementById("modal-description");
  const poster = document.getElementById("modal-poster");
  const meta = document.getElementById("modal-meta");

  title.textContent = detail.title;
  poster.src = `https://image.tmdb.org/t/p/w500/${detail.poster_path}`;
  poster.alt = detail.title;

  meta.innerHTML = `
    <span class="meta-tag">⭐ ${
      Math.round(detail.vote_average * 10) / 10
    }</span>
    <span class="meta-tag">📅 ${detail.release_date}</span>
    <span class="meta-tag">⏱️ ${detail.runtime}분</span>
    <span class="meta-tag">🏷️ ${detail.genres
      .map((g) => g.name)
      .join(", ")}</span>
  `;

  desc.innerHTML = `${detail.overview || "없음"}`;
  modal.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});
