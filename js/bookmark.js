const BOOKMARK_KEY = "tmdb:bookmarks";

// 로컬스토리지에서 북마크 데이터 반환
export function loadBookmarks() {
  return new Map(
    Object.entries(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "{}"))
  );
}

// 북마크 데이터를 로컬스토리지에 저장
function saveBookmarks(data) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Object.fromEntries(data)));
}

// 영화의 북마크 여부 확인
export function isBookmarked(id) {
  return loadBookmarks().has(String(id));
}

// 북마크 상태 토글 (정보 저장 or 삭제)
export function toggleBookmark(detail) {
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
