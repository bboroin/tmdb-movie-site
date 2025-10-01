import { API_KEY } from "../config.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

// 인기 영화 목록
export async function fetchPopularMovies() {
  const response = await fetch(
    "https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=1",
    options
  );
  const data = await response.json();
  return data.results ?? [];
}

// 영화 검색
export async function fetchSearchMovies(query) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      query
    )}&language=ko-KR&page=1`,
    options
  );
  const data = await response.json();
  return data.results ?? [];
}

// 영화 상세 정보
export async function fetchMovieDetail(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?language=ko-KR`,
    options
  );
  return response.json();
}
