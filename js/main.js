import {
  fetchPopularMovies,
  fetchSearchMovies,
  fetchMovieDetail,
} from "./tmdb.js";
import { loadBookmarks, isBookmarked, toggleBookmark } from "./bookmarks.js";

const movieData = new Map();

// 첫 화면 로딩
loadInitialMovies();

async function loadInitialMovies() {
  try {
    const movies = await fetchPopularMovies();
    renderMovies(movies);
  } catch (e) {
    console.error(e);
  }
}

// 영화 검색
document.getElementById("search-btn").addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;
  const movies = await fetchSearchMovies(query);
  renderMovies(movies);
});

document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("search-btn").click();
  }
});

// 영화 카드 목록 렌더링
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

// 영화 카드 : 이벤트 위임
const cardList = document.getElementById("card-list");
cardList.addEventListener("click", async (e) => {
  // 북마크 선택
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

  // 카드 선택
  const card = e.target.closest(".card");
  if (!card) return;
  const detail = await fetchMovieDetail(card.dataset.id);
  openModal(detail);
});

// 모달창 열기
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

// 모달창 닫기
document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

// 탭 전환
const popularTab = document.getElementById("popular");
const bookmarkTab = document.getElementById("bookmark");

popularTab.addEventListener("click", async () => {
  popularTab.classList.add("active");
  bookmarkTab.classList.remove("active");
  const movies = await fetchPopularMovies();
  renderMovies(movies);
});

bookmarkTab.addEventListener("click", () => {
  bookmarkTab.classList.add("active");
  popularTab.classList.remove("active");

  const bookmarks = loadBookmarks();
  const movies = Array.from(bookmarks.values());

  renderMovies(movies);
});
