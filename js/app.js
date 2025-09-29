import { API_KEY } from "../config.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

async function getPopularMovie() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
      options
    );
    const data = await response.json();

    const cardList = document.getElementById("card-list");

    data.results.forEach((movie) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <div class="card-average">⭐${movie.vote_average}</div>
        <div class="card-img">
          <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" />
        </div>
        <div class="card-title">${movie.title}</div>
        <div class="card-description">${movie.overview}</div>
      `;
      cardList.appendChild(card);
    });
  } catch (error) {
    console.log(error);
  }
}
getPopularMovie();
