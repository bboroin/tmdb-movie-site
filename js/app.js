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

    card.innerHTML = `
      <div class="card-img">
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${
      movie.title
    }" />
      </div>
      <div class="card-title">${movie.title}</div>
      <div class="card-average">⭐${
        Math.round(movie.vote_average * 10) / 10
      }</div>
      <div class="card-description">${movie.overview}</div>
    `;

    cardList.appendChild(card);
  });
}

async function getPopularMovie() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
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
      )}&language=en-US&page=1`,
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
