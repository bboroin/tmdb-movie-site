import { API_KEY } from "../config.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const movieData = new Map();

const BOOKMARK_KEY = "tmdb:bookmarks";
let currentBookmark = null;

function loadBookmarks() {
  return new Map(
    Object.entries(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "{}"))
  );
}

function saveBookmarks(data) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Object.fromEntries(data)));
}

function isBookmarked(id) {
  return loadBookmarks().has(String(id));
}

function toggleBookmark(detail) {
  const bookmarks = loadBookmarks();
  const movieId = String(detail.id);
  let on;
  if (bookmarks.has(movieId)) {
    bookmarks.delete(movieId);
    on = false;
  } else {
    bookmarks.set(movieId, {
      id: detail.id,
      title: detail.title,
      poster_path: detail.poster_path,
      overview: detail.overview,
    });
    on = true;
  }
  saveBookmarks(bookmarks);
  return on;
}

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
    movieData.set(String(movie.id), {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      overview: movie.overview,
    });
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = movie.id;
    const on = isBookmarked(movie.id);

    card.innerHTML = `
      <button 
        class="card-bookmark ${on ? "on" : ""}" 
        aria-pressed="${on}" 
        aria-label="북마크"
        data-id="${movie.id}"
      >
        <svg class="icon" viewBox="0 0 24 24" width="48" height="48">
          <path d="M6 4v16l6-4 6 4V4z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      <div class="card-img">
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${
      movie.title
    }" />
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
  const bookmarkBtn = e.target.closest(".card-bookmark");
  if (bookmarkBtn) {
    e.stopPropagation();
    const id = String(bookmarkBtn.dataset.id);
    const detail = movieData.get(id);
    if (!detail) return;

    const on = toggleBookmark(detail);
    bookmarkBtn.classList.toggle("on", on);
    bookmarkBtn.setAttribute("aria-pressed", String(on));
    return;
  }

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

const popularTab = document.getElementById("popular");
const bookmarkTab = document.getElementById("bookmark");

popularTab.addEventListener("click", () => {
  popularTab.classList.add("active");
  bookmarkTab.classList.remove("active");
  getPopularMovie();
});

bookmarkTab.addEventListener("click", () => {
  bookmarkTab.classList.add("active");
  popularTab.classList.remove("active");

  const bookmarks = loadBookmarks();
  const movies = Array.from(bookmarks.values());

  renderMovies(movies);
});
