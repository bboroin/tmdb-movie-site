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
      "https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=1",
      options
    );
    const data = await response.json();
    data.results.forEach((movie) => {
      console.log(movie.title);
    });
  } catch (error) {
    console.log(error);
  }
}
getPopularMovie();
